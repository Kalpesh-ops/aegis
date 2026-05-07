# Aegis: High-Assurance Procurement Gateway (Frontend)

This is the official frontend for **Aegis**, built with Next.js 15, Tailwind CSS, and TypeScript. It serves as the human-in-the-loop interface for evaluating government tenders (CRPF) with high auditability.

## Key Features

*   **Split-Screen Verification**: View extracted data alongside the original PDF for pixel-perfect grounding.
*   **Human-in-the-Loop Workflow**: Blocking confirmation screens to ensure officers verify AI extractions.
*   **Audit Trail**: Interface for manual overrides with mandatory justification logging.
*   **Civic-Tech Aesthetics**: A premium, high-contrast interface designed for clarity and reduced eye strain.

## Tech Stack

*   **Framework**: Next.js 15 (App Router)
*   **Styling**: Tailwind CSS
*   **State Management**: React Hooks
*   **PDF Rendering**: `react-pdf` / `pdf.js` for visual coordinate grounding.

## Getting Started

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Environment Variables**:
    Ensure the backend is running and reachable. Configure `NEXT_PUBLIC_API_URL` if necessary.

3.  **Run Development Server**:
    ```bash
    npm run dev
    ```

4.  **Access the Dashboard**:
    Open [http://localhost:3000](http://localhost:3000) in your browser.

## Audit & Compliance

Every decision made in this interface is logged to an immutable PostgreSQL ledger on the backend. This UI enforces transparency by anchoring every extracted figure to its source coordinates in the vendor documentation.
