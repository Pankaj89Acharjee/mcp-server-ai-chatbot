import 'dotenv/config'
import express from 'express';
import cors from 'cors';
import { startTelemetryAgent } from './scheduler/telemetryCronJob';
import { DeviceTelemetry } from './models/deviceTelemetry';
import { analyzeDataBatch } from './agents/analyst-agent';





const app = express();

app.use(express.json())
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*', // Allow all origins by default,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));







async function startServer() {
    try {
        // Coonect to the Remote DB that is in PostgreSQL


        // await connectDB()
        // await sequelize.getQueryInterface().dropTable('Device_backup').catch(() => { });
        // await sequelize.sync(); // To alter the DB up-to-date with the models
        // console.log("Connected to the database successfully");



        app.post('/api/telemetry', async (req, res) => {
            try {
                const dataBatch = req.body;

                // console.log(`Recieved total ${dataBatch.length} records from telemetry server.`);

                //Inserting all telemetry data into the database
                //await DeviceTelemetry.bulkCreate(dataBatch as [], { returning: true });

                const totalDataStored = await DeviceTelemetry.findAll({

                    order: [['timestamp', 'DESC']],
                    limit: 10000
                })
                console.log(`🚨 Found ${totalDataStored.length} number of records:`);
                //console.log(totalDataStored.map(row => row.toJSON()));


                res.status(200).json({ message: "Data stored successfully." });
            } catch (error) {
                console.error("❌ Error processing telemetry data:", error);
                return res.status(500).json({ error: error || "Internal Server Error" });
            }

        })








        await startTelemetryAgent();
        console.log("Telemetry Scheduler stareted successfully");

        await analyzeDataBatch()
        console.log("Analyst Agent scheduler started successfully");



    } catch (error) {
        console.error("❌ Application startup failed:", error);
        // You might want to exit the process if startup fails critically
        process.exit(1);
    }
}

startServer();



export default app