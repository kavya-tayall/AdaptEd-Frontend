# AdaptEd Backend - Simple MVP

A minimal Node.js/Express backend for evaluating educational explanations and analogies using OpenAI.

## Features

- 📝 **Explanation Evaluation** - AI feedback for simple explanations
- 🔄 **Analogy Evaluation** - AI assessment of learning analogies  
- 🤖 **OpenAI Integration** - Smart educational feedback
- 💾 **In-memory Storage** - Simple data persistence for MVP

## Quick Start

1. **Install dependencies:**
```bash
cd backend
npm install
```

2. **Set up environment:**
Create `.env` file:
```
PORT=3001
OPENAI_API_KEY=your_openai_api_key_here
NODE_ENV=development
```

3. **Start the server:**
```bash
npm run dev
```

Server runs on `http://localhost:3001`

## API Endpoints

### Core Endpoints
- `POST /api/explanations` - Evaluate a simple explanation
- `POST /api/analogies` - Evaluate an analogy
- `GET /health` - Health check

### Optional (for debugging)
- `GET /api/explanations` - View all explanations
- `GET /api/analogies` - View all analogies

## Usage Examples

### Evaluate Explanation
```bash
curl -X POST http://localhost:3001/api/explanations \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Gravity",
    "content": "Gravity is like an invisible force that pulls things down towards the Earth, like when you drop a ball and it falls to the ground."
  }'
```

### Evaluate Analogy
```bash
curl -X POST http://localhost:3001/api/analogies \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Electricity",
    "content": "Electricity flowing through wires is like water flowing through pipes - the thicker the pipe, the more water can flow through."
  }'
```

## Response Format

**Success Response:**
```json
{
  "success": true,
  "data": {
    "id": "1234567890",
    "topic": "Gravity", 
    "content": "Your explanation...",
    "evaluation": {
      "score": 8,
      "strengths": "Clear and relatable example",
      "improvements": "Could add more detail about why gravity works",
      "suggestions": "Try explaining what causes gravity"
    },
    "createdAt": "2024-01-01T12:00:00.000Z"
  },
  "message": "Explanation evaluated successfully"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Missing topic or content"
}
```

## File Structure

```
backend/
├── src/
│   └── server.ts          # Complete backend in one file
├── package.json
├── tsconfig.json
├── .env                   # Your environment variables
└── README.md
```

## Tech Stack

- **Node.js + TypeScript**
- **Express.js** - Web framework
- **OpenAI API** - AI evaluations (GPT-3.5-turbo)
- **CORS + Helmet** - Security middleware

## Environment Variables

- `PORT` - Server port (default: 3001)
- `OPENAI_API_KEY` - Your OpenAI API key (**required**)
- `NODE_ENV` - Environment mode

## Development

```bash
# Development with auto-reload
npm run dev

# Build TypeScript
npm run build

# Production
npm start
```

That's it! A simple, single-file backend ready for your MVP. 🚀 