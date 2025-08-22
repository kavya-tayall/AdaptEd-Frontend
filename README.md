# AdaptEd

AdaptEd is a Next.js app that evaluates explanations and analogies using OpenAI.

## Requirements

- Node.js 18.18+ (recommended: Node 20 LTS)
- npm 9+

## Quick Start

1) Install dependencies

```bash
# In the project root (frontend)
npm install

# Then install backend deps
cd backend && npm install && cd ..
```

2) Configure environment variables

Create `.env.local` in the project root:

```bash
# Required if you want AI evaluations. Without this, the API still works but returns entries without AI evaluation.
OPENAI_API_KEY=sk-...
# Optional
# OPENAI_MODEL=gpt-4o-mini
```

3) Run the app

Open a second terminal at the project root:

```bash
npm run dev
```

App will start at `http://localhost:3000`.

## Routes in the frontend

- `/` Home
- `/create-analogy`
- `/simple-explanation`
- `/review-summary`
- `/shared-feedback`

## API quick test

Health check:

```bash
curl -i http://localhost:3000/api/explanations -X POST -H "Content-Type: application/json" -d '{"topic":"Photosynthesis","content":"Plants use sunlight to turn water and CO2 into sugar and oxygen."}'
```

Create and evaluate an explanation:

```bash
curl -i http://localhost:3000/api/explanations -X POST -H "Content-Type: application/json" -d '{"topic":"Photosynthesis","content":"Plants use sunlight to turn water and CO2 into sugar and oxygen."}'
```

Create and evaluate an analogy:

```bash
curl -i http://localhost:3000/api/analogies -X POST -H "Content-Type: application/json" -d '{"topic":"Electric circuits","content":"Electricity flowing through a circuit is like water flowing through pipes."}'
```

List stored items (debug):

```bash
curl -i http://localhost:3000/api/explanations
curl -i http://localhost:3000/api/analogies
```

Notes:
- If `OPENAI_API_KEY` is not set or OpenAI is unavailable, items are still saved but `evaluation` may be `null`, with a warning in the response.
- CORS is enabled by default for development.

## Scripts

```bash
npm run dev     # Next.js dev server (Turbopack)
npm run build   # Next.js production build
npm run start   # Next.js production server
```

## Troubleshooting

- If you see 500s from API routes, ensure `OPENAI_API_KEY` is set in `.env.local` and you restarted the dev server.
- Port conflicts: change `PORT` for Next.js by setting `PORT=3000` before `npm run dev`.
- Node version issues: ensure Node 18.18+ (ideally Node 20 LTS).
