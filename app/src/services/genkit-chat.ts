/**
 * Simple chat service using Google Generative AI directly
 * Avoiding genkit complexity for now
 */

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Simple client-side chat function
export async function sendMessage(
  message: string,
  sessionId?: string,
  history?: ChatMessage[]
): Promise<{ response: string; sessionId: string }> {
  try {
    // For now, return a mock response
    // In production, this would call your Cloud Function
    const mockResponse = await simulateAIResponse(message, history);
    
    return {
      response: mockResponse,
      sessionId: sessionId || `session-${Date.now()}`,
    };
  } catch (error) {
    console.error('Chat error:', error);
    throw new Error('Failed to send message');
  }
}

// Mock AI response for development
async function simulateAIResponse(message: string, _history?: ChatMessage[]): Promise<string> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Simple mock responses based on keywords
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
    return "Hello! I'm DaisyAI, your music industry assistant. How can I help you today?";
  }
  
  if (lowerMessage.includes('music') || lowerMessage.includes('industry')) {
    return "The music industry is constantly evolving with new technologies and business models. I can help you understand revenue streams, artist management, digital distribution, and AI applications in music. What specific aspect interests you?";
  }
  
  if (lowerMessage.includes('ai') || lowerMessage.includes('artificial intelligence')) {
    return "AI is transforming the music industry in many ways: from composition and production tools to personalized recommendations and rights management. Would you like to explore specific AI use cases?";
  }
  
  if (lowerMessage.includes('revenue') || lowerMessage.includes('money')) {
    return "Music revenue comes from various sources: streaming royalties, live performances, merchandising, sync licensing, and direct fan support. Each has different dynamics and opportunities. Which revenue stream would you like to discuss?";
  }
  
  // Default response
  return `I understand you're asking about "${message}". As your music industry AI assistant, I can help with topics like artist management, revenue optimization, digital distribution, and AI applications in music. What specific area would you like to explore?`;
}