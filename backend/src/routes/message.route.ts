import express from "express";
import { allMessages, sendMessage } from "../controllers/message.controller.js";
import protect from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/all/:chatId", protect, allMessages);
router.post("/send", protect, sendMessage);

export default router;
