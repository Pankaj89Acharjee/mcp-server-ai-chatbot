import { z } from "zod";
import { connectionManager } from "../../config/connectionManager.js";
import { ChatOpenAI } from "@langchain/openai";
import { SqlDatabase } from "langchain/sql_db";
import { createSqlAgent, SqlToolkit } from "langchain/agents/toolkits/sql";
// Simple input schema - just like Python
const Input = z.object({
    query: z.string().describe("Natural language query describing what you want to retrieve or analyze"),
    output_type: z.enum(["text", "graph", "both"]).optional().default("text")
});
const parseNaturalLanguageToSQL = async (query) => {
    const queryLower = query.toLowerCase();
    const schema = await connectionManager.getSchemaCache();
    const tableNames = schema.tables || [];
    const dbSchema = 'public';
    console.log(`🔍 Unified Query Parsing: "${query}"`);
    console.log(`🔍 Available tables:`, tableNames.slice(0, 5));
    // Enhanced keyword matching - based on Python logic
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
        return `SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema = '${dbSchema}'`;
    }
    // Handle complex queries with relationships/joins
    if (queryLower.includes("with") || queryLower.includes("join") ||
        (queryLower.includes("user") && queryLower.includes("role")) ||
        (queryLower.includes("machine") && queryLower.includes("sensor")) ||
        queryLower.includes("relationship")) {
        console.log(`🔄 Complex query detected, using LangChain SQL Agent`);
        return await handleComplexQuery(query);
    }
    // Show data from specific table
    if (queryLower.includes("show") && queryLower.includes("data")) {
        const words = query.split(/\s+/);
        for (let i = 0; i < words.length; i++) {
            if ((words[i].toLowerCase() === "table" || words[i].toLowerCase() === "from") && i + 1 < words.length) {
                const tableName = words[i + 1].replace(/[^a-zA-Z0-9_]/g, '');
                return `SELECT * FROM "${dbSchema}"."${tableName}" LIMIT 100`;
            }
        }
        return `SELECT table_name FROM information_schema.tables WHERE table_schema = '${dbSchema}' ORDER BY table_name`;
    }
    // List tables
    if (queryLower.includes("list") && queryLower.includes("table")) {
        return `SELECT table_name, 
                       (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = '${dbSchema}' AND table_name = t.table_name) as column_count
                FROM information_schema.tables t 
                WHERE table_schema = '${dbSchema}' 
                ORDER BY table_name`;
    }
    // Table schema
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
    // List users (specific handling)
    if (queryLower.includes("list") && (queryLower.includes("user") || queryLower.includes("users"))) {
        console.log(`🔍 Looking for user tables in:`, tableNames);
        const userTables = tableNames.filter((t) => t.toLowerCase().includes('user') ||
            t.toLowerCase().includes('account') ||
            t.toLowerCase().includes('person'));
        console.log(`🔍 Found user tables:`, userTables);
        if (userTables.length > 0) {
            const tableName = userTables[0];
            console.log(`🎯 Using user table: ${tableName}`);
            return `SELECT * FROM "${dbSchema}"."${tableName}" LIMIT 50`;
        }
    }
    // Try to find exact table name match
    const words = query.split(/\s+/);
    for (const word of words) {
        const cleanWord = word.replace(/[^a-zA-Z0-9_]/g, '');
        if (cleanWord.length > 2) {
            const foundTable = tableNames.find((t) => t.toLowerCase() === cleanWord.toLowerCase());
            if (foundTable) {
                console.log(`🎯 Found exact table match: ${foundTable}`);
                return `SELECT * FROM "${dbSchema}"."${foundTable}" LIMIT 50`;
            }
        }
    }
    // Check if table exists for any word
    for (const word of words) {
        const cleanWord = word.replace(/[^a-zA-Z0-9_]/g, '');
        if (cleanWord.length > 2) {
            try {
                const dataSource = await connectionManager.getDataSource();
                const result = await dataSource.query(`SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = $1 AND table_name = $2)`, [dbSchema, cleanWord]);
                if (result[0]?.exists) {
                    console.log(`🎯 Found existing table: ${cleanWord}`);
                    return `SELECT * FROM "${dbSchema}"."${cleanWord}" LIMIT 50`;
                }
            }
            catch (error) {
                console.log(`⚠️ Error checking table existence for ${cleanWord}:`, error);
            }
        }
    }
    // Default fallback
    console.log(`⚠️ No specific match found, showing available tables`);
    return `SELECT table_name as available_tables FROM information_schema.tables WHERE table_schema = '${dbSchema}' ORDER BY table_name`;
};
// Handle complex queries with LangChain SQL Agent
const handleComplexQuery = async (query) => {
    try {
        const dataSource = await connectionManager.getDataSource();
        const sqlDatabase = await SqlDatabase.fromDataSourceParams({
            appDataSource: dataSource,
        });
        const llm = new ChatOpenAI({
            modelName: "gpt-4o-mini",
            temperature: 0,
            openAIApiKey: process.env.OPENAI_API_KEY,
        });
        const toolkit = new SqlToolkit(sqlDatabase, llm);
        const executor = createSqlAgent(llm, toolkit, {
            topK: 10,
        });
        console.log(`🤖 Using LangChain SQL Agent for: "${query}"`);
        const result = await executor.invoke({ input: query });
        // Extract SQL from LangChain result if possible
        if (result.output && typeof result.output === 'string') {
            // Try to extract SQL from the output
            const sqlMatch = result.output.match(/```sql\n(.*?)\n```/s);
            if (sqlMatch) {
                return sqlMatch[1].trim();
            }
            // If no SQL found, the result.output is probably the final answer
            // Return a simple query that shows this is handled by LangChain
            return `-- LangChain handled this query: ${query}\nSELECT 'LangChain processed this complex query' as result`;
        }
        return `SELECT 'Complex query processed by LangChain' as result`;
    }
    catch (error) {
        console.error("❌ LangChain SQL Agent error:", error);
        // Fallback to simple parsing
        return `SELECT 'Error processing complex query: ${error.message}' as error`;
    }
};
export const unifiedQueryTool = {
    name: "query-database",
    description: "Execute natural language queries on PostgreSQL database. Handles both simple and complex queries with joins and relationships automatically.",
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
    async execute(input) {
        console.log(`🔧 Unified Query Tool called with:`, input);
        console.log(`🔧 Input type:`, typeof input);
        console.log(`🔧 Input keys:`, input ? Object.keys(input) : 'undefined');
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
            console.log(`🔍 Processing unified query: "${query}"`);
            // Generate SQL from natural language
            const sqlQuery = await parseNaturalLanguageToSQL(query);
            console.log(`📝 Generated SQL: ${sqlQuery}`);
            // Execute query with timeout
            const results = await connectionManager.executeQuery(sqlQuery, 15000);
            console.log(`📊 Query returned ${Array.isArray(results) ? results.length : 1} rows`);
            console.log(`🔍 Raw query results:`, JSON.stringify(results, null, 2));
            // Additional debugging - check if table actually exists and has data
            if (Array.isArray(results) && results.length === 0 && sqlQuery.includes('users')) {
                console.log(`⚠️ No data found in users table. Let's verify...`);
                try {
                    // Check if table exists
                    const tableCheck = await connectionManager.executeQuery(`SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users')`, 5000);
                    console.log(`🔍 Table 'users' exists:`, tableCheck);
                    // Check row count
                    const countCheck = await connectionManager.executeQuery(`SELECT COUNT(*) as count FROM "public"."users"`, 5000);
                    console.log(`🔍 Users table row count:`, countCheck);
                    // List all tables
                    const allTables = await connectionManager.executeQuery(`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`, 5000);
                    console.log(`🔍 All tables in public schema:`, allTables);
                }
                catch (debugError) {
                    console.error(`❌ Debug query failed:`, debugError);
                }
            }
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
        }
        catch (error) {
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
