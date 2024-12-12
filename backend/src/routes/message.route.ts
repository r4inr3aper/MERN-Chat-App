import { setRandomFallback } from 'bcryptjs';
import express from 'express'
import { allMessages, sendMessage } from '../controllers/message.controller.js';

const router = express.Router();

router.get("/",allMessages);
router.post("/",sendMessage);

export default router;