# VeriRule — AI-Powered Compliance & Transaction Rule Verification Engine

VeriRule is an enterprise AI-powered **RAG & Regulatory Conflict Resolution Platform** built for bank risk officers, compliance managers, and internal audit teams. It instantly identifies the **single currently active governing rule** for any banking transaction scenario, flags superseded historical guidance with explicit source citations, and provides audit-ready decision proof.

---

## 🎯 Problem Statement

> A large bank maintains compliance circulars, internal audit reports, and regulatory updates, but risk officers cannot quickly confirm which current rule governs a transaction without reading through conflicting historical documents.

---

## 💡 Solution Architecture & Key Features

VeriRule addresses this exact problem with a 5-pillar compliance architecture:

### 1. 🎯 Transaction Rule Verifier & Conflict Resolver (`/dashboard/rule-verifier`)
- **Transaction Scenario Engine**: Select from pre-configured high-risk transaction scenarios or input natural language criteria.
- **Active Governing Rule Isolation**: Highlights the current Master Direction clause, section, authority tag, and effective date.
- **Superseded Guidance Warning**: Explicit red/amber alert highlighting obsolete historical circulars so officers never rely on outdated rules.
- **Internal Audit Report Cross-Reference**: Linked internal audit findings and mandated controls.
- **Cryptographic Decision Proof Certificate**: Generates downloadable JSON compliance certificates signed with SHA-256 hash for internal audit defense.

### 2. 📅 Rule Supersession Timeline (`/dashboard/rule-timeline`)
- Interactive visual timeline tracing how regulatory rules evolved over time (e.g., *RBI 2016 Baseline → 2019 Advisory → 2023 Master Direction*).
- Color-coded node graph with expandable rule passages and supersession chain links.

### 3. ⚡ AI Grounded Query Engine (`/dashboard/query-engine`)
- RAG search engine returning evidence-backed answers with confidence scores.
- Insufficient Evidence Guard: Warns risk officers when the vector repository lacks authoritative proof instead of hallucinating.
- Persistent Session Memory: Query history saved locally across sessions.

### 4. 📁 Document Repository & Vector Ingestion (`/dashboard/documents`)
- Drag-and-drop file ingestion supporting PDF, TXT, MD, and JSON files.
- Chunking & ChromaDB vector store indexing with document inventory table and chunk inspector drawer.

### 5. 🛡️ Audit Trail & Integrity Verification (`/dashboard/audit-trail`)
- Full compliance log ledger recording every transaction check, query, and document upload.
- SHA-256 cryptographic verification drawer and CSV/JSON audit export.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite, React Router v6, Vanilla CSS (Design Tokens & Glassmorphism UI)
- **Backend API**: Python 3.11+, FastAPI, Pydantic v2, Uvicorn
- **Vector Database**: ChromaDB (`chromadb.PersistentClient`) with cosine similarity metric
- **State & Auth**: React AuthContext with persistent `localStorage` session handling
- **Audit & Cryptography**: SHA-256 hashing for tamper-proof compliance logs

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js v18+ & npm
- Python 3.10+

### 2. Backend Setup
```bash
cd backend
py -m venv venv
# On Windows:
.\venv\Scripts\activate
pip install -r requirements.txt
py -m uvicorn app.main:app --port 8000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📸 Core Screenshots & Workflow

```text
               User Transaction Query / Scenario
                              ↓
              Document Retrieval (ChromaDB RAG)
                              ↓
        Metadata Evaluation (Active vs Superseded Check)
                              ↓
      ┌───────────────────────┴───────────────────────┐
      ↓                                               ↓
Active Governing Rule                           Superseded Warning
(Green Card + Clause)                           (Red Card + Obsolete Text)
      └───────────────────────┬───────────────────────┘
                              ↓
                 Decision Proof Certificate
                  (SHA-256 Hash + Audit Log)
```

---

## 👥 Team & Project Info

**Sem 7 — Sprint 2 | Team 01**  
**Campus:** Apollo | **Squad:** 61  
**Tagline:** *Find the right rule. Verify the source. Act with confidence.*
