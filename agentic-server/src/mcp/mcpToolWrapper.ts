import { client } from "./mcpClient";



/**
 * Convert MCP tool definitions to Gemini-compatible function_declarations format
 */
function convertToolsForGemini(tools: any[]) {
  return [
    {
      function_declarations: tools.map((tool: any) => ({
        name: sanitizeFunctionName(tool.name),
        description: tool.description,
        parameters: tool.parameters, // must already be JSON Schema object
      })),
    },
  ];
}

/**
 * Sanitize function names for Gemini compatibility
 * Must start with letter/underscore, only alphanumeric, underscores, dots, dashes
 */
export function sanitizeFunctionName(name: string): string {
  // Replace hyphens with underscores and ensure it starts with a letter or underscore
  let sanitized = name.replace(/-/g, '_');
  
  // If it doesn't start with a letter or underscore, add a prefix
  if (!/^[a-zA-Z_]/.test(sanitized)) {
    sanitized = 'tool_' + sanitized;
  }
  
  // Remove any other invalid characters
  sanitized = sanitized.replace(/[^a-zA-Z0-9_.]/g, '');
  
  // Ensure it's not longer than 64 characters
  if (sanitized.length > 64) {
    sanitized = sanitized.substring(0, 64);
  }
  
  return sanitized;
}



/**
 * Example: list and convert tools
 */
export async function listToolsForGemini() {
  if (!client) throw new Error("MCP client is not initialized.");
  try {
    const tools = await client.listTools();
    const geminiTools = convertToolsForGemini(tools.tools);
    console.log("Gemini-compatible tools:", JSON.stringify(geminiTools, null, 2));
    return geminiTools;
  } catch (error) {
    console.error("Error listing tools:", error);
    throw error;
  }
}

/**
 * List all available tools from the connected MCP server.
 */
export async function listTools() {
  if (!client) throw new Error("MCP client is not initialized.");
  try {
    const tools = await client.listTools();
    console.log("All tools are listed", tools)
    return tools.tools; // returns array of tool definitions
  } catch (error) {
    console.error("Error listing tools:", error);
    throw error;
  }
}

/**
 * Call a specific tool exposed by the MCP server.
 * @param toolName The name of the tool to call.
 * @param args Arguments for the tool (must match tool schema).
 */
export async function callTool(toolName: string, args: Record<string, any> = {}) {
  if (!client) throw new Error("MCP client is not initialized.");
  console.log("🔧 MCP Tool Wrapper - tool name:", toolName)
  console.log("🔧 MCP Tool Wrapper - args:", args)
  console.log("🔧 MCP Tool Wrapper - args type:", typeof args)
  console.log("🔧 MCP Tool Wrapper - args keys:", Object.keys(args))
  console.log("🔧 MCP Tool Wrapper - args.query:", args.query)
  
  try {
    console.log("🔧 MCP Tool Wrapper - calling client.callTool with:", { name: toolName, arguments: args });
    const response = await client.callTool({ name: toolName, arguments: args });
    console.log("🔧 MCP Tool Wrapper - response:", response);
    return response; // raw MCP response, usually { content, ... }
  } catch (error) {
    console.error(`❌ MCP Tool Wrapper Error calling tool "${toolName}":`, error);
    throw error;
  }
}


/**
 * Convert MCP tools into Gemini-compatible tool schema
 */
export async function getGeminiCompatibleTools() {
  const mcpTools = await listTools();

  // Return the correct format for newer LangChain versions
  return {
    tools: mcpTools.map((tool: any) => {
      // MCP tools use inputSchema, not parameters
      const schema = tool.inputSchema || tool.parameters || {};
      
      return {
        name: sanitizeFunctionName(tool.name),
        description: tool.description,
        // Gemini expects JSON schema for parameters
        parameters: {
          type: "object",
          properties: schema.properties || {},
          required: schema.required || [],
        },
      };
    })
  };
}


/**
 * Handle Gemini tool invocation by routing to MCP callTool
 */
export async function handleGeminiToolCall(toolInvocation: any) {
  const { name, arguments: args } = toolInvocation;
  const response = await callTool(name, args || {});
  return response;
}