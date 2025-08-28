// src/db/connection.ts
import { Sequelize } from "sequelize";
import { dbConfig } from "../config/dbConfig"; // Import our validated config

const sequelize = new Sequelize(dbConfig.name, dbConfig.user, dbConfig.pass, {
  host: dbConfig.host,
  port: dbConfig.port,
  dialect: "postgres",
  schema: dbConfig.schema || 'public',

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


export const testDbConnection = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log(`✅ Remote Database Connected with ${dbConfig.schema || 'NO-SCHEMA'} Schema.`);
  } catch (error) {
    console.error('🔴 Unable to connect to the database:', error);
    throw error;
  }
};


export default sequelize;