import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const dbURL = process.env.DB_URL;

const connectDB = async () => {
  try {
    await mongoose.connect(dbURL);
    console.log("Connected to the database");
  } catch (error) {
    console.log("Connection failed", error);
  }
};

export default connectDB;
