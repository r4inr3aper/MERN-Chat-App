import express from "express";
import dotenv from "dotenv";
import userRoutes from "./routes/user.route.js";
import messageRoutes from "./routes/message.route.js"; 
import chatRoutes from "./routes/chat.route.js"; 
import connectDB from "./config/db.js";
import cors from "cors";

const app = express();

dotenv.config();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

connectDB();

app.use("/api/user", userRoutes); 
// app.use("/api/messages", messageRoutes);
app.use("/api/chat", chatRoutes); 

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
