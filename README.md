# AI-Powered Email Template Generator

A backend microservice that uses an LLM to generate customer-friendly email templates from a simple JSON input.

---

## Features

- AI-powered email generation via OpenAI
- Express REST API with TypeScript
- LangChain for LLM abstraction and prompt handling
- LangGraph workflow for structured generation pipeline
- LangSmith observability and tracing
- Zod validation on both request input and AI output
- AI response time measurement
- Centralized error handling and structured logging
- Modular architecture with clear separation of concerns

---

## Architecture

```
Client
  ↓
Express Route (/api/v1/email/generate)
  ↓
Controller (validates HTTP request via Zod)
  ↓
Email Service (orchestrates, measures time)
  ↓
LangGraph Workflow
  ├── Node 1: validateInput
  ├── Node 2: generateEmail (LangChain + OpenAI)
  └── Node 3: validateOutput
  ↓
Structured JSON Response
```

LangSmith sits alongside the LangChain/LangGraph calls, tracing every LLM invocation automatically when `LANGSMITH_TRACING=true`.

---

## Installation

```bash
npm install
```

---

## Environment Setup

Create `.env` and fill in your keys:

```env
// I have used openRouter for free model and api key of OPENAI SDK, So change accordingly for OPENAI

PORT=5000

OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini

LANGSMITH_API_KEY=your_langsmith_api_key_here
LANGSMITH_TRACING=true
LANGSMITH_PROJECT=ai-email-template-generator
```

Never commit `.env` — it's gitignored.

---

## Running the Application

Development (with hot reload):
```bash
npm run dev
```

Production:
```bash
npm run build
npm start
```

---

## API Documentation

### POST /api/v1/email/generate

Request:
```json
{
  "purpose": "Thank a customer for their purchase",
  "recipient_name": "Ankit",
  "tone": "warm"
}
```

Success Response `200`:
```json
{
  "success": true,
  "data": {
    "subject": "Thank you for your purchase!",
    "body": "Hi Ankit, ..."
  },
  "metadata": {
    "tone": "warm",
    "purpose": "Thank a customer for their purchase",
    "ai_response_time_ms": 731
  }
}
```

Validation Error `400`:
```json
{
  "success": false,
  "error": { "message": "purpose is required" }
}
```

Server Error `500`:
```json
{
  "success": false,
  "error": { "message": "Failed to generate email" }
}
```

---

## Prompt Design

The prompt (`src/ai/prompts/email.prompt.ts`) uses a two-message structure:

- **System message**: defines the AI's role (professional communication assistant) and hard constraints (no invented facts, concise output, natural tone)
- **Human message**: injects the three dynamic inputs — purpose, recipient name, tone

Using LangChain's `.withStructuredOutput(zodSchema)` forces the LLM to return `{ subject, body }` JSON directly, eliminating fragile text parsing.

---

## LangGraph Design

The graph (`src/ai/graph/email.graph.ts`) has three nodes:

| Node | Purpose |
|---|---|
| `validateInput` | Ensures required fields exist before hitting the LLM |
| `generateEmail` | Calls the LangChain chain to produce the email |
| `validateOutput` | Validates the LLM returned a usable subject and body |

Even for this simple workflow, LangGraph provides a clear execution trace in LangSmith, makes adding future nodes (retry logic, tone classifier, etc.) straightforward, and enforces typed state throughout.

---

## LangSmith

When `LANGSMITH_TRACING=true` and `LANGSMITH_API_KEY` is set, LangSmith automatically intercepts all LangChain and LangGraph calls and sends trace data to [smith.langchain.com](https://smith.langchain.com).

Each email generation run creates a trace showing:
- The full prompt sent to the LLM
- Model name, temperature, token usage
- Latency per node
- The structured output returned

Useful for debugging unexpected outputs, slow generations, or token cost analysis.

---

## Error Handling

- Zod validation rejects malformed requests before they reach the AI layer
- LangGraph errors (LLM API failures, invalid output) are caught in the controller and passed to the centralized `errorMiddleware`
- All 500 responses return `{ success: false, error: { message: "..." } }` — no stack traces exposed

---

## Testing

```bash
npm test
```

Tests cover Zod schema validation and the service layer with the AI graph mocked (no real API calls).

---

