import dotenv from 'dotenv';
import { BoardOrchestrator } from '../src/orchestrator/board.js';
import boardConfig from '../config/agents.json' assert { type: 'json' };

dotenv.config();

// Provider configurations
const providerConfigs = {
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY,
    model: 'claude-sonnet-4-5-20250929',
    endpoint: 'https://api.anthropic.com/v1/messages'
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-4o',
    endpoint: 'https://api.openai.com/v1/chat/completions'
  }
};

async function runExamples() {
  console.log('🚀 Raincloud - Test Examples\n');
  
  // Initialize board
  const board = new BoardOrchestrator(boardConfig, providerConfigs);
  
  // Example 1: Board Discussion
  console.log('📊 Example 1: Board Discussion');
  console.log('Query: "We need to improve our user onboarding. What should we focus on?"\n');
  
  try {
    const discussion = await board.discussQuery(
      "We need to improve our user onboarding experience. What should we focus on first?",
      'relevant'
    );
    
    console.log(`✅ Got ${discussion.responses.length} responses in ${discussion.totalLatency}ms`);
    console.log(`💰 Total cost: $${discussion.totalCost.toFixed(4)}\n`);
    
    discussion.responses.forEach((response, i) => {
      console.log(`${i + 1}. ${response.agent} (${response.role}):`);
      console.log(`   Provider: ${response.provider}`);
      console.log(`   Latency: ${response.latency}ms`);
      console.log(`   Response: ${response.response.substring(0, 150)}...\n`);
    });
  } catch (error) {
    console.error('❌ Board discussion failed:', error.message);
  }
  
  // Example 2: Direct Response
  console.log('\n🤖 Example 2: Direct Claude Response');
  console.log('Query: "Explain REST API design principles"\n');
  
  try {
    const direct = await board.getDirectResponse(
      "Explain REST API design principles in 3 key points"
    );
    
    console.log(`✅ Response from ${direct.provider} (${direct.model})`);
    console.log(`⏱️  Latency: ${direct.latency}ms`);
    console.log(`📝 Tokens: ${direct.usage.totalTokens}`);
    console.log(`\nResponse: ${direct.content.substring(0, 200)}...\n`);
  } catch (error) {
    console.error('❌ Direct response failed:', error.message);
  }
  
  // Example 3: All Board Members
  console.log('\n👥 Example 3: Full Board Discussion (All Members)');
  console.log('Query: "Should we pivot our product strategy?"\n');
  
  try {
    const fullBoard = await board.discussQuery(
      "Should we consider pivoting our product strategy based on recent market changes?",
      'all'
    );
    
    console.log(`✅ Full board discussion completed`);
    console.log(`📊 ${fullBoard.responses.length} board members responded`);
    console.log(`⏱️  Total time: ${fullBoard.totalLatency}ms`);
    console.log(`💰 Total cost: $${fullBoard.totalCost.toFixed(4)}\n`);
    
    fullBoard.responses.forEach((response) => {
      console.log(`- ${response.agent} (${response.provider}): ${response.response.substring(0, 100)}...`);
    });
  } catch (error) {
    console.error('❌ Full board discussion failed:', error.message);
  }
  
  console.log('\n✨ Test examples completed!\n');
  console.log('🎯 Next steps:');
  console.log('   1. Start the server: npm run dev');
  console.log('   2. Test with your React frontend');
  console.log('   3. Customize board members in config/agents.json');
  console.log('   4. Add more providers as needed\n');
}

// Run examples
runExamples().catch(console.error);
