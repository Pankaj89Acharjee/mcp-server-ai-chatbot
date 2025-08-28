import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { DataSource } from "typeorm";
import { SqlDatabase } from "langchain/sql_db";
import 'dotenv/config';
import { sequelize } from "../../config/remoteDBConnection.js";

export const langchainTool = async (clientQuestion: string) => {
    const datasource = new DataSource({
        type: "postgres",
        host: sequelize.host,
        port: sequelize.port,
        username: sequelize.user,
        password: sequelize.pass,
        database: sequelize.name,
        schema: sequelize.schema || 'public',
        synchronize: false,
        logging: false,
    });

    try {
        await datasource.initialize();

        // Auto-discover all tables and relationships
        const db = await SqlDatabase.fromDataSourceParams({
            appDataSource: datasource,
        });

        const llm = new ChatGoogleGenerativeAI({
            model: "gemini-2.0-flash",
            apiKey: process.env.GEMINI_API_KEY,
            temperature: 0
        });

        // Get table information for context
        const tables = await db.allTables;
        const tableNames = tables.map(table => table.tableName);
        const tableInfo = await Promise.all(
            tableNames.map(async (tableName) => {
                try {
                    const schema = await db.getTableInfo([tableName]);
                    return { table: tableName, schema };
                } catch (error) {
                    return { table: tableName, schema: "Error getting schema" };
                }
            })
        );

        // Create system message with database context
        const systemMessage = `
You are a SQL expert assistant. You have access to a PostgreSQL database with the following tables and their schemas:

${tableInfo.map(({ table, schema }) => `Table: ${table}\nSchema: ${schema}\n`).join('\n')}

User Question: ${clientQuestion}

Please provide a detailed response about the data requested. If the question is about counting items (like hardware, machines, etc.), analyze the available tables and provide the count.

Respond in a clear, helpful manner with specific information from the database.`;

        // Get response from LLM
        const result = await llm.invoke([
            ["system", systemMessage],
            ["user", clientQuestion]
        ]);

        return { content: result.content || "No response generated" };

    } catch (error) {
        console.error("Database error:", error);
        return { content: `Error: ${error}` };
    } finally {
        if (datasource.isInitialized) {
            await datasource.destroy();
        }
    }
};

