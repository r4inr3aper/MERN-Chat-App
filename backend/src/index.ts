import express from "express";
import dotenv from "dotenv";
import userRoutes from "./routes/user.route.js";
import chatRoutes from "./routes/chat.route.js";
import messageRoutes from "./routes/message.route.js";
import connectDB from "./config/db.js";
import cors from "cors";
import { Server } from "socket.io";

const app = express();

dotenv.config();
const PORT = process.env.PORT || 5000;

app.use(express.json());

connectDB();
app.use(
  cors({
    origin: "http://localhost:5173", // Ensure this matches the frontend URL
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);


app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/messages", messageRoutes);

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Socket.IO setup
const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:5173", // Ensure this matches the frontend URL
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id); // Log the socket connection ID

  socket.on("setup", (userData) => {
    console.log("User setup:", userData); // Log the user data when they set up the socket
    socket.join(userData._id); // Join the user to their specific room
    socket.emit("connected"); // Emit the 'connected' event to the user
  });

  socket.on("join chat", (room) => {
    console.log(`User joined room: ${room}`); // Log the room the user is joining
    socket.join(room); // Join the chat room
  });

  socket.on("new message", (newMessageReceived) => {
    console.log("New message received:", newMessageReceived); // Log the new message
    const chat = newMessageReceived.chat;
    if (!chat.users) return console.log("chat.users not defined");
// @ts-ignore
    chat.users.forEach((user) => {
      if (user._id === newMessageReceived.sender._id) return;
      socket.in(user._id).emit("message received", newMessageReceived); // Emit to the users in the chat room
    });
    console.log("done")
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id); // Log when the user disconnects
  });
});