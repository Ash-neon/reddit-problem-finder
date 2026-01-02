# 🔍 Reddit Problem Finder

**AI-Powered User Research Tool - 100% Free, Zero Cost**

Automatically discover user problems, pain points, and frustrations from Reddit discussions using free AI models.

## 💰 Zero Cost Architecture

- **Database**: SQLite (file-based, no hosting needed)
- **AI Models**: Free tier OpenRouter models (Gemini 2.0 Flash, Llama 3.2, Phi-3)
- **Reddit API**: Public JSON endpoints (no API key required)
- **Hosting**: Deploy free on Railway, Render, or Vercel

## 🎯 What It Does

1. **Fetches Reddit Posts** from any subreddit
2. **AI Analysis** extracts problems and pain points
3. **Severity Classification** (High/Medium/Low)
4. **Persistent Storage** in SQLite database
5. **Beautiful Dashboard** to view results

## 🚀 Quick Start

### Installation

```bash
git clone https://github.com/Ash-neon/reddit-problem-finder.git
cd reddit-problem-finder
npm install
npm start
```

Open browser to `http://localhost:3000`

### Environment Variables (Optional)

```bash
# For better AI analysis (optional - works without it)
OPENROUTER_API_KEY=your_key_here

# Port (optional)
PORT=3000
```

## 📊 Features

### Core Capabilities

- ✅ **Subreddit Analysis** - Analyze any public subreddit
- ✅ **Keyword Search** - Filter posts by specific terms
- ✅ **AI-Powered** - Uses free Gemini 2.0 Flash model
- ✅ **Fallback Analysis** - Keyword-based when AI unavailable
- ✅ **Problem Severity** - Automatic classification
- ✅ **Persistent Storage** - SQLite database
- ✅ **Statistics Dashboard** - Track findings over time

### API Endpoints

**Analyze Posts:**
```bash
POST /api/analyze
{
  "subreddit": "entrepreneur",
  "query": "frustrating",
  "limit": 25
}
```

**Get Problems:**
```bash
GET /api/problems?subreddit=entrepreneur&severity=high&limit=50
```

**Get Statistics:**
```bash
GET /api/stats
```

**Health Check:**
```bash
GET /health
```

## 🎨 Use Cases

### For Entrepreneurs
- Find product ideas from user complaints
- Validate market problems
- Discover underserved niches

### For Developers
- Identify feature requests
- Find bugs users are experiencing
- Understand user frustrations

### For Marketers
- Discover pain points for messaging
- Find content ideas
- Understand customer language

### For Researchers
- Analyze user sentiment
- Track problem trends
- Gather qualitative data

## 🛠️ Tech Stack

- **Backend**: Node.js + Express
- **Database**: SQLite (better-sqlite3)
- **AI**: OpenRouter free models
- **Frontend**: Vanilla JavaScript
- **Styling**: Modern CSS

## 📈 Example Queries

```javascript
// Find SaaS problems
{
  "subreddit": "SaaS",
  "query": "struggling with",
  "limit": 50
}

// Find developer pain points
{
  "subreddit": "webdev",
  "query": "annoying OR frustrating",
  "limit": 25
}

// Find startup ideas
{
  "subreddit": "entrepreneur",
  "query": "wish there was",
  "limit": 100
}
```

## 🌐 Deployment

### Railway (Recommended)
```bash
# Connect GitHub repo
# Railway auto-detects and deploys
# SQLite database persists in volume
```

### Render
```bash
# New Web Service
# Connect GitHub
# Add persistent disk for database
```

### Vercel
```bash
npx vercel --prod
# Note: Use external DB for persistence
```

## 🔧 Configuration

### Free AI Models Used

1. **google/gemini-2.0-flash-exp:free** (Primary)
2. **meta-llama/llama-3.2-3b-instruct:free** (Fallback)
3. **microsoft/phi-3-mini-128k-instruct:free** (Fallback)

### Keyword Fallback

If AI is unavailable, uses keyword analysis:
- problem, issue, frustrat, annoying
- difficult, hard to, wish, need
- struggling, pain, hate, terrible
- broken, doesn't work, bug, error

## 📊 Database Schema

```sql
-- Problems table
CREATE TABLE problems (
  id INTEGER PRIMARY KEY,
  subreddit TEXT,
  problem TEXT,
  context TEXT,
  severity TEXT,
  post_url TEXT,
  created_at DATETIME
);

-- Searches table
CREATE TABLE searches (
  id INTEGER PRIMARY KEY,
  query TEXT,
  subreddit TEXT,
  problems_found INTEGER,
  created_at DATETIME
);
```

## 🎯 Roadmap

- [ ] Export to CSV/JSON
- [ ] Email alerts for new problems
- [ ] Multi-subreddit analysis
- [ ] Trend detection over time
- [ ] Problem clustering
- [ ] Sentiment analysis
- [ ] Chrome extension

## 📝 License

MIT

## 🤝 Contributing

Pull requests welcome! For major changes, open an issue first.

---

**Built with ❤️ using 100% free tools**

Cost: $0.00 | AI: Free Models | Database: SQLite | Hosting: Free Tier