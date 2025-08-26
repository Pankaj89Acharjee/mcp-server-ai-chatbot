import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import { connectionManager } from "../../config/connectionManager.js";

export const listTablesTool: Tool = {
    name: "list-database-tables",
    description: "Use this tool to get a complete and accurate count and list of all tables in the database. It is the only way to know how many tables exist or what their names are.",
    inputSchema: { 
        type: "object", 
        properties: {
            query: { type: "string" }
        }
    },

    // Return a simple string for maximal client compatibility
    async execute(_input: Record<string, unknown>) {
        try {
            const tableNames = await connectionManager.listTables();
            
            if (!tableNames || tableNames.length === 0) {
                return {
                    content: [
                        {
                            type: "text",
                            text: "No tables found in the database."
                        }
                    ]
                }
            }
            
            const count = tableNames.length;
            
            return {
                content: [
                    {
                        type: "text",
                        text: `The database contains ${count} tables: ${tableNames.join(", ")}`
                    }
                ]
            }
        } catch (error: any) {
            return {
                content: [
                    {
                        type: "text",
                        text: `Error listing tables: ${error.message}`
                    }
                ]
            }
        }
    }
};