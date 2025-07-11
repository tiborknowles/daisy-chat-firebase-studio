# DaisyAI Chat with SSE Streaming

This implementation follows the ASP (Agent Starter Pack) pattern for connecting a web UI to Vertex AI Agent Engine using Server-Sent Events (SSE) for real-time streaming.

## Architecture

```
Frontend (React) → Backend (Express + SSE) → Vertex AI Agent Engine
```

## Features

- ✅ Real-time streaming responses using SSE
- ✅ Session management for conversation context
- ✅ Secure backend-for-frontend pattern
- ✅ No CORS issues
- ✅ Firebase Authentication integration
- ✅ Ready for Cloud Run deployment

## Quick Start

### 1. Start the Backend

```bash
cd backend
npm install
npm run dev
```

The backend will start on http://localhost:8080

### 2. Start the Frontend

```bash
cd app
npm install
npm run dev
```

The frontend will start on http://localhost:5173

### 3. Configure Environment

Create `app/.env.local`:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=warner-music-staging
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_BACKEND_URL=http://localhost:8080
```

## SSE Implementation Details

### Backend Endpoints

- `POST /api/apps/:appName/users/:userId/sessions` - Create a new session
- `POST /api/run_sse` - Send message and receive SSE stream
- `POST /api/chat` - Non-streaming alternative
- `GET /api/health` - Health check

### Frontend SSE Handling

The frontend uses the Fetch API with streaming response processing:

```typescript
const response = await fetch('/api/run_sse', {
  method: 'POST',
  body: JSON.stringify({ message, sessionId })
});

const reader = response.body?.getReader();
// Process streaming chunks...
```

### Message Format

SSE events follow this format:
```
data: {"content": {"parts": [{"text": "chunk"}], "role": "assistant"}}
data: {"type": "complete"}
```

## Deployment

### Deploy Backend to Cloud Run

```bash
cd backend
gcloud run deploy daisy-chat-backend \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars="PROJECT_ID=warner-music-staging,LOCATION=us-central1,AGENT_ID=8470637580386304"
```

### Deploy Frontend to Firebase Hosting

```bash
cd app
npm run build
firebase deploy --only hosting
```

## Connecting to Real Vertex AI Agent

To connect to your actual Vertex AI Agent (ID: 8470637580386304), update the backend:

1. Install the Vertex AI SDK:
```bash
npm install @google-cloud/aiplatform
```

2. Update `backend/index.js` to use the real agent instead of mock responses

3. Grant the Cloud Run service account the `roles/aiplatform.user` role

## Security Notes

- Backend validates Firebase Auth tokens
- Service account credentials stay server-side
- CORS is configured for your domain only
- Sessions expire after inactivity

## Next Steps

1. Replace mock responses with real Vertex AI agent calls
2. Add Redis for production session management
3. Implement activity timeline UI
4. Add error recovery and retry logic