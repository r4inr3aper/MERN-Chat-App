import express from "express";
import dotenv from "dotenv";
import userRoutes from "./routes/user.route.js";
import chatRoutes from "./routes/chat.route.js";
import messageRoutes from "./routes/message.route.js";
import connectDB from "./config/db.js";
import cors from "cors";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";

// Setup __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
connectDB();

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// Static file serving
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/messages", messageRoutes);

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Setup Socket.IO
const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "DELETE", "PUT"],
  },
});

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Setup event
  socket.on("setup", (userData) => {
    console.log("User setup:", userData);
    socket.join(userData._id);
    socket.emit("connected");
  });

  // Join chat event
  socket.on("join chat", (room) => {
    console.log(`User joined room: ${room}`);
    socket.join(room);
  });

  // New message event
  socket.on("new message", (newMessageReceived) => {
    console.log("New message received:", newMessageReceived);
    const chat = newMessageReceived.chat;

    if (!chat.users) {
      return console.error("chat.users not defined");
    }
    // @ts-ignore
    chat.users.forEach((user) => {
      if (user._id === newMessageReceived.sender._id) return;
      socket.in(user._id).emit("message received", newMessageReceived);
    });

    console.log("Message broadcasted");
  });

  // Disconnect event
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});
