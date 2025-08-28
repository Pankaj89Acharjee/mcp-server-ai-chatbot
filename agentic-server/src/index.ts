import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { 
    getConversationalResponse, 
    debugMCPConnection, 
    createAgentState,
    getConversationHistory,
    clearConversationHistory
} from './agents/conversational-agent';
import { testDbConnection } from './config/remoteDBConnection';
import { connectToMcpServer, runTool } from './mcp/mcpClient';

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory session store for request-scoped state management
// This is a simple Map that stores agent states per session
// In production, this should be replaced with Redis or database
const sessionStore = new Map<string, any>();

// Helper function to get or create agent state for a session
const getAgentStateForSession = (sessionId: string) => {
    if (!sessionStore.has(sessionId)) {
        const newState = createAgentState();
        sessionStore.set(sessionId, newState);
        console.log(`🆔 Created new agent state for session: ${sessionId}`);
    }
    return sessionStore.get(sessionId);
};

// Cleanup function to remove old sessions (prevent memory leaks)
const cleanupOldSessions = () => {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    
    for (const [sessionId, state] of sessionStore.entries()) {
        // Extract timestamp from session ID (format: session-timestamp-random)
        const timestampMatch = sessionId.match(/session-(\d+)-/);
        if (timestampMatch) {
            const sessionTimestamp = parseInt(timestampMatch[1]);
            if (now - sessionTimestamp > maxAge) {
                sessionStore.delete(sessionId);
                console.log(`🧹 Cleaned up old session: ${sessionId}`);
            }
        }
    }
};

// Run cleanup every hour
setInterval(cleanupOldSessions, 60 * 60 * 1000);

//Connection to the MCP Server as it is stdio connection protocol
connectToMcpServer("F:/Nodeprogramming/GCPSDK/mcp-server-stdio/build/index.js");

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'SmartWeld Agentic AI Server is running',
        timestamp: new Date().toISOString(),
        activeSessions: sessionStore.size
    });
});

// Endpoint for AI agent with tools that calls MCP Server
app.post('/api/chat', async (req, res) => {
    try {
        const { message, sessionId } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        const threadId = sessionId || `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        console.log(`💬 Processing chat message for session: ${threadId}`);
        
        // Get or create agent state for this session
        const agentState = getAgentStateForSession(threadId);
        
        // Calling AI Agent Intelligence with request-scoped state
        const result = await getConversationalResponse(message, threadId, agentState);
        const response = result.response;
        const updatedState = result.updatedState;

        console.log(`✅ Response generated for session: ${threadId}`);
        
        // Update the session store with the new state
        sessionStore.set(threadId, updatedState);

        // Handle different response types from the agent
        if (response.type === 'text' && response.isGeneric) {
            // For generic text responses, returning simple format the UI can handle
            res.json({ 
                reply: {
                    summary: response.content, // UI expects summary field as a key for all response
                    isGeneric: true
                }
            });
        } else {
            // For database responses, ensure we have a proper structure
            let replyContent;
            
            if (typeof response.content === 'string') {
                // If it's already a string, wrap it in the expected format
                replyContent = {
                    summary: response.content,
                    data: [],
                    visualizations: [],
                    insights: [],
                    recommendations: []
                };
            } else if (typeof response.content === 'object' && response.content !== null) {
                // If it's an object, ensure it has the required fields
                replyContent = {
                    summary: response.content.summary || 'Analysis completed',
                    data: response.content.data || [],
                    visualizations: response.content.visualizations || [],
                    insights: response.content.insights || [],
                    recommendations: response.content.recommendations || []
                };
            } else {
                // Fallback for unexpected response types
                replyContent = {
                    summary: 'Received an unexpected response format',
                    data: [],
                    visualizations: [],
                    insights: ['Response format error'],
                    recommendations: ['Please try rephrasing your question']
                };
            }
            
            res.json({ reply: replyContent });
        }
    } catch (error) {
        console.error('❌ Error in chat endpoint:', error);
        res.status(500).json({
            error: 'Internal server error',
            details: error instanceof Error ? error.message : String(error)
        });
    }
});

// New endpoint to get conversation history for a session
app.get('/api/chat/history/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;
        
        if (!sessionId) {
            return res.status(400).json({ error: 'Session ID is required' });
        }

        console.log(`📚 Retrieving conversation history for session: ${sessionId}`);
        
        // Get agent state for this session
        const agentState = getAgentStateForSession(sessionId);
        const history = getConversationHistory(agentState, sessionId);
        
        res.json({
            sessionId,
            history,
            messageCount: history.length,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('❌ Error retrieving conversation history:', error);
        res.status(500).json({
            error: 'Failed to retrieve conversation history',
            details: error instanceof Error ? error.message : String(error)
        });
    }
});

// New endpoint to clear conversation history for a session
app.delete('/api/chat/history/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;
        
        if (!sessionId) {
            return res.status(400).json({ error: 'Session ID is required' });
        }

        console.log(`🗑️ Clearing conversation history for session: ${sessionId}`);
        
        // Get agent state for this session
        const agentState = getAgentStateForSession(sessionId);
        const updatedState = clearConversationHistory(agentState, sessionId);
        
        // Update the session store with the cleared state
        sessionStore.set(sessionId, updatedState);
        
        res.json({
            message: 'Conversation history cleared successfully',
            sessionId,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('❌ Error clearing conversation history:', error);
        res.status(500).json({
            error: 'Failed to clear conversation history',
            details: error instanceof Error ? error.message : String(error)
        });
    }
});

// New endpoint to list all active sessions
app.get('/api/chat/sessions', async (req, res) => {
    try {
        console.log('📋 Listing active sessions...');
        
        const sessions = Array.from(sessionStore.keys()).map(sessionId => {
            const state = sessionStore.get(sessionId);
            const history = getConversationHistory(state, sessionId);
            return {
                sessionId,
                messageCount: history.length,
                lastActivity: sessionId.match(/session-(\d+)-/) ? 
                    new Date(parseInt(sessionId.match(/session-(\d+)-/)?.[1] || '0')).toISOString() : 
                    'Unknown'
            };
        });
        
        res.json({
            sessions,
            totalSessions: sessions.length,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('❌ Error listing sessions:', error);
        res.status(500).json({
            error: 'Failed to list sessions',
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
            console.log(`📚 History endpoint: http://localhost:${PORT}/api/chat/history/:sessionId`);
            console.log(`🗑️ Clear history: http://localhost:${PORT}/api/chat/history/:sessionId (DELETE)`);
            console.log(`📋 Sessions endpoint: http://localhost:${PORT}/api/chat/sessions`);
            console.log(`🔍 Debug MCP: http://localhost:${PORT}/api/debug/mcp`);            
        });
    } catch (err) {
        console.error('❌ Startup failed:', err);
        process.exit(1);
    }
})();

