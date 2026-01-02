const express = require('express');
const cors = require('cors');
const axios = require('axios');
const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Initialize SQL.js database (pure JavaScript, no native dependencies)
let db;
const dbPath = path.join(__dirname, 'problems.db');

async function initDatabase() {
  const SQL = await initSqlJs();
  
  // Load existing database or create new one
  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }
  
  // Create tables
  db.run(`
    CREATE TABLE IF NOT EXISTS problems (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      subreddit TEXT,
      problem TEXT,
      context TEXT,
      severity TEXT,
      post_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  db.run(`
    CREATE TABLE IF NOT EXISTS searches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      query TEXT,
      subreddit TEXT,
      problems_found INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  saveDatabase();
}

function saveDatabase() {
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbPath, buffer);
}

// Free AI Models via OpenRouter
const FREE_AI_MODELS = [
  'google/gemini-2.0-flash-exp:free',
  'meta-llama/llama-3.2-3b-instruct:free',
  'microsoft/phi-3-mini-128k-instruct:free'
];

async function analyzeWithFreeAI(text, subreddit) {
  try {
    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
      model: FREE_AI_MODELS[0],
      messages: [{
        role: 'user',
        content: `Analyze this Reddit post/comment and extract user problems, pain points, or frustrations. Be specific and actionable.

Subreddit: ${subreddit}
Text: ${text}

Return ONLY a JSON object with this structure:
{
  "hasProblem": true/false,
  "problem": "brief problem statement",
  "severity": "low/medium/high",
  "context": "additional context"
}

If no clear problem exists, set hasProblem to false.`
      }]
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY || 'sk-or-v1-free'}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://github.com/Ash-neon/reddit-problem-finder',
        'X-Title': 'Reddit Problem Finder'
      },
      timeout: 10000
    });

    const content = response.data.choices[0].message.content;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return { hasProblem: false };
  } catch (error) {
    console.error('AI Analysis error:', error.message);
    return keywordAnalysis(text);
  }
}

function keywordAnalysis(text) {
  const problemKeywords = [
    'problem', 'issue', 'frustrat', 'annoying', 'difficult', 'hard to',
    'wish', 'need', 'want', 'struggling', 'pain', 'hate', 'terrible',
    'broken', 'doesn\'t work', 'bug', 'error', 'fail', 'sucks'
  ];
  
  const lowerText = text.toLowerCase();
  const foundKeywords = problemKeywords.filter(kw => lowerText.includes(kw));
  
  if (foundKeywords.length >= 2) {
    return {
      hasProblem: true,
      problem: text.substring(0, 200),
      severity: foundKeywords.length >= 4 ? 'high' : 'medium',
      context: `Keywords: ${foundKeywords.join(', ')}`
    };
  }
  
  return { hasProblem: false };
}

async function fetchRedditPosts(subreddit, query = '', limit = 25) {
  try {
    const searchUrl = query 
      ? `https://www.reddit.com/r/${subreddit}/search.json?q=${encodeURIComponent(query)}&restrict_sr=1&limit=${limit}`
      : `https://www.reddit.com/r/${subreddit}/hot.json?limit=${limit}`;
    
    const response = await axios.get(searchUrl, {
      headers: { 'User-Agent': 'RedditProblemFinder/1.0' }
    });
    
    return response.data.data.children.map(child => ({
      title: child.data.title,
      selftext: child.data.selftext,
      url: `https://reddit.com${child.data.permalink}`,
      score: child.data.score,
      num_comments: child.data.num_comments
    }));
  } catch (error) {
    console.error('Reddit fetch error:', error.message);
    return [];
  }
}

// API Endpoints
app.post('/api/analyze', async (req, res) => {
  try {
    const { subreddit, query, limit = 25 } = req.body;
    
    if (!subreddit) {
      return res.status(400).json({ error: 'Subreddit is required' });
    }
    
    const posts = await fetchRedditPosts(subreddit, query, limit);
    
    if (posts.length === 0) {
      return res.json({ problems: [], message: 'No posts found' });
    }
    
    const problems = [];
    for (const post of posts) {
      const text = `${post.title} ${post.selftext}`.substring(0, 1000);
      const analysis = await analyzeWithFreeAI(text, subreddit);
      
      if (analysis.hasProblem) {
        const problem = {
          subreddit,
          problem: analysis.problem,
          context: analysis.context || post.title,
          severity: analysis.severity || 'medium',
          post_url: post.url
        };
        
        db.run(
          'INSERT INTO problems (subreddit, problem, context, severity, post_url) VALUES (?, ?, ?, ?, ?)',
          [problem.subreddit, problem.problem, problem.context, problem.severity, problem.post_url]
        );
        
        problems.push(problem);
      }
    }
    
    db.run(
      'INSERT INTO searches (query, subreddit, problems_found) VALUES (?, ?, ?)',
      [query || 'hot posts', subreddit, problems.length]
    );
    
    saveDatabase();
    
    res.json({
      success: true,
      subreddit,
      analyzed: posts.length,
      problems_found: problems.length,
      problems
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/problems', (req, res) => {
  const { subreddit, severity, limit = 50 } = req.query;
  
  let query = 'SELECT * FROM problems WHERE 1=1';
  const params = [];
  
  if (subreddit) {
    query += ' AND subreddit = ?';
    params.push(subreddit);
  }
  
  if (severity) {
    query += ' AND severity = ?';
    params.push(severity);
  }
  
  query += ' ORDER BY created_at DESC LIMIT ?';
  params.push(parseInt(limit));
  
  const stmt = db.prepare(query);
  stmt.bind(params);
  
  const problems = [];
  while (stmt.step()) {
    problems.push(stmt.getAsObject());
  }
  stmt.free();
  
  res.json({ problems, count: problems.length });
});

app.get('/api/stats', (req, res) => {
  const getCount = (query) => {
    const stmt = db.prepare(query);
    stmt.step();
    const result = stmt.getAsObject();
    stmt.free();
    return result.count || 0;
  };
  
  const getArray = (query) => {
    const stmt = db.prepare(query);
    const results = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    stmt.free();
    return results;
  };
  
  const stats = {
    total_problems: getCount('SELECT COUNT(*) as count FROM problems'),
    total_searches: getCount('SELECT COUNT(*) as count FROM searches'),
    by_severity: getArray('SELECT severity, COUNT(*) as count FROM problems GROUP BY severity'),
    top_subreddits: getArray('SELECT subreddit, COUNT(*) as count FROM problems GROUP BY subreddit ORDER BY count DESC LIMIT 10')
  };
  
  res.json(stats);
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'operational',
    database: 'SQL.js (pure JavaScript)',
    ai_model: 'Free OpenRouter models',
    cost: '$0.00'
  });
});

const PORT = process.env.PORT || 3000;

initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`🔍 Reddit Problem Finder running on port ${PORT}`);
    console.log(`💰 Cost: $0.00 - Using free tier services`);
  });
});