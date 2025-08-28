import 'dotenv/config';
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage, AIMessage } from '@langchain/core/messages';
import { StateGraph, MessagesAnnotation } from "@langchain/langgraph";
import { MemorySaver } from "@langchain/langgraph";
import { callTool as callMCPTool, listTools as listMCPTools } from '../mcp/mcpToolWrapper';
import { robustJSONParse } from '../helpers/jsonParser';

// ==================== TYPES AND INTERFACES ====================

interface AgentState {
    conversationMemory: Map<string, any[]>;
    systemMessage: string;
    workflow: any;
    checkpointer: any;
}

interface ConversationResponse {
    content: any;
    sessionId: string;
    timestamp: string;
    error?: boolean;
    type?: string;
    isGeneric?: boolean;
}

// ==================== PURE FUNCTIONS ====================

//---------- Step1: Dynamically Load MCP Tools ------------------
const loadMCPTools = async (): Promise<any[]> => {
    try {
        const mcpTools = await listMCPTools();
        console.log(`📋 Found ${mcpTools.length} MCP tools:`, mcpTools.map(t => t.name));

        // Convert MCP tools to LangChain tool format for bindTools()
        return mcpTools.map((mcpTool: any) => ({
            type: "function",
            function: {
                name: mcpTool.name,
                description: mcpTool.description || `Tool: ${mcpTool.name}`,
                parameters: mcpTool.inputSchema,
            }
        }));
    } catch (error) {
        console.error("❌ Failed to load MCP tools:", error);
        return [];
    }
};

// ----------------- Step 2: Initialize OpenAI LLM -----------------
const openaiAPIKey = process.env.OPENAI_API_KEY;

if (!openaiAPIKey) {
    throw new Error("OPENAI_API_KEY environment variable is not set. Get one at https://platform.openai.com/api-keys");
}

// Validate API key format
const validateOpenAIApiKey = (apiKey: string): boolean => {
    return apiKey.startsWith('sk-') && apiKey.length > 40;
};

if (!validateOpenAIApiKey(openaiAPIKey)) {
    console.warn("⚠️ OpenAI API key format looks incorrect. Expected format: sk-...");
}

// Creating model with tools using OpenAI
const createModelWithTools = async (): Promise<any> => {
    const tools = await loadMCPTools();

    try {
        const chatModel = new ChatOpenAI({
            model: "gpt-4o",
            apiKey: openaiAPIKey,
            temperature: 0,
            maxTokens: 2048,
            maxRetries: 3,
            timeout: 30000,
        });

        //Just to test the connection, not a part of the workflow
        await chatModel.invoke([new HumanMessage("Test")]);
        return chatModel.bindTools(tools);

    } catch (error) {
        console.error("❌ Connection between LLM failed:", (error as Error).message);
        throw new Error(`LLM Connection failed: ${(error as Error).message}`);
    }
};

// ----------------- Step 3: Pure Functions for Workflow Nodes -----------------

const callModel = async (state: typeof MessagesAnnotation.State): Promise<any> => {
    try {
        const model = await createModelWithTools();
        
        const response = await model.invoke(state.messages);
        
        // Log tool calls if any
        if (response.tool_calls && response.tool_calls.length > 0) {
            console.log("🔧 LLM decided to call tools:", response.tool_calls.map((tc: any) => ({
                name: tc.name,
                args: tc.args
            })));
        }
        
        return { messages: [response] };
    } catch (error: any) {
        console.error("❌ LLM call failed:", error);
        return {
            messages: [new AIMessage(JSON.stringify({
                summary: `LLM Error: ${error.message || 'Unknown error'}`,
                data: [],
                visualizations: [],
                insights: ["LLM service temporarily unavailable"],
                recommendations: [
                    "Check your OPENAI_API_KEY in .env file",
                    "Verify your OpenAI account has credits available",
                    "Try again in a few moments",
                    "Check OpenAI status at https://status.openai.com/"
                ]
            }))]
        };
    }
};

// Custom tool node that handles MCP tool execution
const callTools = async (state: typeof MessagesAnnotation.State): Promise<any> => {
    const { messages } = state;
    const lastMessage = messages[messages.length - 1] as AIMessage;

    if (!lastMessage.tool_calls || lastMessage.tool_calls.length === 0) {
        console.log("🔍 No tool calls found in last message");
        return { messages: [] };
    }

    console.log(`🔧 Processing ${lastMessage.tool_calls.length} tool call(s)`);
    const toolMessages = [];

    for (const toolCall of lastMessage.tool_calls) {
        try {
            const result = await callMCPTool(toolCall.name, toolCall.args || {});

            toolMessages.push({
                role: "tool",
                content: JSON.stringify(result),
                tool_call_id: toolCall.id,
                name: toolCall.name
            });
        } catch (error) {
            console.error(`❌ Error executing tool ${toolCall.name}:`, error);
            toolMessages.push({
                role: "tool",
                content: JSON.stringify({
                    error: `Failed to execute tool ${toolCall.name}: ${error instanceof Error ? error.message : 'Unknown error'}`
                }),
                tool_call_id: toolCall.id,
                name: toolCall.name
            });
        }
    }

    return { messages: toolMessages };
};

// ----------------- Step 4: Pure Conditional Logic -----------------
const shouldContinue = ({ messages }: typeof MessagesAnnotation.State): string => {
    
    const lastMessage = messages[messages.length - 1] as AIMessage;

    // Continue only if the last message is an AI message with tool calls
    if (lastMessage.tool_calls?.length) {
        console.log("🔄 Continuing to process tool calls in SHORT-TERM MEMORY by SHOULD CONTINUE F(x).", lastMessage.tool_calls?.length);
        return "tools";
    }

    // Otherwise, end the workflow
    console.log("🏁 Ending workflow. No tool calls or final response received.");
    return "__end__";
};

// ----------------- Step 5: Pure Functions for State Management -----------------

// Create system message (pure function)
const createSystemMessage = (): string => {
    return `
        You are an intelligent data analyst with conversation memory. You can answer questions by calling specific tools and remember previous interactions.

        Tool: query-database
        Description: Unified tool that handles all database queries intelligently.

        CONVERSATION MEMORY:
        - You have access to the full conversation history
        - Reference previous questions and answers when relevant
        - Build upon previous context to provide better responses
        - If asked about previous interactions, summarize what was discussed

        RESPONSE FORMAT RULES:
        1. For DATABASE questions (containing words like: list, show, count, users, sensors, hardware, data, table, etc.):
        - MUST call query-database tool
        - MUST return JSON format only
        - MUST include MULTIPLE visualizations (table + bar_chart + pie_chart) for rich data
        
        2. For NON-DATABASE questions (greetings, general chat, help, follow-ups):
        - Return simple text response
        - Reference conversation history when appropriate
        - Format: "I'm a SmartWeld data analyst assistant. Please ask me about your database - like 'list all users' or 'count sensors'."

        DATABASE QUESTION DETECTION:
        If user asks about: users, sensors, hardware, data, tables, count, list, show, database, SQL, records, etc.
        → Use query-database tool and return JSON

        NON-DATABASE QUESTION:
        If user says: hello, hi, help, thanks, etc.
        → Return simple helpful text

        Example DATABASE: "List all users" → Call tool → Return JSON with multiple visualizations
        Example NON-DATABASE: "Hello" → Return "I'm a SmartWeld data analyst assistant. Please ask me about your database."
        
        MULTI-VISUALIZATION EXAMPLE:
        For "Show user statistics" query, return:
        {
            "summary": "Found 150 users across 3 roles",
            "data": [{"role": "admin", "count": 10}, {"role": "user", "count": 120}, {"role": "guest", "count": 20}],
            "visualizations": [
                {
                    "type": "table",
                    "title": "User Statistics Table",
                    "data": [["admin", 10], ["user", 120], ["guest", 20]],
                    "config": {"columns": ["Role", "Count"]}
                },
                {
                    "type": "bar_chart",
                    "title": "Users by Role",
                    "data": [{"role": "admin", "count": 10}, {"role": "user", "count": 120}, {"role": "guest", "count": 20}],
                    "config": {
                        "xAxis": "role",
                        "yAxis": "count",
                        "annotations": [
                            {"type": "text", "x": "user", "y": 120, "text": "80% of users"}
                        ]
                    }
                },
                {
                    "type": "pie_chart",
                    "title": "User Distribution",
                    "data": [{"role": "admin", "count": 10}, {"role": "user", "count": 120}, {"role": "guest", "count": 20}],
                    "config": {
                        "xAxis": "role",
                        "yAxis": "count",
                        "annotations": [
                            {"type": "text", "x": "user", "y": 120, "text": "Majority"}
                        ]
                    }
                }
            ],
            "insights": ["80% of users are regular users", "Admin users represent 6.7% of total"],
            "recommendations": ["Consider role-based access controls", "Monitor guest user activity"]
        }
    
        MANDATORY RESPONSE FORMAT (JSON only):
            {
            "summary": "Clear explanation of findings",
            "data": [...], // Raw data array - LIMIT to first 5 records for display
            "visualizations": [
                {
                "type": "table|bar_chart|pie_chart|line_chart|metric_card",
                "title": "Descriptive title",
                "data": [...], // Processed data for visualization
                "config": {
                    "xAxis": "column_name",
                    "yAxis": "column_name",
                    "annotations": [
                        {
                            "type": "text",
                            "x": "data_point",
                            "y": "value",
                            "text": "Annotation text"
                        }
                    ]
                }
                }
            ],
            "insights": ["Data-driven insights"],
            "recommendations": ["Actionable recommendations"]
            }

            CRITICAL LIMITS:
            - For table listings: Include ALL tables in data array (no limit)
            - For other data: Keep data array to maximum 5 records for display
            - Keep total response under 3000 characters
            - This prevents JSON parsing errors

            VISUALIZATION GUIDELINES:
            - ALWAYS include MULTIPLE chart types when data has comparisons or multiple categories
            - REQUIRED: Include at least 3 visualization types (table, bar_chart, pie_chart) for rich data
            - table: Always include for raw data display
            - For table listings: Include ALL tables in the data array, not just first few
            - TABLE DATA STRUCTURE: data must be array of arrays (rows), not flat array
            - TABLE CONFIG: Use "columns" or "headers", NOT "xAxis"/"yAxis" (those are for charts)
            - bar_chart: For comparisons, rankings, quantities, distributions
            - pie_chart: For categorical breakdowns, percentages, proportions
            - line_chart: For time-based data, trends, progressions
            - metric_card: For key numbers, totals, counts, KPIs
            - ANNOTATIONS: Always include relevant annotations for charts to highlight key insights

            EXAMPLES OF GOOD BEHAVIOR:
            ❌ "I need to find sensor downtime data"
            ✅ *Uses tools* → "Found 5 downtime records in sensor_downtime_logs table"

            ❌ "Could you specify which table?"
            ✅ *Lists tables, identifies relevant ones* → Shows actual data

            MULTI-CHART EXAMPLE:
            ✅ "Show user statistics" → Include table + bar_chart + pie_chart
            ✅ "Compare sensor data" → Include bar_chart + pie_chart + line_chart
            ✅ "Analyze downtime reasons" → Include pie_chart + bar_chart + table
            
            TABLE LISTING EXAMPLE:
            ✅ "List all tables" → Include ALL tables in data array, not just first 3
            ✅ "Show database tables" → Return complete list with all table names
            ✅ CORRECT TABLE STRUCTURE:
               "data": [["migrations"], ["password_resets"], ["failed_jobs"]]
               "config": {"columns": ["Table Name"]}
            ❌ WRONG TABLE STRUCTURE:
               "data": ["migrations", "password_resets", "failed_jobs"]
               "config": {"xAxis": "Table Names", "yAxis": "Count"}
            
            ANNOTATION EXAMPLE:
            ✅ Include annotations to highlight key data points:
               "annotations": [
                   {"type": "text", "x": "High Value", "y": 150, "text": "Peak Performance"},
                   {"type": "text", "x": "Low Value", "y": 25, "text": "Needs Attention"}
               ]

            ALWAYS be helpful, proactive, and provide complete responses with actual data.
                
        CRITICAL INSTRUCTIONS:
        - Your response MUST start with '{' and end with '}'. NO text, markdown, or code block markers before or after the JSON.
        - If the tool returns no data or an empty result, your final JSON MUST reflect this. Example: {"summary": "No data found for this query.", "data": [], ...}.
        - The 'query' argument for the tool must be a string.
        - If the query fails, explain the failure concisely in the 'summary' and 'insights' fields of the final JSON.`;
};

// Create workflow (pure function)
const createWorkflow = (): any => {
    const graph = new StateGraph(MessagesAnnotation)
        .addNode("agent", callModel)
        .addEdge("__start__", "agent")
        .addNode("tools", callTools)
        .addEdge("tools", "agent")
        .addConditionalEdges("agent", shouldContinue);

    return graph.compile();
};

// Create agent state (pure function)
const createAgentState = (): AgentState => {
    return {
        conversationMemory: new Map(),
        systemMessage: createSystemMessage(),
        workflow: createWorkflow(),
        checkpointer: new MemorySaver()
    };
};

// Parse response (pure function)
const parseResponse = (response: any): any => {
    const lastMessage = response.messages[response.messages.length - 1];
    const rawContent = lastMessage.content;

    // Check for generic responses
    if (typeof rawContent === "string") {
        const isGenericResponse = rawContent && (
            rawContent.toLowerCase().includes('hello') ||
            rawContent.toLowerCase().includes('assist') ||
            rawContent.toLowerCase().includes('help') ||
            rawContent.toLowerCase().includes('how can i') ||
            rawContent.toLowerCase().includes("i'm a data analyst") ||
            rawContent.toLowerCase().includes("please ask me about") ||
            rawContent.length < 200
        );

        if (isGenericResponse) {
            console.log("🔄 Detected generic response, returning as simple text");
            return rawContent;
        }
    }

    // Parse JSON responses
    try {
        if (typeof rawContent !== "string") {
            return rawContent;
        } else {
            return robustJSONParse(rawContent);
        }
    } catch (err) {
        console.error("❌ JSON Parsing Error:", err);
        return {
            summary: "An error occurred while parsing the AI's response.",
            data: [],
            visualizations: [],
            insights: [`Parsing error: ${err instanceof Error ? err.message : 'Unknown'}`],
            recommendations: [
                "The model may have provided an invalid format.",
                "Please try rephrasing your question.",
                "Review the prompt to ensure it forces valid JSON."
            ]
        };
    }
};

// Store conversation (pure function - returns new state)
const storeConversation = (state: AgentState, sessionId: string, messages: any[]): AgentState => {
    // Only store the conversation messages (excluding system message)
    const conversationMessages = messages.filter(msg => 
        msg.constructor.name !== 'SystemMessage'
    );
    
    const newMemory = new Map(state.conversationMemory);
    newMemory.set(sessionId, conversationMessages);
    
    console.log(`💾 Stored ${conversationMessages.length} conversation messages for session: ${sessionId}`);
    
    return {
        ...state,
        conversationMemory: newMemory
    };
};

// Get conversation history (pure function)
const getConversationHistory = (state: AgentState, sessionId: string): any[] => {
    try {
        return state.conversationMemory.get(sessionId) || [];
    } catch (error) {
        console.error("Error getting conversation history:", error);
        return [];
    }
};

// Clear conversation history (pure function - returns new state)
const clearConversationHistory = (state: AgentState, sessionId: string): AgentState => {
    try {
        const newMemory = new Map(state.conversationMemory);
        newMemory.delete(sessionId);
        console.log(`🗑️ Cleared conversation history for session: ${sessionId}`);
        
        return {
            ...state,
            conversationMemory: newMemory
        };
    } catch (error) {
        console.error("Error clearing conversation history:", error);
        return state;
    }
};

// ==================== MAIN CONVERSATIONAL FUNCTION ====================

// Main function to get conversational response (pure function)
export const getConversationalResponse = async (
    input: string, 
    sessionId: string | null = null,
    existingState?: AgentState
): Promise<{ response: ConversationResponse; updatedState: AgentState }> => {
    // Create new state for this request (request-scoped)
    const state = existingState || createAgentState();
    
    // Generate session ID if not provided
    const threadId = sessionId || `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    console.log(`💬 Processing chat message for session: ${threadId}`);
    
    try {
        // Get conversation history from state
        const history = getConversationHistory(state, threadId);
        console.log(`🔍 Retrieved ${history.length} messages from history`);

        // Create messages array with system message and history
        const messages = [
            new SystemMessage(state.systemMessage),
            ...history,
            new HumanMessage(input)
        ];

        console.log(`📤 Sending ${messages.length} messages to workflow`);

        // Run workflow
        const response = await state.workflow.invoke({ messages });

        console.log(`✅ Response generated for session: ${threadId}`);

        // Store the conversation in state (immutable update)
        const updatedState = storeConversation(state, threadId, messages);

        // Parse response
        const parsedContent = parseResponse(response);

        return {
            response: {
                content: parsedContent,
                sessionId: threadId,
                timestamp: new Date().toISOString()
            },
            updatedState
        };

    } catch (error) {
        console.error("❌ Agent Error:", error);
        
        // Check if it's a database connection error
        const isDbError = error instanceof Error && (
            error.message.includes('ECONNRESET') || 
            error.message.includes('Connection') ||
            error.message.includes('timeout')
        );
        
        if (isDbError) {
            return {
                response: {
                    content: {
                        summary: "I'm having trouble connecting to the database right now. Let me try to help you with general questions while the connection is being restored.",
                        data: [],
                        visualizations: [],
                        insights: ["Database connection temporarily unavailable"],
                        recommendations: ["Try asking general questions", "Check back in a few minutes", "Contact support if the issue persists"]
                    },
                    sessionId: sessionId || 'default',
                    timestamp: new Date().toISOString(),
                    error: true,
                    type: 'text',
                    isGeneric: true
                },
                updatedState: state
            };
        }
        
        return {
            response: {
                content: {
                    summary: `System Error: ${error instanceof Error ? error.message : 'Unknown'}`,
                    data: [],
                    visualizations: [],
                    insights: ["System error occurred"],
                    recommendations: ["Check system connectivity", "Verify API keys", "Try again"]
                },
                sessionId: sessionId || 'default',
                timestamp: new Date().toISOString(),
                error: true
            },
            updatedState: state
        };
    }
};

// ==================== UTILITY FUNCTIONS ====================

// Enhanced debug function (pure function)
export const debugMCPConnection = async (): Promise<any> => {
    try {
        console.log("🔍 Testing OpenAI GPT-4o connection...");

        // Test OpenAI API
        const testModel = new ChatOpenAI({
            model: "gpt-4o",
            apiKey: openaiAPIKey,
            maxTokens: 1000,
            timeout: 10000
        });

        await testModel.invoke([new HumanMessage("Test")]);
        console.log("✅ OpenAI GPT-4o API connection successful");

        // Test MCP tools
        const mcpTools = await listMCPTools();
        console.log(`✅ MCP Tools found: ${mcpTools.length}`);

        return {
            openaiConnection: true,
            mcpTools: mcpTools.length,
            tools: mcpTools.map((t: any) => t.name)
        };

    } catch (error: any) {
        console.error("❌ Debug failed:", error);
        return {
            openaiConnection: false,
            error: error instanceof Error ? error.message : String(error)
        };
    }
};

// ==================== EXPORTS ====================

// Export individual functions for direct import
export {
    createAgentState,
    getConversationHistory,
    clearConversationHistory,
    storeConversation
};

export default {
    getConversationalResponse,
    debugMCPConnection,
    createAgentState,
    getConversationHistory,
    clearConversationHistory,
    storeConversation
};