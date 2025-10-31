import { AIProvider, CompletionRequest, CompletionResponse, ProviderConfig, ProviderError } from './base';

export class AnthropicProvider extends AIProvider {
  constructor(config: ProviderConfig) {
    super(config, 'anthropic');
  }

  async complete(request: CompletionRequest): Promise<CompletionResponse> {
    const startTime = Date.now();
    
    try {
      const response = await fetch(this.config.endpoint || 'https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.config.apiKey || process.env.ANTHROPIC_API_KEY || '',
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: request.model || this.config.model || 'claude-sonnet-4-5-20250929',
          max_tokens: request.maxTokens || 4096,
          temperature: request.temperature ?? 0.7,
          messages: this.formatMessages(request.messages)
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new ProviderError(
          error.error?.message || 'Anthropic API error',
          'anthropic',
          error.error?.type,
          response.status
        );
      }

      const data = await response.json();
      const latency = Date.now() - startTime;

      return {
        content: data.content[0].text,
        model: data.model,
        usage: {
          promptTokens: data.usage.input_tokens,
          completionTokens: data.usage.output_tokens,
          totalTokens: data.usage.input_tokens + data.usage.output_tokens
        },
        provider: 'anthropic',
        latency
      };
    } catch (error) {
      if (error instanceof ProviderError) {
        throw error;
      }
      throw new ProviderError(
        `Anthropic request failed: ${error.message}`,
        'anthropic'
      );
    }
  }

  protected formatMessages(messages: any[]) {
    // Separate system message from conversation messages
    const systemMessage = messages.find(m => m.role === 'system');
    const conversationMessages = messages.filter(m => m.role !== 'system');
    
    return conversationMessages;
  }

  calculateCost(tokens: number): number {
    // Claude Sonnet 4.5: $3 per MTok input, $15 per MTok output
    // Simplified: average cost
    return (tokens / 1000000) * 9; // $9 per MTok average
  }
}
