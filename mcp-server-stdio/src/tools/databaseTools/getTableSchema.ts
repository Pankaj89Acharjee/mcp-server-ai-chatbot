import { z } from "zod";
import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import { connectionManager } from "../../config/connectionManager.js";

const Input = z.object({
    table: z.string().optional(),
    query: z.string().optional(),
});

type Input = z.infer<typeof Input>;


export const getTableSchemaTool: Tool = {
    name: "get-table-schema",
    description: "Describe the columns and types for a given table.",
            inputSchema: {
            type: "object",
            properties: {
                table: { type: "string" },
                query: { type: "string" }
            }
        },
    async execute(input: Record<string, unknown>) {
        const parsed = Input.safeParse(input);
        if (!parsed.success) {
            return `Invalid input: ${parsed.error.message}`;
        }
        const { table, query } = parsed.data as Input;
        const tableName = table || query;
        
        if (!tableName) {
            return {
                content: [
                    {
                        type: "text",
                        text: "Error: No table name provided. Please provide either 'table' or 'query' parameter."
                    },
                ]
            };
        }
        
        try {
            const tableSchema = await connectionManager.getTableSchema(tableName);
            
            return {
                content: [
                    {
                        type: "text",
                        text: `Schema for Table '${tableName}': \n${JSON.stringify(tableSchema, null, 2)}`
                    },
                ]
            }
        } catch (e: any) {
            return {
                content: [
                    {
                        type: "text",
                        text: `Error describing table '${tableName}': ${e.message}`,
                    },
                ],
            }
        }
    }
};








