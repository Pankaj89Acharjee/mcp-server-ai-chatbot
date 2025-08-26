import 'dotenv/config';
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage, AIMessage } from '@langchain/core/messages';
import { StateGraph, MessagesAnnotation } from "@langchain/langgraph";
import { callTool as callMCPTool, listTools as listMCPTools } from '../mcp/mcpToolWrapper';

//---------- Step1: Dynamically Load MCP Tools ------------------
const loadMCPTools = async () => {
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

console.log("🔑 Using OpenAI as LLM provider");

// Create model with tools using OpenAI
const createModelWithTools = async () => {
    const tools = await loadMCPTools();

    try {
        console.log("🔄 Initializing OpenAI GPT-4o-mini model...");

        const chatModel = new ChatOpenAI({
            model: "gpt-4o",  // Latest GPT-4o model
            apiKey: openaiAPIKey,
            temperature: 0,
            maxTokens: 2048,
            maxRetries: 3,
            timeout: 30000,
        });

        // Test the model with a simple call
        await chatModel.invoke([new HumanMessage("Test")]);
        console.log("✅ Successfully connected to OpenAI GPT-4o-mini");

        return chatModel.bindTools(tools);

    } catch (error) {
        console.error("❌ OpenAI GPT-4o connection failed:", (error as Error).message);
        throw new Error(`OpenAI failed: ${(error as Error).message}`);
    }
};

// ----------------- Step 3: Enhanced Nodes with Error Handling -----------------

// Define the function that calls the model
const callModel = async (state: typeof MessagesAnnotation.State) => {
    try {
        console.log("🤖 Calling OpenAI GPT-4o model...");

        const model = await createModelWithTools();
        const response = await model.invoke(state.messages);

        console.log("✅ OpenAI GPT-4o response received");
        return { messages: [response] };

    } catch (error: any) {
        console.error("❌ OpenAI GPT-4o call failed:", error);

        // Return error as AI response
        return {
            messages: [{
                role: "assistant",
                content: JSON.stringify({
                    summary: `OpenAI API Error: ${error.message || 'Unknown error'}`,
                    data: [],
                    visualizations: [],
                    insights: ["LLM service temporarily unavailable"],
                    recommendations: [
                        "Check your OPENAI_API_KEY in .env file",
                        "Verify your OpenAI account has credits available",
                        "Try again in a few moments",
                        "Check OpenAI status at https://status.openai.com/"
                    ]
                })
            }]
        };
    }
};

// Custom tool node that handles MCP tool execution
const callTools = async (state: typeof MessagesAnnotation.State) => {
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
            console.log(`🔧 Executing tool: ${toolCall.name} with args:`, toolCall.args);
            console.log(`🔧 Args type:`, typeof toolCall.args);
            console.log(`🔧 Args keys:`, toolCall.args ? Object.keys(toolCall.args) : 'undefined');

            // Pass the args directly to the MCP tool - let it handle validation
            const result = await callMCPTool(toolCall.name, toolCall.args || {});

            console.log(`🔧 Tool ${toolCall.name} result:`, JSON.stringify(result, null, 2));

            toolMessages.push({
                role: "tool",
                content: JSON.stringify(result),
                tool_call_id: toolCall.id,
                name: toolCall.name
            });

            console.log(`✅ Tool ${toolCall.name} executed successfully`);

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

// ----------------- Step 4: Define Conditional Logic -----------------
function shouldContinue({ messages }: typeof MessagesAnnotation.State) {
    const lastMessage = messages[messages.length - 1] as AIMessage;

    // Continue only if the last message is an AI message with tool calls
    if (lastMessage.tool_calls?.length) {
        console.log("🔄 Continuing to process tool calls.");
        return "tools";
    }

    // Otherwise, end the workflow
    console.log("🏁 Ending workflow. No tool calls or final response received.");
    return "__end__";
}

// ----------------- Step 5: Build Workflow -----------------
const createWorkflow = () => {
    return new StateGraph(MessagesAnnotation)
        .addNode("agent", callModel)
        .addEdge("__start__", "agent") // __start__ is a special name for the entrypoint
        .addNode("tools", callTools)
        .addEdge("tools", "agent")
        .addConditionalEdges("agent", shouldContinue);
};

// ----------------- Step 6: Enhanced Main Function -----------------
export const getConversationalResponse = async (input: string, sessionId: string | null = null) => {
    console.log("🚀 SmartWeld AI - Processing:", input);

    try {
        // CLEAR STOP SIGNAL: Tell LLM exactly when to stop
        const systemMessage = `You are an intelligent data analyst. You can answer questions by calling specific tools.

Tool: query-database
Description: Unified tool that handles all database queries intelligently.

When the user asks a question about the database, you MUST call the "query-database" tool. This tool accepts either 'query' OR 'clientQuestion' parameter.
Example: For a user question like "How many users exist?", you should call the tool with:
query-database(query="How many users exist?")

        CRITICAL: YOU MUST CALL TOOLS!
        
        WORKFLOW RULES:
        1. For ANY database question, you MUST IMMEDIATELY call the 'query-database' tool
        2. NEVER answer database questions without calling the tool first
        3. Call the tool exactly ONCE with: query-database(query="user's question")
        4. Wait for the tool result, then format it into JSON
        5. STOP after formatting the response
        
        DO NOT:
        - Answer database questions without using tools
        - Make assumptions about data
        - Skip tool calls
        
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
                    "yAxis": "column_name"
                }
                }
            ],
            "insights": ["Data-driven insights"],
            "recommendations": ["Actionable recommendations"]
            }

            CRITICAL LIMITS:
            - Keep data array to maximum 3 records only
            - Keep total response under 2000 characters
            - This prevents JSON parsing errors

            VISUALIZATION GUIDELINES:
            - table: Always include for raw data display
            - bar_chart: For comparisons, rankings, quantities
            - pie_chart: For categorical breakdowns, status distributions  
            - line_chart: For time-based data, trends
            - metric_card: For key numbers, totals, counts

            EXAMPLES OF GOOD BEHAVIOR:
            ❌ "I need to find sensor downtime data"
            ✅ *Uses tools* → "Found 5 downtime records in sensor_downtime_logs table"

            ❌ "Could you specify which table?"
            ✅ *Lists tables, identifies relevant ones* → Shows actual data

            ALWAYS be helpful, proactive, and provide complete responses with actual data.
                
        CRITICAL INSTRUCTIONS:
        - Your response MUST start with '{' and end with '}'. NO text, markdown, or code block markers before or after the JSON.
        - If the tool returns no data or an empty result, your final JSON MUST reflect this. Example: {"summary": "No data found for this query.", "data": [], ...}.
        - The 'query' argument for the tool must be a string.
        - If the query fails, explain the failure concisely in the 'summary' and 'insights' fields of the final JSON.`;

        // Create and run workflow - SIMPLE like official docs
        const workflow = createWorkflow();
        const app = workflow.compile();

        console.log("🔄 Starting simple workflow...");
        const finalState = await app.invoke({
            messages: [
                new SystemMessage(systemMessage),  // ← ENABLED system message
                new HumanMessage(input)
            ]
        });

        const lastMessage = finalState.messages[finalState.messages.length - 1];
        const content = lastMessage.content;
        console.log("🔍 Raw LLM Response:", content);
        console.log("🔍 LLM Response whether string:", typeof content === 'string' ? content.substring(0, 200) + "..." : content);
        console.log("🔍 Raw LLM Response Length:", typeof content === 'string' ? content.length : 'N/A');
        console.log("🔍 Raw LLM Response Type:", typeof content);
        console.log("🔍 Total messages in workflow:", finalState.messages.length);
        console.log("🔍 Tool calls made:", (lastMessage as AIMessage).tool_calls?.length || 0);

        // Log all messages to see the conversation flow
        console.log("🔍 All messages in workflow:");


        finalState.messages.forEach((msg, index) => {
            console.log(`  ${index}: ${msg.constructor.name} - ${typeof msg.content === 'string' ? msg.content.substring(0, 100) + "..." : JSON.stringify(msg.content).substring(0, 100) + "..."}`);
        });

        // Parse JSON response with better extraction
        let parsedContent;
        try {
            const rawContent = lastMessage.content;

            if (typeof rawContent !== "string") {
                // If content is already an object (e.g., a ToolMessage result), use it directly.
                parsedContent = rawContent;
            } else {
                // Attempt to parse the string content as JSON.
                // It's best to avoid manual string cleanup.
                // The LLM should be instructed to provide valid JSON.
                parsedContent = JSON.parse(rawContent.trim());
            }

            console.log("✅ JSON parsing successful");

        } catch (err) {
            console.error("❌ JSON Parsing Error:", err);
            console.error("📝 Raw content that failed:", lastMessage.content);

            // Provide a standardized error response, since parsing failed.
            parsedContent = {
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
        return {
            content: parsedContent,
            sessionId,
            timestamp: new Date().toISOString()
        };



    } catch (error) {
        console.error("❌ Agent Error:", error);
        return {
            content: {
                summary: `System Error: ${error instanceof Error ? error.message : 'Unknown'}`,
                data: [],
                visualizations: [],
                insights: ["System error occurred"],
                recommendations: ["Check system connectivity", "Verify API keys", "Try again"]
            },
            sessionId,
            timestamp: new Date().toISOString(),
            error: true
        };
    }
};

// Enhanced debug function
export const debugMCPConnection = async () => {
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

export default {
    getConversationalResponse,
    debugMCPConnection
};