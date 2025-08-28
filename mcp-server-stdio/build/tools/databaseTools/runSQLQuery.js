import { z } from "zod";
import { connectionManager } from "../../config/connectionManager.js";
// Safe-by-default: allow only SELECT unless ALLOW_DML=true
const allowDml = String(process.env.ALLOW_DML || "false").toLowerCase() === "true";
const Input = z.object({
    sql: z.string().min(1, "sql is required"),
    limit: z.number().int().positive().max(10000).optional(),
});
export const runSqlQueryTool = {
    name: "run-sql-query",
    description: "Run a SQL query against the database. Defaults to SELECT-only unless ALLOW_DML=true. Optionally limit rows.",
    inputSchema: {
        type: "object",
        required: ["sql"],
        properties: {
            sql: { type: "string" },
            limit: { type: "number" }
        }
    },
    async execute(input) {
        const parsed = Input.safeParse(input);
        if (!parsed.success) {
            return {
                content: [
                    {
                        type: "text",
                        text: `Invalid input: ${parsed.error.message}`
                    }
                ]
            };
        }
        let { sql, limit } = parsed.data;
        // Guard rails
        const lowered = sql.trim().toLowerCase();
        const isSelect = lowered.startsWith("select ") || lowered.startsWith("with ");
        if (!allowDml && !isSelect) {
            return {
                content: [
                    {
                        type: "text",
                        text: "Only SELECT/CTE queries are allowed (set ALLOW_DML=true to permit DML/DDL)."
                    }
                ]
            };
        }
        // Best-effort LIMIT injection for SELECT, if not provided
        if (isSelect && !/\blimit\b/i.test(sql) && limit) {
            sql = `${sql}\nLIMIT ${limit}`;
        }
        try {
            const rows = await connectionManager.executeQuery(sql, 30000);
            // Return compact JSON string for portability across clients
            return {
                content: [
                    {
                        type: "text",
                        text: `SQL Query Result: \n${JSON.stringify(rows, null, 2)}`
                    }
                ]
            };
        }
        catch (e) {
            return {
                content: [
                    {
                        type: "text",
                        text: `SQL Error: ${e.message}`
                    }
                ]
            };
        }
    }
};
