// Base Provider Interface
// This defines the standard interface all AI providers must implement

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface CompletionRequest {
  messages: Message[];
  temperature?: number;
  maxTokens?: number;
  model?: string;
}

export interface CompletionResponse {
  content: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  provider: string;
  latency: number;
}

export interface ProviderConfig {
  apiKey?: string;
  model: string;
  endpoint: string;
  timeout?: number;
  maxRetries?: number;
}

export abstract class AIProvider {
  protected config: ProviderConfig;
  protected name: string;

  constructor(config: ProviderConfig, name: string) {
    this.config = config;
    this.name = name;
  }

  // All providers must implement this method
  abstract complete(request: CompletionRequest): Promise<CompletionResponse>;

  // Optional: Test if provider is available
  async healthCheck(): Promise<boolean> {
    try {
      await this.complete({
        messages: [{ role: 'user', content: 'test' }],
        maxTokens: 10
      });
      return true;
    } catch {
      return false;
    }
  }

  // Helper to format messages for different provider APIs
  protected formatMessages(messages: Message[]): any {
    return messages;
  }

  // Calculate cost (override in each provider)
  calculateCost(tokens: number): number {
    return 0;
  }
}

export class ProviderError extends Error {
  constructor(
    message: string,
    public provider: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'ProviderError';
  }
}
