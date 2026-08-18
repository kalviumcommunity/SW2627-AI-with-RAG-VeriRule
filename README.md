# VeriRule — AI-Powered Compliance Assistant

VeriRule is an AI-powered **RAG application** that helps bank risk officers quickly find the **current compliance rule** for a transaction.

## Problem

Banks have many circulars, policies, and regulatory documents. Older rules may be replaced by newer ones, making it difficult to know which rule is currently valid.

## Solution

VeriRule:

* 🔍 Searches compliance documents using natural language.
* 🧠 Uses RAG to retrieve relevant information.
* 📅 Identifies the latest/current rule.
* ⚠️ Detects conflicts between old and new rules.
* 📚 Shows sources and supporting evidence.
* 🛑 Avoids giving answers when there isn't enough evidence.

## Tech Stack

* **Python**
* **Streamlit**
* **LangChain**
* **ChromaDB**
* **Sentence Transformers**
* **Groq / LLM**
* **SQLite**
* **Git & GitHub**

## Basic Flow

```text
User Question
     ↓
Document Retrieval
     ↓
Metadata + Current Rule Check
     ↓
RAG + LLM
     ↓
Answer + Source + Evidence
```

## Team

**Sem 7 — Sprint 2 | Team 01**
**Campus:** Apollo | **Squad:** 61

**Tagline:** *Find the right rule. Verify the source. Act with confidence.* 
