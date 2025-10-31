import { AIProvider, CompletionResponse, Message } from '../providers/base';
import { AnthropicProvider } from '../providers/anthropic';
import { OpenAIProvider } from '../providers/openai';
import { HuggingFaceProvider } from '../providers/huggingface';

interface BoardMember {
  id: string;
  name: string;
  role: string;
  expertise: string;
  systemPrompt: string;
  preferredProvider: string;
  fallbackProviders: string[];
  temperature: number;
  priority: number;
}

interface BoardResponse {
  agent: string;
  role: string;
  response: string;
  timestamp: string;
  provider: string;
  latency: number;
  tokens: number;
}

interface BoardDiscussion {
  query: string;
  responses: BoardResponse[];
  summary?: string;
  totalLatency: number;
  totalCost: number;
}

export class BoardOrchestrator {
  private providers: Map<string, AIProvider>;
  private boardMembers: BoardMember[];
  private maxConcurrentAgents: number;

  constructor(
    boardConfig: any,
    providerConfigs: any
  ) {
    this.boardMembers = boardConfig.boardMembers;
    this.maxConcurrentAgents = boardConfig.boardSettings?.maxConcurrentAgents || 3;
    this.providers = new Map();
    
    // Initialize providers
    this.initializeProviders(providerConfigs);
  }

  private initializeProviders(configs: any) {
    if (configs.anthropic?.apiKey || process.env.ANTHROPIC_API_KEY) {
      this.providers.set('anthropic', new AnthropicProvider(configs.anthropic || {}));
    }
    if (configs.openai?.apiKey || process.env.OPENAI_API_KEY) {
      this.providers.set('openai', new OpenAIProvider(configs.openai || {}));
    }
    if (configs.huggingface?.apiKey || process.env.HUGGINGFACE_API_KEY) {
      this.providers.set('huggingface', new HuggingFaceProvider(configs.huggingface || {}));
    }
    // Add more providers as needed
  }

  private async getProviderForMember(member: BoardMember): Promise<AIProvider | null> {
    // Try preferred provider first
    let provider = this.providers.get(member.preferredProvider);
    if (provider) {
      try {
        await provider.healthCheck();
        return provider;
      } catch (error) {
        console.warn(`Preferred provider ${member.preferredProvider} failed for ${member.name}`);
      }
    }

    // Try fallback providers
    for (const fallbackName of member.fallbackProviders || []) {
      provider = this.providers.get(fallbackName);
      if (provider) {
        try {
          await provider.healthCheck();
          return provider;
        } catch (error) {
          console.warn(`Fallback provider ${fallbackName} failed for ${member.name}`);
        }
      }
    }

    return null;
  }

  async discussQuery(query: string, mode: 'all' | 'relevant' | 'specific' = 'relevant'): Promise<BoardDiscussion> {
    const startTime = Date.now();
    const responses: BoardResponse[] = [];
    let totalCost = 0;

    // Determine which board members should respond
    const selectedMembers = this.selectMembers(query, mode);

    // Process members in batches based on maxConcurrentAgents
    for (let i = 0; i < selectedMembers.length; i += this.maxConcurrentAgents) {
      const batch = selectedMembers.slice(i, i + this.maxConcurrentAgents);
      const batchPromises = batch.map(member => this.getMemberResponse(member, query));
      
      const batchResponses = await Promise.allSettled(batchPromises);
      
      batchResponses.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value) {
          responses.push(result.value);
          totalCost += result.value.tokens * 0.000001; // Simplified cost calculation
        } else {
          console.error(`Board member ${batch[index].name} failed to respond:`, result.reason);
        }
      });
    }

    // Sort responses by priority
    responses.sort((a, b) => {
      const memberA = this.boardMembers.find(m => m.name === a.agent);
      const memberB = this.boardMembers.find(m => m.name === b.agent);
      return (memberA?.priority || 99) - (memberB?.priority || 99);
    });

    const totalLatency = Date.now() - startTime;

    return {
      query,
      responses,
      totalLatency,
      totalCost
    };
  }

  private selectMembers(query: string, mode: 'all' | 'relevant' | 'specific'): BoardMember[] {
    if (mode === 'all') {
      return this.boardMembers;
    }

    // Simple relevance detection based on keywords
    const queryLower = query.toLowerCase();
    const relevantMembers: BoardMember[] = [];

    // Always include CEO for strategic questions
    const ceo = this.boardMembers.find(m => m.role === 'CEO');
    if (ceo && mode === 'relevant') {
      relevantMembers.push(ceo);
    }

    // Keyword-based selection
    for (const member of this.boardMembers) {
      if (member.role === 'CEO' && mode === 'relevant') continue; // Already added

      const keywords = this.getMemberKeywords(member.role);
      if (keywords.some(keyword => queryLower.includes(keyword))) {
        relevantMembers.push(member);
      }
    }

    // If no specific members found, return top 3 by priority
    if (relevantMembers.length === 0) {
      return this.boardMembers.slice(0, 3);
    }

    return relevantMembers.slice(0, this.maxConcurrentAgents);
  }

  private getMemberKeywords(role: string): string[] {
    const keywordMap: Record<string, string[]> = {
      'Chairman': ['board', 'governance', 'oversight', 'decision', 'vote', 'consensus', 'shareholder'],
      'CEO': ['strategy', 'vision', 'business', 'growth', 'company', 'revenue', 'market', 'execute'],
      'CFO': ['financial', 'finance', 'budget', 'cost', 'revenue', 'profit', 'investment', 'roi', 'cash'],
      'CTO': ['technical', 'architecture', 'infrastructure', 'technology', 'system', 'engineering', 'scale', 'security'],
      'Chief Product Officer': ['product', 'feature', 'user', 'roadmap', 'requirements', 'ux', 'experience'],
      'Chief Marketing Officer': ['marketing', 'brand', 'customer', 'campaign', 'growth', 'acquisition', 'market'],
      'Non-Executive Director': ['risk', 'compliance', 'audit', 'governance', 'oversight', 'independent']
    };
    return keywordMap[role] || [];
  }

  private async getMemberResponse(member: BoardMember, query: string): Promise<BoardResponse | null> {
    const memberStartTime = Date.now();
    
    try {
      const provider = await this.getProviderForMember(member);
      if (!provider) {
        throw new Error(`No available provider for ${member.name}`);
      }

      const messages: Message[] = [
        { role: 'system', content: member.systemPrompt },
        { role: 'user', content: query }
      ];

      const completion = await provider.complete({
        messages,
        temperature: member.temperature
      });

      return {
        agent: member.name,
        role: member.role,
        response: completion.content,
        timestamp: new Date().toISOString(),
        provider: completion.provider,
        latency: Date.now() - memberStartTime,
        tokens: completion.usage.totalTokens
      };
    } catch (error) {
      console.error(`Error getting response from ${member.name}:`, error);
      return null;
    }
  }

  // Get a single direct response (Claude Direct mode)
  async getDirectResponse(query: string, provider?: string): Promise<CompletionResponse> {
    const providerName = provider || 'anthropic';
    const selectedProvider = this.providers.get(providerName);

    if (!selectedProvider) {
      throw new Error(`Provider ${providerName} not configured`);
    }

    return await selectedProvider.complete({
      messages: [
        {
          role: 'system',
          content: 'You are Claude, a helpful AI assistant. Provide clear, accurate, and thoughtful responses.'
        },
        { role: 'user', content: query }
      ],
      temperature: 0.7
    });
  }
}
