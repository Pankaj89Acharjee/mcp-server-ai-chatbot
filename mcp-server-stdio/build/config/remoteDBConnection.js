import { Sequelize } from "sequelize";
import { remoteDBConfig } from "./databaseConfig.js"; // Import our validated config
let sequelize;
export const establishDbConnection = async () => {
    try {
        const config = remoteDBConfig();
        // Create sequelize instance with actual configuration
        sequelize = new Sequelize(config.name, config.user, config.pass, {
            host: config.host,
            port: config.port,
            dialect: "postgres",
            schema: config.schema || 'public',
            pool: {
                max: 50,
                min: 0,
                acquire: 1200000,
                idle: 1000000
            },
            logging: false, // Set to console.log for debugging SQL queries
            define: {
                underscored: true,
                timestamps: false
            },
            dialectOptions: {
                // ssl: false, // Generally better to configure SSL for production
                useUTC: false, // Keep if you want local time
                dateStrings: true, // This is sufficient for returning dates as strings
            },
            timezone: 'Asia/Kolkata' // For writing dates to the database
        });
        await sequelize.authenticate();
        console.error('✅ Remote Database Connection has been established successfully for MCP Server.');
        if (config.schema) {
            console.error(`✅ Default schema set to: ${config.schema}`);
        }
    }
    catch (error) {
        console.error('🔴 Unable to connect to the database:', error);
        throw error;
    }
};
export { sequelize };
