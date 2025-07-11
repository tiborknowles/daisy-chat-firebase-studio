// Backend service with SSE streaming for DaisyAI Chat
const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// Configuration - will use environment variables in production
const PROJECT_ID = process.env.PROJECT_ID || 'warner-music-staging';
const LOCATION = process.env.LOCATION || 'us-central1';
const AGENT_ID = process.env.AGENT_ID || '8470637580386304';

// Import Vertex AI client
const { PredictionServiceClient } = require('@google-cloud/aiplatform').v1;

// Initialize the client
const client = new PredictionServiceClient({
  apiEndpoint: `${LOCATION}-aiplatform.googleapis.com`,
});

// Store active sessions in memory (use Redis in production)
const sessions = new Map();

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', service: 'daisy-chat-backend' });
});

// Create session endpoint
app.post('/api/apps/:appName/users/:userId/sessions', (req, res) => {
  const { appName, userId } = req.params;
  const sessionId = uuidv4();
  
  sessions.set(sessionId, {
    appName,
    userId,
    messages: [],
    createdAt: new Date()
  });
  
  res.json({ 
    id: sessionId,
    appName,
    userId 
  });
});

// Main SSE streaming endpoint
app.post('/api/run_sse', async (req, res) => {
  // Set SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });

  const { appName, userId, sessionId, newMessage } = req.body;
  
  // Get or create session
  let session = sessions.get(sessionId);
  if (!session) {
    session = {
      appName,
      userId,
      messages: [],
      createdAt: new Date()
    };
    sessions.set(sessionId, session);
  }
  
  // Add user message to history
  session.messages.push(newMessage);
  
  try {
    // Send initial acknowledgment
    res.write(`data: ${JSON.stringify({
      type: 'status',
      message: 'Connecting to DaisyAI...'
    })}\n\n`);

    // Construct the endpoint path for Vertex AI Agent
    const endpoint = `projects/${PROJECT_ID}/locations/${LOCATION}/endpoints/${AGENT_ID}`;
    
    // Prepare the prompt with conversation history
    const conversationHistory = session.messages.map(msg => 
      `${msg.role}: ${msg.parts[0].text}`
    ).join('\n');
    
    const prompt = conversationHistory;

    // Call Vertex AI with streaming
    const request = {
      endpoint: endpoint,
      instances: [{
        content: prompt
      }],
      parameters: {
        temperature: 0.7,
        maxOutputTokens: 1024,
        topP: 0.95,
        topK: 40
      }
    };

    // For now, simulate streaming response
    // In production, you would use the actual Vertex AI streaming API
    const mockResponses = [
      "I'm DaisyAI, your music industry assistant.",
      "I can help you with various aspects of the music business,",
      "including artist management, revenue optimization,",
      "digital distribution, and AI applications in music.",
      "What would you like to know?"
    ];

    // Simulate streaming chunks
    for (let i = 0; i < mockResponses.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const chunk = {
        content: {
          parts: [{ text: mockResponses[i] + " " }],
          role: "assistant"
        },
        author: "daisy_orchestrator",
        type: "message_chunk"
      };
      
      res.write(`data: ${JSON.stringify(chunk)}\n\n`);
    }

    // Send completion event
    res.write(`data: ${JSON.stringify({
      type: 'complete',
      message: 'Response complete'
    })}\n\n`);

    // Add assistant response to session
    session.messages.push({
      role: 'assistant',
      parts: [{ text: mockResponses.join(' ') }]
    });

  } catch (error) {
    console.error('Error calling Vertex AI:', error);
    res.write(`data: ${JSON.stringify({
      type: 'error',
      message: 'Failed to get response from AI'
    })}\n\n`);
  } finally {
    res.end();
  }
});

// Regular POST endpoint (non-streaming alternative)
app.post('/api/chat', async (req, res) => {
  const { message, sessionId } = req.body;
  
  try {
    // Similar logic but return complete response
    res.json({
      response: "This is a non-streaming response from DaisyAI.",
      sessionId: sessionId || uuidv4()
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`DaisyAI Backend listening on port ${PORT}`);
  console.log(`SSE endpoint available at http://localhost:${PORT}/api/run_sse`);
});