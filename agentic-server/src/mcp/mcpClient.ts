import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import type { Tool } from "@modelcontextprotocol/sdk/types.js";

export let client: Client | null = null;
let transport: StdioClientTransport | null = null;
let tools: Tool[] = [];

/**
 * Connects to an MCP server (Node.js or Python).
 * @param serverScriptPath Path to the server script (.js or .py)
 */
export async function connectToMcpServer(serverScriptPath: string) {
    try {
        const isJs = serverScriptPath.endsWith(".js");
        const isTs = serverScriptPath.endsWith(".ts");
        const isPy = serverScriptPath.endsWith(".py");
        if (!isJs && !isPy && !isTs) {
            throw new Error("Server script must be a .js, .ts, or .py file");
        }

        const command = isPy
            ? process.platform === "win32"
                ? "python"
                : "python3"
            : process.execPath;

        transport = new StdioClientTransport({
            command,
            args: [serverScriptPath],
        });

        client = new Client({
            name: "my-mcp-client",
            version: "1.0.0",
        });

        // 🔹 Connect the client with the transport
        await client.connect(transport);

        // 🔹 Discover available tools from MCP server
        const { tools: availableTools } = await client.listTools();
        tools = availableTools;

        console.log(
            "✅ Connected to MCP server with tools:",
            tools.map((t) => t.name)
        );

        return { client, tools };
    } catch (err) {
        console.error("❌ Failed to connect to MCP server:", err);
        throw err;
    }
}

/**
 * Runs a tool by name with arguments
 */
export async function runTool(toolName: string, args: Record<string, unknown>) {
    if (!client) throw new Error("MCP client not connected");
    const result = await client.callTool({ name: toolName, arguments: args });
    return result;
}

/**
 * Disconnect cleanly
 */
export async function disconnectMcpServer() {
    if (transport) {
        await transport.close();
        transport = null;
    }
    client = null;
    tools = [];
    console.log("🛑 Disconnected from MCP server");
}
