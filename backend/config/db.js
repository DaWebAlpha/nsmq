import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

if(!MONGO_URI){
    console.log("MONGO_URI is not defined in .env");
    process.exit(1);
}


const connectDB = async () => {
    try {
        
        mongoose.connection.on("disconnected", () => {
            console.warn("MongoDB disconnected! Attempting to reconnect...");
        });

        mongoose.connection.on("error", (err) => {
            console.error("MongoDB connection error:", err);
        });

        const conn = await mongoose.connect(MONGO_URI);
        console.log(`Database connected: ${conn.connection.host}`);
    } catch (err) {
        console.error("Critical: Could not establish initial connection", err);
        process.exit(1);
    }
};


export default connectDB;