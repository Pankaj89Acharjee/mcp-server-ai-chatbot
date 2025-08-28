import { z } from "zod";
import { connectionManager } from "../../config/connectionManager.js";
const Input = z.object({
    table: z.string().optional(),
    query: z.string().optional(),
});
export const getTableSchemaTool = {
    name: "get-table-schema",
    description: "Describe the columns and types for a given table.",
    inputSchema: {
        type: "object",
        properties: {
            table: { type: "string" },
            query: { type: "string" }
        }
    },
    async execute(input) {
        const parsed = Input.safeParse(input);
        if (!parsed.success) {
            return `Invalid input: ${parsed.error.message}`;
        }
        const { table, query } = parsed.data;
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
            };
        }
        catch (e) {
            return {
                content: [
                    {
                        type: "text",
                        text: `Error describing table '${tableName}': ${e.message}`,
                    },
                ],
            };
        }
    }
};
