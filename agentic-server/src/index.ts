import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { getConversationalResponse, debugMCPConnection } from './agents/conversational-agent';
import { testDbConnection } from './config/remoteDBConnection';
import { connectToMcpServer, runTool } from './mcp/mcpClient';

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());


//Connection to the MCP Server as it is stdio connection protocol
connectToMcpServer("F:/Nodeprogramming/GCPSDK/mcp-server-stdio/build/index.js");



// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'SmartWeld Agentic AI Server is running',
        timestamp: new Date().toISOString()
    });
});

// Single chat endpoint that uses the AI agent with all tools
app.post('/api/chat', async (req, res) => {
    console.log("Req.body is", req.body)
    try {
        const { message, sessionId } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        console.log(`📨 Received message: "${message}" from session: ${sessionId || 'unknown'}`);

        // Use the conversational agent that intelligently chooses from all available tools
        const response = await getConversationalResponse(message, sessionId || 'default');

        console.log(`✅ Response generated for session: ${sessionId || 'default'}`);

        res.json({ reply: response.content });
    } catch (error) {
        console.error('❌ Error in chat endpoint:', error);
        res.status(500).json({
            error: 'Internal server error',
            details: error instanceof Error ? error.message : String(error)
        });
    }
});

// Debug endpoint to test MCP connection directly
app.post('/api/debug/mcp', async (req, res) => {
   // const { sessionId } = req.body;
    try {
        console.log("🔍 Testing MCP connection via debug endpoint...");
        const result = await debugMCPConnection();
        res.status(200).json(result);
    } catch (error) {
        console.error("❌ MCP debug endpoint error:", error);
        res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
});

// Start server
(async () => {
    try {
        await testDbConnection();

        app.listen(PORT, () => {
            console.log(`🚀 SmartWeld Agentic AI Server running on port ${PORT}`);
            console.log(`📊 Health check: http://localhost:${PORT}/health`);
            console.log(`💬 Chat endpoint: http://localhost:${PORT}/api/chat`);
            console.log(`🔍 Debug MCP: http://localhost:${PORT}/api/debug/mcp`);            
        });
    } catch (err) {
        console.error('❌ Startup failed:', err);
        process.exit(1);
    }
})();

