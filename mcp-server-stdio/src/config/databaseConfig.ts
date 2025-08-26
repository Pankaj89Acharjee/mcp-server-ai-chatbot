import 'dotenv/config';
import { DatabaseConfig } from "../interfaces/dbInterfaces.js";




export function remoteDBConfig(): DatabaseConfig {
    const { DB_SCHEMA, DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

    if (!DB_HOST || !DB_USER || !DB_PASSWORD || !DB_NAME) {
        console.error("🔴 Missing critical database environment variables.");
        process.exit(1); // Exit the process if config is missing
    }

    const sanitizedHost = DB_HOST.replace(/,/g, '').replace(/\s+/g, ' ').trim();
    const sanitizedUser = DB_USER.replace(/,+$/g, '').trim();
    const sanitizedPass = (DB_PASSWORD || '').trim();

    return {
        schema: (DB_SCHEMA || '').trim(),
        host: sanitizedHost,
        port: parseInt((DB_PORT || '5432').trim(), 10),
        user: sanitizedUser,
        pass: sanitizedPass,
        name: (DB_NAME || '').trim(),
    }
}


