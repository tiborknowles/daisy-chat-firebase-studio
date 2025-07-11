/**
 * SSE-based chat service for real-time streaming from backend
 */

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface StreamCallbacks {
  onChunk?: (chunk: string) => void;
  onComplete?: () => void;
  onError?: (error: string) => void;
}

export class SSEChatService {
  private backendUrl: string;
  private sessionId: string | null = null;
  private userId: string;
  private appName: string;

  constructor(backendUrl?: string) {
    this.backendUrl = backendUrl || import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';
    this.userId = `u_${Date.now()}`;
    this.appName = 'daisy-chat';
  }

  async createSession(): Promise<string> {
    const response = await fetch(
      `${this.backendUrl}/api/apps/${this.appName}/users/${this.userId}/sessions`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to create session');
    }
    
    const data = await response.json();
    this.sessionId = data.id;
    return data.id;
  }

  async sendMessage(
    message: string,
    history: ChatMessage[],
    callbacks: StreamCallbacks
  ): Promise<void> {
    // Create session if needed
    if (!this.sessionId) {
      await this.createSession();
    }

    const response = await fetch(`${this.backendUrl}/api/run_sse`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        appName: this.appName,
        userId: this.userId,
        sessionId: this.sessionId,
        newMessage: {
          parts: [{ text: message }],
          role: 'user'
        }
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to connect to chat service');
    }

    // Process SSE stream
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    if (!reader) {
      throw new Error('No response body');
    }

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      
      // Keep the last incomplete line in buffer
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const dataStr = line.slice(6).trim();
          
          if (dataStr) {
            try {
              const data = JSON.parse(dataStr);
              
              if (data.type === 'error') {
                callbacks.onError?.(data.message);
              } else if (data.type === 'complete') {
                callbacks.onComplete?.();
              } else if (data.content?.parts?.[0]?.text) {
                callbacks.onChunk?.(data.content.parts[0].text);
              }
            } catch (e) {
              console.error('Failed to parse SSE data:', e);
            }
          }
        }
      }
    }
  }

  // Non-streaming fallback
  async sendMessageSimple(message: string): Promise<string> {
    const response = await fetch(`${this.backendUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        sessionId: this.sessionId
      })
    });

    if (!response.ok) {
      throw new Error('Failed to send message');
    }

    const data = await response.json();
    this.sessionId = data.sessionId;
    return data.response;
  }
}