import express from "express";
import cors from "cors";
import dotenv from "dotenv";
const app = express();
dotenv.config();

const port = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.BASE_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
