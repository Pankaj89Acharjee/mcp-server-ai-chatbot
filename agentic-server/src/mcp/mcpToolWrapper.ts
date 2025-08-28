import { client } from "./mcpClient";


export async function listTools() {
  if (!client) throw new Error("MCP client is not initialized.");
  try {
    const tools = await client.listTools();
    // console.log("All tools are listed", tools)
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

  try {
    const response = await client.callTool({ name: toolName, arguments: args });
    return response; // raw MCP response, usually { content, ... }
  } catch (error) {
    console.error(`❌ MCP Tool Wrapper Error calling tool "${toolName}":`, error);
    throw error;
  }
}





