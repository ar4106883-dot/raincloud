import { AIProvider, CompletionRequest, CompletionResponse, ProviderConfig, ProviderError } from './base';

export class HuggingFaceProvider extends AIProvider {
  constructor(config: ProviderConfig) {
    super(config, 'huggingface');
  }

  async complete(request: CompletionRequest): Promise<CompletionResponse> {
    const startTime = Date.now();
    
    try {
      // Hugging Face Inference API
      const model = request.model || this.config.model || 'meta-llama/Llama-3.3-70B-Instruct';
      const endpoint = this.config.endpoint || `https://api-inference.huggingface.co/models/${model}`;
      
      // Format messages for Hugging Face
      const prompt = this.formatMessagesAsPrompt(request.messages);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey || process.env.HUGGINGFACE_API_KEY || ''}`
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: request.maxTokens || 1024,
            temperature: request.temperature ?? 0.7,
            top_p: 0.95,
            return_full_text: false
          }
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new ProviderError(
          error.error || 'Hugging Face API error',
          'huggingface',
          error.error_type,
          response.status
        );
      }

      const data = await response.json();
      const latency = Date.now() - startTime;

      // Extract generated text
      const content = Array.isArray(data) ? data[0].generated_text : data.generated_text;

      return {
        content: content.trim(),
        model: model,
        usage: {
          promptTokens: Math.ceil(prompt.length / 4), // Rough estimate
          completionTokens: Math.ceil(content.length / 4),
          totalTokens: Math.ceil((prompt.length + content.length) / 4)
        },
        provider: 'huggingface',
        latency
      };
    } catch (error) {
      if (error instanceof ProviderError) {
        throw error;
      }
      throw new ProviderError(
        `Hugging Face request failed: ${error.message}`,
        'huggingface'
      );
    }
  }

  private formatMessagesAsPrompt(messages: any[]): string {
    // Format messages for instruction-tuned models
    let prompt = '';
    
    for (const msg of messages) {
      if (msg.role === 'system') {
        prompt += `<|system|>\n${msg.content}\n\n`;
      } else if (msg.role === 'user') {
        prompt += `<|user|>\n${msg.content}\n\n`;
      } else if (msg.role === 'assistant') {
        prompt += `<|assistant|>\n${msg.content}\n\n`;
      }
    }
    
    prompt += '<|assistant|>\n';
    return prompt;
  }

  calculateCost(tokens: number): number {
    // Hugging Face Inference API pricing (approximate)
    // Many models are free with rate limits, Pro is ~$9/month unlimited
    return 0; // Free tier or Pro subscription
  }
}

// Popular Hugging Face models for easy reference
export const HUGGINGFACE_MODELS = {
  // Meta Llama models
  'llama-3.3-70b': 'meta-llama/Llama-3.3-70B-Instruct',
  'llama-3.1-8b': 'meta-llama/Llama-3.1-8B-Instruct',
  'llama-3.1-70b': 'meta-llama/Llama-3.1-70B-Instruct',
  
  // Mistral models
  'mistral-7b': 'mistralai/Mistral-7B-Instruct-v0.3',
  'mixtral-8x7b': 'mistralai/Mixtral-8x7B-Instruct-v0.1',
  
  // Google Gemma
  'gemma-7b': 'google/gemma-7b-it',
  'gemma-2b': 'google/gemma-2b-it',
  
  // Microsoft Phi
  'phi-3-mini': 'microsoft/Phi-3-mini-4k-instruct',
  'phi-3-medium': 'microsoft/Phi-3-medium-4k-instruct',
  
  // Qwen
  'qwen-2-7b': 'Qwen/Qwen2-7B-Instruct',
  'qwen-2-72b': 'Qwen/Qwen2-72B-Instruct',
};
