// Demo script to test the Reddit Problem Finder locally

const axios = require('axios');

async function demo() {
  console.log('🔍 Reddit Problem Finder - Demo\n');
  
  // Example 1: Analyze entrepreneur subreddit
  console.log('📊 Example 1: Finding problems in r/entrepreneur...\n');
  
  const example1 = {
    subreddit: 'entrepreneur',
    query: 'struggling with',
    limit: 10
  };
  
  console.log('Request:', JSON.stringify(example1, null, 2));
  console.log('\n✅ This will find posts where entrepreneurs discuss their struggles\n');
  
  // Example 2: SaaS problems
  console.log('📊 Example 2: Finding SaaS problems...\n');
  
  const example2 = {
    subreddit: 'SaaS',
    query: 'frustrating OR annoying',
    limit: 25
  };
  
  console.log('Request:', JSON.stringify(example2, null, 2));
  console.log('\n✅ This will find frustrations SaaS users are experiencing\n');
  
  // Example 3: Developer pain points
  console.log('📊 Example 3: Finding developer pain points...\n');
  
  const example3 = {
    subreddit: 'webdev',
    query: 'wish there was',
    limit: 50
  };
  
  console.log('Request:', JSON.stringify(example3, null, 2));
  console.log('\n✅ This will find feature requests and unmet needs\n');
  
  console.log('🎯 Use Cases:\n');
  console.log('• Find product ideas from user complaints');
  console.log('• Validate market problems');
  console.log('• Discover underserved niches');
  console.log('• Identify feature requests');
  console.log('• Understand user frustrations');
  console.log('• Gather qualitative research data\n');
  
  console.log('💰 Cost: $0.00 - 100% Free!\n');
  console.log('🚀 Start the server with: npm start');
  console.log('🌐 Open: http://localhost:3000\n');
}

demo();