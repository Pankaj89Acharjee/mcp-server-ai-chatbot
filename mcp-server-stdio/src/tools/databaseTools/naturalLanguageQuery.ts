import { z } from "zod";
import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import { connectionManager } from "../../config/connectionManager.js";

// Simple input schema
const Input = z.object({
    query: z.string().describe("Natural language query describing what you want to retrieve or analyze"),
    output_type: z.enum(["text", "graph", "both"]).optional().default("text")
});

type Input = z.infer<typeof Input>;

const parseNaturalLanguageToSQL = async (query: string): Promise<string> => {
    const queryLower = query.toLowerCase();
    const schema = await connectionManager.getSchemaCache();
    const tableNames = schema.tables || [];
    const dbSchema = 'public';

    console.log(`🔍 Parsing query: "${query}"`);
    console.log(`🔍 Available tables:`, tableNames.slice(0, 5)); // Show first 5 tables

    // Enhanced keyword matching
    if (queryLower.includes("count") || queryLower.includes("how many")) {
        if (queryLower.includes("table")) {
            const words = query.split(/\s+/);
            for (let i = 0; i < words.length; i++) {
                if (words[i].toLowerCase() === "table" && i + 1 < words.length) {
                    const tableName = words[i + 1].replace(/[^a-zA-Z0-9_]/g, '');
                    return `SELECT COUNT(*) as count FROM "${dbSchema}"."${tableName}"`;
                }
            }
        }
        // Count all tables
        return `SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema = '${dbSchema}'`;
    }

    if (queryLower.includes("list") && (queryLower.includes("user") || queryLower.includes("users"))) {
        console.log(`🔍 Looking for user tables in:`, tableNames);
        // Find user-related tables
        const userTables = tableNames.filter((t: string) =>
            t.toLowerCase().includes('user') ||
            t.toLowerCase().includes('account') ||
            t.toLowerCase().includes('person')
        );
        console.log(`🔍 Found user tables:`, userTables);

        if (userTables.length > 0) {
            const tableName = userTables[0];
            console.log(`🎯 Using user table: ${tableName}`);
            return `SELECT * FROM "${dbSchema}"."${tableName}" LIMIT 50`;
        }
    }

    if (queryLower.includes("show") && queryLower.includes("data")) {
        const words = query.split(/\s+/);
        for (let i = 0; i < words.length; i++) {
            if ((words[i].toLowerCase() === "table" || words[i].toLowerCase() === "from") && i + 1 < words.length) {
                const tableName = words[i + 1].replace(/[^a-zA-Z0-9_]/g, '');
                return `SELECT * FROM "${dbSchema}"."${tableName}" LIMIT 100`;
            }
        }
        // Show available tables
        return `SELECT table_name FROM information_schema.tables WHERE table_schema = '${dbSchema}' ORDER BY table_name`;
    }

    if (queryLower.includes("list") && queryLower.includes("table")) {
        return `SELECT table_name, 
                       (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = '${dbSchema}' AND table_name = t.table_name) as column_count
                FROM information_schema.tables t 
                WHERE table_schema = '${dbSchema}' 
                ORDER BY table_name`;
    }

    if (queryLower.includes("schema")) {
        const words = query.split(/\s+/);
        for (let i = 0; i < words.length; i++) {
            if ((words[i].toLowerCase() === "table" || words[i].toLowerCase() === "of") && i + 1 < words.length) {
                const tableName = words[i + 1].replace(/[^a-zA-Z0-9_]/g, '');
                return `SELECT column_name, data_type, is_nullable, column_default 
                        FROM information_schema.columns 
                        WHERE table_schema = '${dbSchema}' AND table_name = '${tableName}'
                        ORDER BY ordinal_position`;
            }
        }
    }

    // Try to find a mentioned table name (only exact matches to avoid false positives)
    const words = query.split(/\s+/);
    for (const word of words) {
        const cleanWord = word.replace(/[^a-zA-Z0-9_]/g, '');
        if (cleanWord.length > 2) {
            const foundTable = tableNames.find((t: string) =>
                t.toLowerCase() === cleanWord.toLowerCase()
            );

            if (foundTable) {
                console.log(`🎯 Found exact table match: ${foundTable}`);
                return `SELECT * FROM "${dbSchema}"."${foundTable}" LIMIT 50`;
            }
        }
    }

    // Default fallback - show available tables
    console.log(`⚠️ No specific match found, showing available tables`);
    return `SELECT table_name as available_tables FROM information_schema.tables WHERE table_schema = '${dbSchema}' ORDER BY table_name`;
};

export const naturalLanguageQueryTool: Tool = {
    name: "natural-language-query",
    description: "Execute natural language queries on the PostgreSQL database. Handles questions like 'list users', 'show data from table X', 'count records', etc.",
    inputSchema: {
        type: "object",
        properties: {
            query: {
                type: "string",
                description: "Natural language query describing what you want to retrieve or analyze"
            },
            output_type: {
                type: "string",
                enum: ["text", "graph", "both"],
                description: "Type of output desired",
                default: "text"
            }
        },
        required: ["query"]
    },

    async execute(input: Record<string, unknown>) {
        console.log(`🔧 Natural language tool called with:`, input);
        console.log(`🔧 Input type:`, typeof input);
        console.log(`🔧 Input keys:`, input ? Object.keys(input) : 'undefined');
        console.log(`🔧 Input.query:`, input?.query);
        console.log(`🔧 Input.query type:`, typeof input?.query);

        // Parse input
        const parsed = Input.safeParse(input);
        if (!parsed.success) {
            console.error("❌ Input parsing failed:", parsed.error);
            return {
                content: [{
                    type: "text",
                    text: `Invalid input format. Expected: { query: "your question" }. Got: ${JSON.stringify(input)}`
                }]
            };
        }

        const { query } = parsed.data;

        try {
            console.log(`🔍 Processing query: "${query}"`);

            // Generate SQL from natural language
            const sqlQuery = await parseNaturalLanguageToSQL(query);
            console.log(`📝 Generated SQL: ${sqlQuery}`);

            // Execute query with timeout
            const results = await connectionManager.executeQuery(sqlQuery, 15000);
            console.log(`📊 Query returned ${Array.isArray(results) ? results.length : 1} rows`);

            // Format response for better readability
            // const formattedResults = Array.isArray(results)
            //     ? results.slice(0, 100) // Limit results to prevent overwhelming output
            //     : results;

            const responseText = JSON.stringify({
                query,
                sql: sqlQuery,
                data: results
            }, null, 2);

            return {
                content: [{
                    type: "text",
                    text: responseText
                }]
            };

        } catch (error: any) {
            console.error("❌ Query execution error:", error);
            return {
                content: [{
                    type: "text",
                    text: `Query execution failed: ${error.message}`,
                }]
            };
        }
    }
};