import { Device } from "../models/device";
import { DeviceTelemetry } from "../models/deviceTelemetry";
import { Sequelize } from "sequelize";


const sequelize = new Sequelize({
    dialect: "sqlite",
    storage: ".db.sequelize",
    logging: false
});

export const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log("SQLite Database connected...")

        Device.hasMany(DeviceTelemetry, {
            foreignKey: 'deviceId',
            as: 'telemetries' // Optional: Define an alias for the association
        })

        DeviceTelemetry.belongsTo(Device, {
            foreignKey: 'deviceId',
            as: 'device' // Optional: Define an alias for the association
        })
    } catch (error) {
        console.error("Unable to connect to the database:", error);
    }
}

