import express from "express";
import dotenv from "dotenv"
import authRoutes from "./routes/auth.route.js"
import messageRoutes from "./routes/message.route.js"
import connectDB from "./config/db.js";

const app = express();

dotenv.config();
const PORT = process.env.PORT || 5000;
app.use(express.json());

connectDB();

app.use("/api/auth", authRoutes)
app.use("/api/messages", messageRoutes)

app.listen(PORT, () => {
    console.log("Server is running on port 5000");
});
