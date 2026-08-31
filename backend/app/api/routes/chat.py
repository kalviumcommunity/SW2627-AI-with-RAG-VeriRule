"""Chat API route — streaming SSE endpoint for the Compliance Chat Assistant."""

from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from app.schemas.chat import ChatRequest
from app.services.chat_service import stream_chat

router = APIRouter()


@router.post("/stream")
def chat_stream(request: ChatRequest) -> StreamingResponse:
    """
    Stream a grounded compliance answer as Server-Sent Events.

    Each SSE event has the shape:
        data: {"type": "token"|"sources"|"done"|"error", "data": "..."}

    - **token**: incremental text fragment of the AI answer
    - **sources**: JSON array of ChatSource objects used to ground the answer
    - **done**: signals the stream is complete
    - **error**: signals a fatal error
    """
    return StreamingResponse(
        stream_chat(request),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",  # Disable nginx buffering for SSE
            "Connection": "keep-alive",
        },
    )
