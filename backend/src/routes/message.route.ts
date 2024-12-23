import express from "express";
import { allMessages, sendMessage } from "../controllers/message.controller.js"; // Import the controller
import protect from "../middlewares/authMiddleware.js"; // Import the authentication middleware
import upload from "../middlewares/upload.js"; // Import the multer file upload middleware

const router = express.Router();

router.get("/all/:chatId", protect, allMessages);

// Route to send a message, including file upload (keeping the same order)
router.post("/send", protect, upload.single("file"), sendMessage); // 'file' is the name of the form field for the file

export default router;
