import express from 'express'
import { addToGroup, createGroupChat, fetchChats, accessChats, removeFromGroup, renameGroup } from '../controllers/chat.controller.js';
import protect from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post("/", protect, accessChats);
router.get("/", protect, fetchChats);
router.post("/group", protect, createGroupChat);
router.put("/rename", protect, renameGroup);
router.put("/add", protect, addToGroup);
router.put("/remove", protect, removeFromGroup);

export default router;
