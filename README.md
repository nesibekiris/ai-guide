# AI Readiness Checklist Tool (No Paid Services)

This project:
- Assesses AI readiness via a checklist.
- Calculates weighted, normalized scores and displays them in a radar chart.
- Provides a simple chat assistant powered by a local Hugging Face model (no OpenAI API).

## Features
- **Interactive Checklist:** Yes/Partial/No answers.
- **Weighted & Normalized Scores:** Composite readiness percentage.
- **Radar Chart Visualization:** Shows strengths/weaknesses per section.
- **Local AI Assistant (Chat):** Uses a Hugging Face `pipeline("text-generation")` model (e.g. `distilgpt2`) for simple responses. No API keys or payments needed.

## Setup
1. Install dependencies:
   ```bash
   pip install -r requirements.txt
