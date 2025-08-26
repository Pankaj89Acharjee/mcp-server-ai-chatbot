import { ChatOpenAI } from "@langchain/openai";
import 'dotenv/config';
import { z } from "zod";
import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import { connectionManager } from "../../config/connectionManager.js";

const getRelevantTables = (question: string, schemaCache: any) => {
    const keywords = question.toLowerCase().split(' ');
    return schemaCache.tables.filter((table: string) =>
        keywords.some(keyword => table.includes(keyword))
    );
};

const getSchemaForTables = async (tableNames: string[]) => {
    const schema = await connectionManager.getSchemaCache();
    return schema.tableInfo.filter((info: any) =>
        tableNames.includes(info.table)
    );
};


const Input = z.object({
    clientQuestion: z.string().optional(),
    query: z.string().optional(),
});

type Input = z.infer<typeof Input>;



const langchainToolFunction = async (clientQuestion: string) => {
    try {
        console.log("🚀 Starting LangChain analysis for:", clientQuestion);
        
        // Test basic connection first and check what schema we're using
        try {
            const dataSource = await connectionManager.getDataSource();
            const currentSchema = (dataSource.options as any).schema || 'public';
            console.log("🔍 Current database schema:", currentSchema);
            
            const tableNames = await connectionManager.listTables();
            console.log("📊 Available tables:", tableNames);
            
            // Also check what tables exist in different schemas
            const allSchemas = await dataSource.query(`
                SELECT schema_name, 
                       (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = schema_name) as table_count
                FROM information_schema.schemata 
                WHERE schema_name NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
                ORDER BY table_count DESC
            `);
            console.log("🔍 Available schemas with table counts:", allSchemas);
            
        } catch (connError) {
            console.error("❌ Connection test failed:", connError);
            return { content: `Connection Error: ${connError instanceof Error ? connError.message : String(connError)}` };
        }
        
        //Getting Schema details first using connection manager
        const schema = await connectionManager.getSchemaCache();

        //Getting the relevant tables and schema from the question
        const relevantTables = getRelevantTables(clientQuestion, schema);
        const relevantSchema = await getSchemaForTables(relevantTables);

        //If no relevant tables found, discover new and using all tables
        const finalSchema = relevantSchema.length > 0 ? relevantSchema : schema.tableInfo;
        
        console.log(`📊 Using ${finalSchema.length} tables for analysis`);

        const llm = new ChatOpenAI({
            model: "gpt-4o",
            apiKey: process.env.OPENAI_API_KEY,
            temperature: 0,
            maxTokens: 2048,
            timeout: 30000
        });

        const systemMessage = `
        You are a SQL expert assistant. You have access to a PostgreSQL database with the following tables and their schemas:

        ${finalSchema.map(({ table, schema }: { table: string, schema: string }) => `Table: ${table}\nSchema: ${schema}\n`).join('\n')}

        User Question: ${clientQuestion}

        CRITICAL: You MUST write and execute SQL queries to answer the question. 
        - Generate the appropriate SQL query for the question
        - Execute it to get actual data
        - Return both the SQL query used and the results
        
        For counting questions, provide exact counts from the database.
        For listing questions, provide the actual list of items.
        
        Respond with:
        1. The SQL query you generated
        2. The actual results from executing that query
        3. A summary of your findings`;

        // Generate SQL query using LLM
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Request timeout')), 30000)
        );

        const sqlResponse = await Promise.race([
            llm.invoke([
                ["system", systemMessage],
                ["user", `Generate a SQL query to answer: ${clientQuestion}`]
            ]),
            timeoutPromise
        ]) as any;

        // Extract SQL from the response
        const sqlContent = sqlResponse.content as string;
        console.log("🔍 Generated SQL response:", sqlContent);
        
        // Try to extract SQL query from the response
        const sqlMatch = sqlContent.match(/```sql\s*(.*?)\s*```/s) || 
                         sqlContent.match(/SELECT.*?;?/is) ||
                         sqlContent.match(/WITH.*?;?/is);
        
        let sqlQuery = '';
        if (sqlMatch) {
            sqlQuery = sqlMatch[1] || sqlMatch[0];
            sqlQuery = sqlQuery.trim().replace(/;$/, ''); // Remove trailing semicolon
        } else {
            // Fallback: try to generate a simple query based on the question
            if (clientQuestion.toLowerCase().includes('count') || clientQuestion.toLowerCase().includes('how many')) {
                const tableNames = schema.tables;
                const relevantTable = tableNames.find((table: string) => 
                    clientQuestion.toLowerCase().includes(table.toLowerCase()) ||
                    clientQuestion.toLowerCase().includes('sensor') && table.includes('sensor') ||
                    clientQuestion.toLowerCase().includes('hardware') && table.includes('hardware')
                );
                if (relevantTable) {
                    sqlQuery = `SELECT COUNT(*) as count FROM ${relevantTable}`;
                }
            }
        }

        if (!sqlQuery) {
            return { content: "Could not generate appropriate SQL query for the question." };
        }

        console.log("🔍 Extracted SQL query:", sqlQuery);

        // Execute the SQL query
        try {
            const queryResults = await connectionManager.executeQuery(sqlQuery, 10000);
            console.log("📊 Query results:", queryResults);
            
            // Format the final response
            const finalResponse = `
SQL Query: ${sqlQuery}

Results: ${JSON.stringify(queryResults, null, 2)}

Summary: ${sqlContent}`;

            return { content: finalResponse };
            
        } catch (sqlError) {
            console.error("❌ SQL execution failed:", sqlError);
            return { content: `SQL Error: ${sqlError instanceof Error ? sqlError.message : String(sqlError)}. Generated query: ${sqlQuery}` };
        }
    } catch (error) {
        console.error("❌ LangChain tool error:", error);
        return { content: `LangChain Error: ${error instanceof Error ? error.message : String(error)}` };
    }
};

export const langchainTool: Tool = {
    name: "query-database",
    description: "Use LangChain to analyze database content and answer complex questions about the data. It includes the complex joining of tables and generating the complex sql queries.",
    inputSchema: {
        type: "object",
        properties: {
            clientQuestion: { type: "string" },
            query: { type: "string" }
        }
    },
    async execute(input: Record<string, unknown>) {
        const parsed = Input.safeParse(input);
        if (!parsed.success) {
            return `Invalid input: ${parsed.error.message}`;
        }
        const { clientQuestion, query } = parsed.data as Input;
        const question = clientQuestion || query;
        
        if (!question) {
            return {
                content: [
                    {
                        type: "text",
                        text: "Error: No question provided. Please provide either 'clientQuestion' or 'query' parameter."
                    },
                ]
            };
        }

        try {
            const result = await langchainToolFunction(question);
            return {
                content: [
                    {
                        type: "text",
                        text: result.content
                    },
                ]
            };
        } catch (error: any) {
            return {
                content: [
                    {
                        type: "text",
                        text: `Error: ${error.message}`,
                    },
                ],
            };
        }
    }
};


// Note: Schema caching and background updates are now handled by connectionManager