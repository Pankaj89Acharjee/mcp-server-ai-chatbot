import "reflect-metadata";
import "dotenv/config";
import { langchainTool } from "./tools/databaseTools/langchainTool.js"; // Use LangChain SQL agent properly
import { listTablesTool } from "./tools/databaseTools/listTables.js";
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
//Server Creation
const server = new McpServer({
    name: "smartweldMCP",
    version: "1.0.0",
    capabilities: {
        resources: {},
        tools: {},
    },
});
//Registering the available tools with proper Zod schemas
function registerTools(tool) {
    // LangChain SQL agent tool - handles database queries properly
    if (tool.name === "query-database") {
        const schema = {
            query: z.string().describe("Natural language query describing what you want to retrieve or analyze"),
            clientQuestion: z.string().optional()
        };
        server.tool(tool.name, tool.description, schema, async (args) => {
            console.error(`🔧 MCP Server - ${tool.name} called with args:`, args);
            return await tool.execute(args);
        });
    }
    // For other tools, use simple registration
    else {
        server.tool(tool.name, tool.description, async () => {
            return await tool.execute({});
        });
    }
}
//Running the server
async function main() {
    console.error("🚀 Starting MCP Server with unified TypeORM connections...");
    console.error("🚀 Open API Key: ", process.env.OPENAI_API_KEY);
    //Register tools - use proper LangChain SQL agent
    registerTools(langchainTool); // LangChain SQL agent that actually works
    registerTools(listTablesTool); // Only for listing tables
    //Register Weather Tool
    // registerTools(getAlertsTool)
    // registerTools(getForecastTool)
    const transportMode = (process.env.TRANSPORT || "stdio").toLowerCase();
    if (transportMode === "stdio") {
        const transport = new StdioServerTransport();
        server.connect(transport);
        console.error("MCP is running on stdio");
        // Keep process alive
    }
    else {
        // Placeholder for a custom WebSocket transport if you add one
        console.error("TRANSPORT=ws is not implemented in this scaffold. Use stdio.");
        process.exit(1);
    }
}
main().catch((error) => {
    console.error("There is some error", error);
    process.exit(1);
});
