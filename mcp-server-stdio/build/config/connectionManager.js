import { DataSource } from "typeorm";
import { SqlDatabase } from "langchain/sql_db";
import { remoteDBConfig } from "./databaseConfig.js";
// Singleton connection manager
class ConnectionManager {
    static instance;
    dataSource = null;
    sqlDatabase = null;
    schemaCache = null;
    lastSchemaUpdate = 0;
    SCHEMA_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
    constructor() { }
    static getInstance() {
        if (!ConnectionManager.instance) {
            ConnectionManager.instance = new ConnectionManager();
        }
        return ConnectionManager.instance;
    }
    async getDataSource() {
        if (!this.dataSource || !this.dataSource.isInitialized) {
            console.log("🔌 Initializing new TypeORM DataSource...");
            const config = remoteDBConfig();
            this.dataSource = new DataSource({
                type: "postgres",
                host: config.host,
                port: config.port,
                username: config.user,
                password: config.pass,
                database: config.name,
                schema: config.schema || 'public',
                synchronize: false,
                logging: false,
                // Connection pool settings
                extra: {
                    max: 20,
                    min: 5,
                    idleTimeoutMillis: 30000,
                    connectionTimeoutMillis: 2000,
                }
            });
            await this.dataSource.initialize();
            console.log("✅ TypeORM DataSource initialized successfully");
        }
        return this.dataSource;
    }
    async getSqlDatabase() {
        if (!this.sqlDatabase) {
            console.log("🔌 Initializing LangChain SqlDatabase...");
            const dataSource = await this.getDataSource();
            this.sqlDatabase = await SqlDatabase.fromDataSourceParams({
                appDataSource: dataSource,
            });
            console.log("✅ LangChain SqlDatabase initialized successfully");
        }
        return this.sqlDatabase;
    }
    async getSchemaCache() {
        const now = Date.now();
        if (!this.schemaCache || (now - this.lastSchemaUpdate) > this.SCHEMA_CACHE_TTL) {
            console.log("🔄 Rebuilding schema cache...");
            const db = await this.getSqlDatabase();
            const tables = await db.allTables;
            const tableNames = tables.map(table => table.tableName);
            const tableInfo = await Promise.all(tableNames.map(async (tableName) => {
                try {
                    const schema = await db.getTableInfo([tableName]);
                    return { table: tableName, schema };
                }
                catch (error) {
                    return { table: tableName, schema: "Error getting schema" };
                }
            }));
            this.schemaCache = { tables: tableNames, tableInfo };
            this.lastSchemaUpdate = now;
            console.log(`✅ Schema cache updated with ${tableNames.length} tables`);
        }
        return this.schemaCache;
    }
    async createQueryRunner() {
        const dataSource = await this.getDataSource();
        return dataSource.createQueryRunner();
    }
    async executeQuery(sql, timeout = 30000) {
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Database query timeout')), timeout));
        const queryRunner = await this.createQueryRunner();
        try {
            const result = await Promise.race([
                queryRunner.query(sql),
                timeoutPromise
            ]);
            return result;
        }
        finally {
            await queryRunner.release();
        }
    }
    async getTableSchema(tableName, timeout = 10000) {
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Database query timeout')), timeout));
        const queryRunner = await this.createQueryRunner();
        try {
            const desc = await Promise.race([
                queryRunner.getTable(tableName),
                timeoutPromise
            ]);
            const tableSchema = desc ? {
                tableName: desc.name,
                columns: desc.columns?.map((col) => ({
                    name: col.name,
                    type: col.type,
                    isNullable: col.isNullable,
                    isPrimary: col.isPrimary,
                    isGenerated: col.isGenerated,
                    default: col.default
                })) || []
            } : null;
            return tableSchema;
        }
        finally {
            await queryRunner.release();
        }
    }
    async listTables(timeout = 10000) {
        const dataSource = await this.getDataSource();
        const schema = dataSource.options.schema || 'public';
        const result = await this.executeQuery(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = '${schema}' 
            AND table_type = 'BASE TABLE'
        `, timeout);
        return result.map((row) => row.table_name);
    }
    async cleanup() {
        if (this.dataSource?.isInitialized) {
            await this.dataSource.destroy();
            this.dataSource = null;
            this.sqlDatabase = null;
            this.schemaCache = null;
            console.log("🧹 Database connections cleaned up");
        }
    }
}
// Export singleton instance
export const connectionManager = ConnectionManager.getInstance();
