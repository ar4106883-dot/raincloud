import { AIProvider, CompletionRequest, CompletionResponse, ProviderConfig, ProviderError } from './base';

export class OpenAIProvider extends AIProvider {
  constructor(config: ProviderConfig) {
    super(config, 'openai');
  }

  async complete(request: CompletionRequest): Promise<CompletionResponse> {
    const startTime = Date.now();
    
    try {
      const response = await fetch(this.config.endpoint || 'https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey || process.env.OPENAI_API_KEY || ''}`
        },
        body: JSON.stringify({
          model: request.model || this.config.model || 'gpt-4o',
          max_tokens: request.maxTokens || 4096,
          temperature: request.temperature ?? 0.7,
          messages: request.messages
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new ProviderError(
          error.error?.message || 'OpenAI API error',
          'openai',
          error.error?.code,
          response.status
        );
      }

      const data = await response.json();
      const latency = Date.now() - startTime;

      return {
        content: data.choices[0].message.content,
        model: data.model,
        usage: {
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens
        },
        provider: 'openai',
        latency
      };
    } catch (error) {
      if (error instanceof ProviderError) {
        throw error;
      }
      throw new ProviderError(
        `OpenAI request failed: ${error.message}`,
        'openai'
      );
    }
  }

  calculateCost(tokens: number): number {
    // GPT-4o: ~$2.50 per MTok input, $10 per MTok output
    // Simplified average
    return (tokens / 1000000) * 6.25;
  }
}
