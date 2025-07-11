/**
 * Genkit-powered chat service for DaisyAI
 * Following Firebase Studio patterns
 */

import { genkit, z } from 'genkit';
import { googleAI, gemini15Flash } from '@genkit-ai/googleai';
import { onFlow } from '@genkit-ai/firebase/functions';

// Initialize Genkit with Google AI
export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyBD6mKc5JxZczg_0odXTBuTI8nIcyDJ2tU',
    }),
  ],
});

// Define schemas
const MessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
});

const ChatRequestSchema = z.object({
  message: z.string().min(1).max(10000),
  sessionId: z.string().optional(),
  history: z.array(MessageSchema).optional(),
});

const ChatResponseSchema = z.object({
  response: z.string(),
  sessionId: z.string(),
});

// Define the chat flow
export const daisyChatFlow = ai.defineFlow(
  {
    name: 'daisyChat',
    inputSchema: ChatRequestSchema,
    outputSchema: ChatResponseSchema,
  },
  async (input) => {
    const sessionId = input.sessionId || `session-${Date.now()}`;
    
    // Build conversation context
    let context = `You are DaisyAI, an intelligent orchestrator for the music industry.
You have deep knowledge of music industry workflows, revenue models, and AI applications.
Be helpful, concise, and professional.\n\n`;

    if (input.history && input.history.length > 0) {
      context += 'Previous conversation:\n';
      input.history.forEach(msg => {
        context += `${msg.role}: ${msg.content}\n`;
      });
      context += '\n';
    }

    // Generate response
    const llmResponse = await ai.generate({
      model: gemini15Flash,
      prompt: `${context}User: ${input.message}\nAssistant:`,
      config: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      },
    });

    return {
      response: llmResponse.text(),
      sessionId,
    };
  }
);

// Client-side function to call the flow
export async function sendMessage(
  message: string, 
  sessionId?: string,
  history?: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<{ response: string; sessionId: string }> {
  try {
    // In production, this would call the deployed Cloud Function
    // For now, we'll use the local flow
    const result = await daisyChatFlow({
      message,
      sessionId,
      history,
    });
    
    return result;
  } catch (error) {
    console.error('Chat error:', error);
    throw new Error('Failed to send message');
  }
}