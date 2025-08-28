# SmartWeld AI - MCP-Powered IoT Data Intelligence Platform

> 🤖 An advanced AI-powered system that transforms IoT welding data into actionable insights using Model Context Protocol (MCP), LangChain, and conversational AI.

[![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-v4.4+-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-v18.2+-61dafb.svg)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-v13+-336791.svg)](https://www.postgresql.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🌟 Overview

SmartWeld AI is a complete IoT data intelligence platform that enables natural language interactions with industrial welding data. Built on the **Model Context Protocol (MCP)**, it provides:

- 🗣️ **Conversational AI Interface** - Chat with your data in natural language
- 🔧 **MCP-Powered Tools** - Extensible tool ecosystem for data access
- 📊 **Dynamic Visualizations** - Auto-generated charts and insights
- 🏭 **IoT Integration** - Real-time MQTT data processing
- 🧠 **Intelligent Analysis** - LLM-powered data interpretation

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    SmartWeld AI Platform                        │
├─────────────────┬─────────────────┬─────────────────────────────┤
│   Frontend      │  Agentic AI     │       MCP Server            │
│   (React)       │   Server        │      (Tools)                │
│                 │  (LangChain)    │                             │
│  ┌─────────────┐│ ┌─────────────┐ │ ┌─────────────────────────┐ │
│  │ Chat UI     ││ │ Conversational│ │ │ Database Tools          │ │
│  │ Components  ││ │ Agent         │ │ │ - LangChain SQL Agent   │ │
│  │ Visualizations││ │ GPT-4 LLM   │ │ │ - Schema Discovery      │ │
│  │ Dashboard   ││ │ Tool Calling  │ │ │ - Query Execution       │ │
│  └─────────────┘│ └─────────────┘ │ └─────────────────────────┘ │
│                 │                 │ ┌─────────────────────────┐ │
│                 │                 │ │ Weather Tools           │ │
│                 │                 │ │ - Forecast API          │ │
│                 │                 │ │ - Alerts Integration    │ │
│                 │                 │ └─────────────────────────┘ │
└─────────────────┴─────────────────┴─────────────────────────────┘
          │                   │                         │
          ▼                   ▼                         ▼
┌─────────────────┐  ┌─────────────────┐    ┌─────────────────┐
│   User Input    │  │  LLM Processing │    │  Data Sources   │
│   Natural Lang  │  │  Tool Selection │    │  PostgreSQL     │
│   Voice/Text    │  │  Response Gen   │    │  Weather APIs   │
└─────────────────┘  └─────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** v18+ and npm
- **PostgreSQL** v13+ database
- **OpenAI API Key** (for GPT-4 access)
- **Git** for version control

### 1. Clone the Repository

```bash
git clone <repository-url>
cd SmartWeld-MCP-AI
```

### 2. Environment Setup

Create environment files for each component:

#### **MCP Server** (`.env` in `mcp-server-stdio/`)
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=smartweld
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_SCHEMA=public

# AI Configuration
OPENAI_API_KEY=sk-your-openai-api-key

# Server Configuration
NODE_ENV=development
```

#### **Agentic Server** (`.env` in `agentic-server/`)
```env
# Server Configuration
NODE_ENV=development
PORT=5001
CORS_ORIGIN=http://localhost:3000

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=smartweld
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_SCHEMA=public

# AI Configuration
OPENAI_API_KEY=sk-your-openai-api-key
LLM_MODEL=gpt-4o

# Optional: Additional LLM Providers
GEMINI_API_KEY=your-gemini-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key

# Security
JWT_SECRET=your-super-secret-jwt-key
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com

# Monitoring & Logging
LOG_LEVEL=info
MONITORING_ENABLED=true
```

#### **React Frontend** (`.env` in `ai-chatbot-smartweld/`)
```env
# API Configuration
REACT_APP_API_URL=http://localhost:5001
NODE_ENV=development

# Optional: Authentication
REACT_APP_AUTH_ENABLED=false
```

### 3. Database Setup

```sql
-- Create database
CREATE DATABASE smartweld;

-- Create user (optional)
CREATE USER smartweld_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE smartweld TO smartweld_user;

-- Connect to database and create sample tables
\c smartweld;

CREATE TABLE device_telemetry (
    id SERIAL PRIMARY KEY,
    device_id VARCHAR(50),
    temperature DECIMAL(5,2),
    voltage DECIMAL(5,2),
    current DECIMAL(5,2),
    gas_level DECIMAL(5,2),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO device_telemetry (device_id, temperature, voltage, current, gas_level) VALUES
('WELD001', 750.5, 220.0, 15.2, 85.5),
('WELD002', 680.3, 210.5, 12.8, 78.2),
('WELD003', 820.1, 230.2, 18.5, 92.1);
```

### 4. Installation & Startup

#### Terminal 1: MCP Server
```bash
cd mcp-server-stdio
npm install
npm run build
npm start
```

#### Terminal 2: Agentic AI Server
```bash
cd agentic-server
npm install
npm run dev
```

#### Terminal 3: React Frontend
```bash
cd ai-chatbot-smartweld
npm install
npm start
```

### 5. Verify Installation

1. **Check MCP Server**: Should show "MCP is running on stdio"
2. **Check AI Server**: Visit `http://localhost:5001/health`
3. **Check Frontend**: Visit `http://localhost:3000`

## 📁 Project Structure

```
SmartWeld-MCP-AI/
├── mcp-server-stdio/          # MCP Protocol Server
│   ├── src/
│   │   ├── tools/             # MCP Tools Implementation
│   │   │   ├── databaseTools/ # Database query tools
│   │   │   └── weatherForecastTool/ # Weather API tools
│   │   ├── config/            # Database & connection config
│   │   ├── interfaces/        # TypeScript interfaces
│   │   └── index.ts           # MCP server entry point
│   ├── build/                 # Compiled JavaScript
│   └── package.json
│
├── agentic-server/            # AI Agent Server
│   ├── src/
│   │   ├── agents/            # AI agent implementations
│   │   │   ├── conversational-agent.ts # Main chat agent
│   │   │   ├── sql-toolkit.ts # Database analysis tools
│   │   │   └── rag-retriever.ts # RAG for documents
│   │   ├── mcp/               # MCP client integration
│   │   │   ├── mcpClient.ts   # MCP connection client
│   │   │   └── mcpToolWrapper.ts # Tool wrapper utilities
│   │   ├── config/            # Database & app configuration
│   │   ├── models/            # Data models
│   │   └── index.ts           # Express server entry point
│   └── package.json
│
├── ai-chatbot-smartweld/      # React Frontend
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── Chat.jsx       # Main chat interface
│   │   │   └── chatbotComponents/ # Visualization components
│   │   ├── chatbotAPICalls/   # API integration
│   │   ├── contexts/          # React contexts
│   │   └── pages/             # Application pages
│   ├── public/
│   └── package.json
│
├── README.md                  # This file
└── blog-post-mcp-smartweld.md # Technical blog post
```

## 🔧 Configuration Guide

### Database Configuration

The system supports multiple database configurations:

```typescript
// Production configuration
export const dbConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  schema: process.env.DB_SCHEMA || 'public',
  ssl: process.env.NODE_ENV === 'production'
};
```

### MCP Tools Configuration

Add new tools by implementing the MCP Tool interface:

```typescript
export const customTool: Tool = {
  name: "custom-tool",
  description: "Description of what the tool does",
  inputSchema: {
    type: "object",
    properties: {
      query: { type: "string" }
    }
  },
  async execute(input: Record<string, unknown>) {
    // Tool implementation
    return { content: "Tool result" };
  }
};
```

### AI Model Configuration

Support for multiple LLM providers:

```typescript
// OpenAI (recommended)
const openaiModel = new ChatOpenAI({
  model: "gpt-4o",
  apiKey: process.env.OPENAI_API_KEY,
  temperature: 0,
});

// Gemini (alternative)
const geminiModel = new ChatGoogleGenerativeAI({
  model: "gemini-1.5-flash",
  apiKey: process.env.GEMINI_API_KEY,
});
```

## 🛠️ Available Commands

### MCP Server Commands
```bash
npm run build          # Compile TypeScript to JavaScript
npm run build:unix     # Build with Unix permissions
npm run dev            # Development mode with auto-reload
npm start              # Start compiled server
```

### Agentic Server Commands
```bash
npm run start          # Production mode
npm run dev            # Development mode with nodemon
npm test               # Run tests (if configured)
```

### Frontend Commands
```bash
npm start              # Development server
npm run build          # Production build
npm test               # Run test suite
npm run eject          # Eject from Create React App
```

## 🔐 Security & Credentials Management

### Environment Variables Security
- **Never commit `.env` files** to version control
- Use different credentials for development and production
- Rotate API keys regularly
- Use strong, unique passwords for database access

### API Key Management
```bash
# Secure storage of API keys
export OPENAI_API_KEY="sk-your-key-here"
export GEMINI_API_KEY="your-gemini-key"

# Or use a secure key management service
# AWS Secrets Manager, Azure Key Vault, etc.
```

### Database Security
```sql
-- Create dedicated user with limited permissions
CREATE USER smartweld_app WITH PASSWORD 'secure_random_password';
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO smartweld_app;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO smartweld_app;
```

## 🚀 Deployment

### Production Deployment Checklist

1. **Environment Setup**
   - [ ] Set `NODE_ENV=production`
   - [ ] Configure production database
   - [ ] Set secure CORS origins
   - [ ] Enable HTTPS

2. **Database Migration**
   ```bash
   # Run migrations
   npm run migrate:up
   
   # Seed initial data
   npm run seed:production
   ```

3. **Server Deployment**
   ```bash
   # Build all components
   cd mcp-server-stdio && npm run build
   cd ../agentic-server && npm run build
   cd ../ai-chatbot-smartweld && npm run build
   
   # Start with process manager
   pm2 start ecosystem.config.js
   ```

4. **Docker Deployment** (Optional)
   ```bash
   # Build Docker image
   docker build -t smartweld-ai .
   
   # Run with environment variables
   docker run -d \
     --name smartweld-ai \
     -p 5001:5001 \
     -e OPENAI_API_KEY=your-key \
     -e DB_HOST=your-db-host \
     smartweld-ai
   ```

### Production Environment Variables
```env
# Production specific
NODE_ENV=production
PORT=5001
CORS_ORIGIN=https://your-domain.com

# Database (use connection pooling)
DB_MAX_CONNECTIONS=20
DB_IDLE_TIMEOUT=30000

# Security
JWT_SECRET=super-secure-64-character-random-string
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Monitoring
LOG_LEVEL=warn
MONITORING_ENABLED=true
METRICS_PORT=9090
```

## 🐛 Troubleshooting

### Common Issues

#### 1. MCP Connection Fails
```bash
# Check if MCP server is running
ps aux | grep "mcp-server"

# Check logs
tail -f mcp-server-stdio/logs/server.log

# Test connection manually
node -e "
const { connectToMcpServer } = require('./agentic-server/src/mcp/mcpClient');
connectToMcpServer('./mcp-server-stdio/build/index.js').then(console.log);
"
```

#### 2. Database Connection Issues
```bash
# Test database connectivity
psql -h localhost -U smartweld_user -d smartweld -c "SELECT 1"

# Check connection string
echo $DATABASE_URL

# Verify credentials
npm run db:test
```

#### 3. OpenAI API Errors
```bash
# Verify API key format
echo $OPENAI_API_KEY | grep "^sk-"

# Test API connectivity
curl -H "Authorization: Bearer $OPENAI_API_KEY" \
     "https://api.openai.com/v1/models"

# Check rate limits
npm run ai:test
```

#### 4. Frontend API Connection
```javascript
// Test API endpoint
fetch('http://localhost:5001/health')
  .then(r => r.json())
  .then(console.log);

// Check CORS configuration
console.log('API URL:', process.env.REACT_APP_API_URL);
```

### Debug Mode

Enable debug logging:
```env
# In .env files
DEBUG=true
LOG_LEVEL=debug
VERBOSE_LOGGING=true
```

View debug information:
```bash
# MCP Server debug
DEBUG=mcp* npm start

# AI Server debug
DEBUG=agent* npm run dev

# Frontend debug
REACT_APP_DEBUG=true npm start
```

## 📊 Monitoring & Observability

### Health Checks
```bash
# Check all services
curl http://localhost:5001/health
curl http://localhost:3000/health
```

### Metrics & Logging
```javascript
// Built-in metrics endpoint
GET /metrics  // Prometheus format
GET /status   // System status
```

### Performance Monitoring
```bash
# Database query performance
npm run db:analyze

# LLM response times
npm run ai:benchmark

# Frontend bundle analysis
npm run analyze
```

## 🤝 Contributing

### Development Workflow

1. **Fork & Clone**
   ```bash
   git clone <your-fork-url>
   cd SmartWeld-MCP-AI
   ```

2. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Development Setup**
   ```bash
   # Install dependencies for all components
   npm run install:all
   
   # Start development environment
   npm run dev:all
   ```

4. **Code Standards**
   ```bash
   # Lint code
   npm run lint
   
   # Format code
   npm run format
   
   # Run tests
   npm run test:all
   ```

5. **Submit Changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   git push origin feature/your-feature-name
   ```

### Code Style Guidelines

- **TypeScript**: Strict mode enabled
- **Linting**: ESLint with Prettier
- **Naming**: camelCase for variables, PascalCase for components
- **Commits**: Conventional commit format

## 📚 Additional Resources

### Documentation
- [Model Context Protocol Specification](https://spec.modelcontextprotocol.io/)
- [LangChain Documentation](https://langchain.readthedocs.io/)
- [OpenAI API Reference](https://platform.openai.com/docs/)
- [React Documentation](https://react.dev/)

### Community
- [MCP GitHub Repository](https://github.com/modelcontextprotocol)
- [LangChain Community](https://github.com/langchain-ai/langchain)
- [OpenAI Community](https://community.openai.com/)

### Related Projects
- [MCP Python SDK](https://github.com/modelcontextprotocol/python-sdk)
- [LangGraph](https://github.com/langchain-ai/langgraph)
- [Claude Desktop MCP](https://claude.ai/docs/mcp)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors & Acknowledgments

- **Development Team**: SmartWeld AI Team
- **Special Thanks**: Anthropic (MCP), LangChain, OpenAI communities
- **Inspiration**: Industrial IoT and AI democratization

---

## 🆘 Support

Having issues? We're here to help!

- **📧 Email**: [your-email@domain.com]
- **💬 Discord**: [Your Discord Server]
- **🐛 Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **📖 Wiki**: [Project Wiki](https://github.com/your-repo/wiki)

---

*Built with ❤️ for the future of intelligent manufacturing*
