import express from 'express';
import {
  addToGroup,
  createGroupChat,
  fetchChats,
  accessChats,
  removeSelfFromGroup,
  removeFromGroup,
  renameGroup,
  fetchAllGroups,
  deleteGroupChat,
  addSelfToGroup,
} from '../controllers/chat.controller.js';
import protect from '../middlewares/authMiddleware.js';
import { adminCheck } from '../middlewares/adminCheck.js';

const router = express.Router();

router.post("/", protect, accessChats);
router.get("/", protect, fetchChats);
router.get("/all", protect, fetchAllGroups);
router.post("/group", protect, adminCheck, createGroupChat);
router.put("/rename", protect, adminCheck, renameGroup); 
router.put("/add", protect, adminCheck, addToGroup);
router.put("/addself", protect, addSelfToGroup); 
router.put("/removeSelf", protect, removeSelfFromGroup);
router.put("/remove", protect, adminCheck, removeFromGroup);
router.delete("/group/:id", protect, adminCheck, deleteGroupChat);

export default router;
