/**
 * @file This tool is designed to query a database and list entities such as users, roles,
 * sensors, or hardware. It intelligently detects the entity type from the query,
 * finds the most relevant database table, and builds an optimal SQL query to
 * retrieve a list of names and IDs.
 *
 * @version 1.1.0
 */
import { z } from "zod";
import { connectionManager } from "../../config/connectionManager.js";
/**
 * Zod schema for input validation.
 * @description The schema defines the required 'query' and an optional 'limit'.
 */
const InputSchema = z.object({
    query: z.string().describe("Query describing which entity to list (e.g., 'users', 'roles', 'sensors', 'hardware')"),
    limit: z.number().optional().default(100),
});
/**
 * Configuration mapping entity types to their keywords and preferred column names.
 * This helps the tool intelligently guess the correct table and columns.
 */
const ENTITY_CONFIG = {
    users: {
        keywords: ["user", "users", "account", "person", "people", "member", "accounts"],
        preferredNameColumns: ["name", "full_name", "username", "email", "display_name", "first_name", "last_name"],
        preferredIdColumns: ["id", "user_id", "uuid", "account_id"],
    },
    roles: {
        keywords: ["role", "roles", "permission", "permissions", "access", "groups"],
        preferredNameColumns: ["name", "role", "role_name", "title", "permission"],
        preferredIdColumns: ["id", "role_id", "uuid"],
    },
    sensors: {
        keywords: ["sensor", "sensors", "device", "measurement", "measurements"],
        preferredNameColumns: ["name", "sensor", "sensor_name", "label", "tag", "device_name"],
        preferredIdColumns: ["id", "sensor_id", "uuid", "device_id"],
    },
    hardware: {
        keywords: ["hardware", "device", "equipment", "machine", "tool", "devices"],
        preferredNameColumns: ["name", "device_name", "hardware_name", "label", "model", "brand"],
        preferredIdColumns: ["id", "device_id", "hardware_id", "uuid", "equipment_id"],
    },
};
/**
 * Finds candidate tables by matching entity keywords against available table names.
 * @param entity The entity type to find tables for.
 * @returns A promise that resolves to an array of table names.
 */
async function findCandidateTables(entity) {
    try {
        const schema = await connectionManager.getSchemaCache();
        const tables = (schema.tables || []);
        const keywords = ENTITY_CONFIG[entity].keywords.map(kw => kw.toLowerCase());
        const matches = tables.filter(table => keywords.some(keyword => table.toLowerCase().includes(keyword)));
        return matches;
    }
    catch (error) {
        console.error(`Error fetching schema cache:`, error);
        return [];
    }
}
/**
 * Analyzes the columns of a given table.
 * @param table The table name to analyze.
 * @returns A promise that resolves to an array of column names.
 */
async function analyzeTableColumns(table) {
    try {
        const desc = await connectionManager.getTableSchema(table);
        const columns = desc.map(col => col.name || col.column_name || col.Field || col.COLUMN_NAME).filter(Boolean);
        return columns;
    }
    catch (error) {
        console.error(`Failed to get columns for table ${table}:`, error);
        return [];
    }
}
/**
 * Builds the most effective SQL query for a given table and entity.
 * It prioritizes retrieving a name and ID column if available.
 * @param table The table to query.
 * @param entity The entity type.
 * @param limit The maximum number of records to return.
 * @returns A promise that resolves to the generated SQL query string.
 */
async function buildOptimalQuery(table, entity, limit) {
    const columns = await analyzeTableColumns(table);
    if (!columns.length) {
        return `SELECT * FROM "${table}" LIMIT ${limit}`;
    }
    const config = ENTITY_CONFIG[entity];
    // Helper to find the best-matching column from a list of preferred names
    const findBestColumn = (preferredCols) => preferredCols.find(preferred => columns.some(c => c.toLowerCase() === preferred.toLowerCase())) || null;
    const idCol = findBestColumn(config.preferredIdColumns);
    const nameCol = findBestColumn(config.preferredNameColumns);
    if (idCol && nameCol) {
        return `SELECT DISTINCT "${idCol}" AS id, "${nameCol}" AS name FROM "${table}" WHERE "${nameCol}" IS NOT NULL ORDER BY "${nameCol}" LIMIT ${limit}`;
    }
    if (nameCol) {
        return `SELECT DISTINCT "${nameCol}" AS name FROM "${table}" WHERE "${nameCol}" IS NOT NULL ORDER BY "${nameCol}" LIMIT ${limit}`;
    }
    if (idCol) {
        return `SELECT "${idCol}" AS id FROM "${table}" ORDER BY "${idCol}" LIMIT ${limit}`;
    }
    // Fallback: select the first few columns if no preferred columns are found
    const firstCols = columns.slice(0, 3).map(c => `"${c}"`).join(', ');
    return `SELECT ${firstCols} FROM "${table}" LIMIT ${limit}`;
}
/**
 * The main tool definition.
 * @type {Tool}
 */
export const listEntityNamesTool = {
    name: "list-entity-names",
    description: "List names and IDs for specific entity types like users, roles, sensors, or hardware from the database.",
    inputSchema: {
        type: "object",
        properties: {
            query: {
                type: "string",
                description: "Query describing which entity to list (e.g., 'list users', 'show all roles', 'get sensors', 'hardware devices')"
            },
            limit: {
                type: "number",
                description: "Maximum number of records to return (default 100)",
                default: 100
            }
        },
        required: ["query"]
    },
    /**
     * Executes the tool logic.
     * @param input The input object conforming to InputSchema.
     * @returns A promise that resolves to a result object containing the listed entities or an error message.
     */
    async execute(input) {
        const parsed = InputSchema.safeParse(input);
        if (!parsed.success) {
            console.error("Input parsing failed:", parsed.error);
            return {
                content: {
                    error: `Invalid input format. Expected: { query: "list users" }. Got: ${JSON.stringify(input)}`
                }
            };
        }
        const { query, limit } = parsed.data;
        // Determine entity type based on keywords in the query.
        let entity = 'users'; // Default entity
        const queryLower = query.toLowerCase();
        const entityMappings = Object.entries(ENTITY_CONFIG);
        for (const [entityName, config] of entityMappings) {
            if (config.keywords.some(keyword => queryLower.includes(keyword))) {
                entity = entityName;
                break;
            }
        }
        try {
            // Find candidate tables that might contain the requested entity data.
            const candidateTables = await findCandidateTables(entity);
            if (!candidateTables.length) {
                return {
                    content: {
                        error: `No tables found for entity type '${entity}'.`
                    }
                };
            }
            // Iterate through candidate tables until a query returns data.
            for (const table of candidateTables) {
                try {
                    const sqlQuery = await buildOptimalQuery(table, entity, limit);
                    const results = await connectionManager.executeQuery(sqlQuery, 15000);
                    if (Array.isArray(results) && results.length > 0) {
                        return {
                            content: {
                                entity,
                                table,
                                results
                            }
                        };
                    }
                }
                catch (tableError) {
                    // Log the error but continue to the next candidate table.
                    console.warn(`Error querying table ${table}, trying next one...`, tableError);
                }
            }
            // If the loop completes without finding any data.
            return {
                content: {
                    error: `No ${entity} data found in any of the candidate tables: ${candidateTables.join(', ')}.`
                }
            };
        }
        catch (error) {
            console.error("Entity listing error:", error);
            return {
                content: {
                    error: `Failed to list ${entity}: ${error.message}`
                }
            };
        }
    }
};
