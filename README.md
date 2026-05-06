# Aegis: High-Assurance Procurement Gateway

### 🛡️ Executive Summary
Aegis is an auditable, high-assurance evaluation engine designed for government procurement (CRPF Tender Evaluation), transforming dense PDF submissions into deterministic compliance verdicts with an immutable human-in-the-loop audit trail.

---

### 🏗️ Architecture & High-Assurance Logic

Aegis operates on the principle of **Defensive Programming** and **Visual Grounding**:

1.  **Dual-Pass Normalization Engine**: 
    *   **Pass 1 (Deterministic)**: A Python-based numeric parser extracts raw values from text.
    *   **Pass 2 (Extraction)**: An LLM (Gemini 2.5 Flash) extracts structured evidence and inferred values.
    *   **Cross-Check**: If the Python parser and LLM inferred values differ beyond a minimal tolerance, the system flags the result as `LLM_PYTHON_MISMATCH`.

2.  **Proximity & Ambiguity Flagging**:
    *   If a context sentence contains multiple distinct monetary values (e.g., "Group Turnover vs. Standalone Turnover"), the system automatically flags the result as `PROXIMITY_REVIEW_REQUIRED`, forcing a manual officer review.

3.  **Immutable Audit Ledger**:
    *   All evaluation results and human overrides are stored in a PostgreSQL **append-only** table.
    *   Overrides require a mandatory justification (min. 10 chars) to maintain a transparent chain of custody.

4.  **Visual Grounding**:
    *   The frontend (Next.js) maps PyMuPDF bounding boxes to the UI, allowing officers to verify extraction results directly against the original immutable PDF.

---

### 🚀 Local Execution (Zero-Latency)

**Prerequisites**: Docker, Python 3.11+, `uv` package manager.

1.  **Spin up Infrastructure**:
    ```bash
    docker-compose up -d
    ```

2.  **Synchronize Database**:
    ```bash
    uv run alembic upgrade head
    ```

3.  **Launch Backend (FastAPI)**:
    ```bash
    uv run uvicorn app.main:app --reload
    ```

4.  **Launch Frontend (Next.js)**:
    ```bash
    cd aegis-ui
    npm install
    npm run dev
    ```

---

### 🧪 Demo Sandbox Guide

Use the provided files in `tests/mock_data/` for a perfect 5-minute demo:

1.  **Tender_CRPF_01.pdf**: Ingest first to establish ₹5 Cr turnover and ISO 9001 requirements.
2.  **Vendor_A_ClearPass.pdf**: Demonstrates a perfect "PASS" state.
3.  **Vendor_B_ClearFail.pdf**: Demonstrates an automated "FAIL" on the turnover threshold.
4.  **Vendor_C_Ambiguous.pdf**: Triggers the `MANUAL_REVIEW_REQUIRED` state due to the proximity of "Group" and "Standalone" turnover values, allowing you to demo the **Override Modal**.

---

### ⚖️ Jury Evaluation Mapping

| Criteria | Aegis Implementation |
| :--- | :--- |
| **Real-World Deployability** | Local Dockerized PostgreSQL + UV deterministic lockfiles. |
| **Auditability** | Append-only Postgres ledger + Mandatory human justification. |
| **Explainability** | Visual grounding (PDF highlighting) of every extracted evidence. |
| **Robustness** | Dual-Pass Cross-Check (Python vs. AI) to eliminate hallucinations. |

---

*Developed for the AI for Bharat Hackathon (Theme 3: CRPF Tender Evaluation).*
