import { callTool, listTools } from './src/mcp/mcpToolWrapper.js';

async function testMCPTools() {
    try {
        console.log("🔍 Testing MCP tools...");
        
        // List all tools
        const tools = await listTools();
        console.log("📋 Available tools:", tools.map(t => t.name));
        
        // Test list-entity-names tool directly
        console.log("🧪 Testing list-entity-names with { entity: 'users' }");
        const result = await callTool("list-entity-names", { entity: "users" });
        console.log("✅ Result:", JSON.stringify(result, null, 2));
        
    } catch (error) {
        console.error("❌ Error:", error);
    }
}

testMCPTools();
