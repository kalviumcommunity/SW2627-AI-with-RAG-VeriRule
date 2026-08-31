"""Chat service: ChromaDB retrieval → grounded LLM synthesis (Gemini) → SSE streaming.

Fallback: if GEMINI_API_KEY is not set, answers using the top retrieved passage
so the feature works out-of-the-box without any API key.
"""

import json
import os
import time
from typing import Generator

from app.schemas.audit import AuditCategory, AuditEventCreate, AuditSeverity
from app.schemas.chat import ChatMessage, ChatRequest, ChatSource, ChatStreamChunk
from app.services.audit_service import get_audit_service
from app.vectorstore.chroma import get_vector_store

_SYSTEM_PROMPT = """\
You are VeriRule, an expert banking compliance assistant.
Your job is to answer compliance questions ONLY using the retrieved regulatory passages provided.
Rules you must follow:
1. Ground every statement in the provided SOURCE PASSAGES — never fabricate rules.
2. If a source is marked SUPERSEDED, explicitly warn the user and cite the active replacement.
3. Use precise regulatory language: document IDs, section numbers, effective dates.
4. If the passages do not contain enough evidence, say so clearly — do not guess.
5. Keep answers concise, decision-ready, and audit-friendly.
6. Format key obligations as bullet points where possible.
""".strip()


def _build_prompt(
    question: str, history: list[ChatMessage], sources: list[ChatSource]
) -> list[dict]:
    """Build the message list to send to the LLM."""
    messages: list[dict] = [{"role": "system", "content": _SYSTEM_PROMPT}]

    # Add conversation history (last 6 turns for context window management)
    for msg in history[-6:]:
        messages.append({"role": msg.role, "content": msg.content})

    # Build grounded context block from retrieved passages
    context_lines = ["=== RETRIEVED REGULATORY SOURCE PASSAGES ==="]
    for i, src in enumerate(sources, 1):
        status_note = (
            " ⚠ SUPERSEDED — DO NOT APPLY AS CURRENT RULE"
            if src.status == "superseded"
            else " ✓ ACTIVE"
        )
        context_lines.append(
            f"\n[SOURCE {i}]{status_note}\n"
            f"Document: {src.document_id} — {src.title}\n"
            f"Authority: {src.authority or 'Unknown'} | Section: {src.section or 'N/A'} | "
            f"Effective: {src.effective_date or 'N/A'} | "
f"Confidence: {round(src.confidence * 100)}%\n"
            f'Passage: "{src.passage}"'
        )
    context_lines.append("\n=== END OF RETRIEVED PASSAGES ===")

    grounded_question = "\n".join(context_lines) + f"\n\nCompliance question: {question}"
    messages.append({"role": "user", "content": grounded_question})
    return messages


def _retrieve_sources(question: str) -> list[ChatSource]:
    """Search ChromaDB for relevant active and superseded chunks."""
    vector_store = get_vector_store()
    threshold = float(os.getenv("RETRIEVAL_DISTANCE_THRESHOLD", "0.40"))

    results: list[ChatSource] = []

    # Search active rules first (higher weight)
    try:
        active_results = vector_store.search(question, n_results=4, where={"status": "active"})
        for r in active_results:
            if float(r["distance"]) <= threshold:
                metadata = r["metadata"]
                confidence = max(0.0, min(1.0, 1 - float(r["distance"])))
                results.append(
                    ChatSource(
                        document_id=str(metadata.get("document_id", "")),
                        title=str(metadata.get("title", "")),
                        document_type=str(metadata.get("document_type", "")),
                        authority=str(metadata.get("authority", "")) or None,
                        section=str(metadata.get("section", "")) or None,
                        status="active",
                        effective_date=str(metadata.get("effective_date", "")) or None,
                        passage=str(r["text"]),
                        confidence=confidence,
                    )
                )
    except Exception:
        pass

    # Also check for relevant superseded docs (for conflict detection)
    try:
        superseded_results = vector_store.search(
            question, n_results=2, where={"status": "superseded"}
        )
        for r in superseded_results:
            if float(r["distance"]) <= threshold - 0.05:  # Slightly stricter for superseded
                metadata = r["metadata"]
                confidence = max(0.0, min(1.0, 1 - float(r["distance"])))
                results.append(
                    ChatSource(
                        document_id=str(metadata.get("document_id", "")),
                        title=str(metadata.get("title", "")),
                        document_type=str(metadata.get("document_type", "")),
                        authority=str(metadata.get("authority", "")) or None,
                        section=str(metadata.get("section", "")) or None,
                        status="superseded",
                        effective_date=str(metadata.get("effective_date", "")) or None,
                        passage=str(r["text"]),
                        confidence=confidence,
                    )
                )
    except Exception:
        pass

    return results


def _fallback_answer(question: str, sources: list[ChatSource]) -> Generator[str, None, None]:
    """Yield a rule-based answer when no LLM is configured."""
    if not sources:
        answer = (
            "The indexed compliance knowledge base does not contain sufficient evidence to answer "
            "this question. Please upload relevant regulatory documents or refine your query."
        )
    else:
        active = [s for s in sources if s.status == "active"]
        superseded = [s for s in sources if s.status == "superseded"]
        primary = active[0] if active else sources[0]

        lines = [f"**Current Governing Rule — {primary.document_id}**\n"]
        lines.append(
            (
    f"_{primary.title}_ "
    f"(Section {primary.section or 'N/A'}, "
    f"Effective {primary.effective_date or 'N/A'})\n"
)
        )
        lines.append(f'> "{primary.passage}"\n')

        if len(active) > 1:
            lines.append("\n**Additional Supporting Sources:**")
            for src in active[1:]:
                lines.append(
                    f'- {src.document_id} ({src.section or "N/A"}): "{src.passage[:120]}..."'
                )

        if superseded:
            lines.append("\n⚠️ **Superseded Guidance Detected — DO NOT APPLY:**")
            for src in superseded:
                lines.append(f"- ~~{src.document_id}~~ — {src.title}")

        answer = "\n".join(lines)

    # Simulate streaming by yielding word by word for UX consistency
    words = answer.split(" ")
    for i, word in enumerate(words):
        yield word + (" " if i < len(words) - 1 else "")
        time.sleep(0.01)


def _gemini_stream(messages: list[dict]) -> Generator[str, None, None]:
    """Stream tokens from the Google Gemini API."""
    try:
        import google.generativeai as genai  # type: ignore

        api_key = os.getenv("GEMINI_API_KEY", "")
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel("gemini-1.5-flash")

        # Convert messages to Gemini format
        system_msg = next((m["content"] for m in messages if m["role"] == "system"), "")
        chat_messages = [m for m in messages if m["role"] != "system"]

        history_gemini = []
        for msg in chat_messages[:-1]:
            history_gemini.append(
                {
                    "role": "user" if msg["role"] == "user" else "model",
                    "parts": [msg["content"]],
                }
            )

        last_user_msg = chat_messages[-1]["content"] if chat_messages else ""

        chat = model.start_chat(history=history_gemini)
        full_prompt = f"{system_msg}\n\n{last_user_msg}" if not history_gemini else last_user_msg

        response = chat.send_message(full_prompt, stream=True)
        for chunk in response:
            if chunk.text:
                yield chunk.text
    except ImportError:
        yield from (
            _fallback_answer.__wrapped__
            if hasattr(_fallback_answer, "__wrapped__")
            else iter(["[Gemini SDK not installed. Run: pip install google-generativeai]"])
        )
    except Exception as exc:
        yield f"[LLM error: {exc}]"


def _openai_stream(messages: list[dict]) -> Generator[str, None, None]:
    """Stream tokens from OpenAI GPT-4o."""
    try:
        from openai import OpenAI  # type: ignore

        client = OpenAI(api_key=os.getenv("OPENAI_API_KEY", ""))
        stream = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,  # type: ignore
            stream=True,
            max_tokens=1024,
        )
        for chunk in stream:
            delta = chunk.choices[0].delta.content if chunk.choices else None
            if delta:
                yield delta
    except ImportError:
        yield "[OpenAI SDK not installed. Run: pip install openai]"
    except Exception as exc:
        yield f"[LLM error: {exc}]"


def stream_chat(request: ChatRequest) -> Generator[str, None, None]:
    """
    Main streaming generator for the chat endpoint.

    Yields Server-Sent Event formatted strings:
      data: {"type": "token", "data": "...text..."}
      data: {"type": "sources", "data": "[...]"}
      data: {"type": "done", "data": ""}
    """
    start_time = time.time()

    # 1. Retrieve grounded sources from ChromaDB
    sources = _retrieve_sources(request.question)

    # 2. Choose LLM backend based on available API keys
    gemini_key = os.getenv("GEMINI_API_KEY", "").strip()
    openai_key = os.getenv("OPENAI_API_KEY", "").strip()

    full_answer_parts: list[str] = []

    if gemini_key:
        messages = _build_prompt(request.question, request.history, sources)
        token_gen = _gemini_stream(messages)
    elif openai_key:
        messages = _build_prompt(request.question, request.history, sources)
        token_gen = _openai_stream(messages)
    else:
        # Fallback: retrieval-only, no LLM key required
        token_gen = _fallback_answer(request.question, sources)

    # 3. Yield token chunks as SSE
    for token in token_gen:
        full_answer_parts.append(token)
        chunk = ChatStreamChunk(type="token", data=token)
        yield f"data: {chunk.model_dump_json()}\n\n"

    # 4. Yield source cards
    sources_data = [s.model_dump_json() for s in sources]
    sources_chunk = ChatStreamChunk(type="sources", data=json.dumps(sources_data))
    yield f"data: {sources_chunk.model_dump_json()}\n\n"

    # 5. Log to audit trail
    try:
        duration_ms = int((time.time() - start_time) * 1000)
        avg_confidence = (
            round(sum(s.confidence for s in sources) / len(sources), 3) if sources else None
        )
        primary_source = next(
            (s for s in sources if s.status == "active"), sources[0] if sources else None
        )

        get_audit_service().log_event(
            AuditEventCreate(
                title=(
    f"Chat Query: {request.question[:60]}"
    f"{'...' if len(request.question) > 60 else ''}"
),
                category=AuditCategory.QUERY,
                severity=AuditSeverity.VERIFIED if sources else AuditSeverity.FLAGGED,
                authority=primary_source.authority if primary_source else None,
                query_text=request.question,
                document_id=primary_source.document_id if primary_source else None,
                document_title=primary_source.title if primary_source else None,
                confidence_score=avg_confidence,
                passage_text=primary_source.passage[:300] if primary_source else None,
                section=primary_source.section if primary_source else None,
                execution_time_ms=duration_ms,
                details=(
                    f"Multi-turn compliance chat (session: {request.session_id}) — "
                    f"{len(sources)} sources retrieved, "
    f"{'LLM-synthesized' if (gemini_key or openai_key) else 'retrieval-only'} "
    "answer."
),
            )
        )
    except Exception:
        pass

    # 6. Signal done
    done_chunk = ChatStreamChunk(type="done", data="")
    yield f"data: {done_chunk.model_dump_json()}\n\n"
