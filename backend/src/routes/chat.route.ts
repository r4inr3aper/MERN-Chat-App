import express from 'express'
import { addToGroup, createGroupChat, fetchChats, getChats, removeFromGroup, renameGroup } from '../controllers/chat.controller.js';
import protect from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post("/", protect, getChats);
router.get("/", protect, fetchChats);
router.get("/group", protect, createGroupChat);
router.get("/rename", protect, renameGroup);
router.get("/add", protect, addToGroup);
router.get("/remove", protect, removeFromGroup);

export default router;