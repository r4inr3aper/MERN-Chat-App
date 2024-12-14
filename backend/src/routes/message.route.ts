import express from 'express'
import { allMessages, sendMessage } from '../controllers/message.controller.js';

const router = express.Router();

router.get("/all",allMessages);
router.post("/send",sendMessage);

export default router;