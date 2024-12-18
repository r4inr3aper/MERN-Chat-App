import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import Chat from "../models/chat.model.js";
import { Types } from "mongoose";

interface CustomRequest extends Request {
  user?: {
    _id: Types.ObjectId;
  };
}

export const allMessages = asyncHandler(async (req: CustomRequest, res: Response): Promise<void> => {
  const { chatId } = req.params;

  if (!chatId || !Types.ObjectId.isValid(chatId)) {
    res.status(400).json({ message: "Invalid chat ID format" });
    return;
  }

  try {
    const messages = await Message.find({ chat: chatId })
      .populate("sender", "name pic email")
      .populate("chat");

    res.status(200).json(messages);
  } catch (error: any) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: error.message || "Failed to fetch messages" });
  }
});

export const sendMessage = asyncHandler(async (req: CustomRequest, res: Response): Promise<void> => {
  const { content, chatId }: { content: string; chatId: string } = req.body;

  if (!content || !chatId) {
    res.status(400).json({ message: "Content and chatId are required" });
    return;
  }

  if (!req.user || !req.user._id || !Types.ObjectId.isValid(req.user._id)) {
    res.status(401).json({ message: "Unauthorized: Invalid user ID" });
    return;
  }

  if (!Types.ObjectId.isValid(chatId)) {
    res.status(400).json({ message: "Invalid chat ID format" });
    return;
  }

  const newMessage = {
    sender: req.user._id,
    content,
    chat: new Types.ObjectId(chatId),
  };

  try {
    let message = await Message.create(newMessage);

    message = await message.populate("sender", "name pic");
    message = await message.populate("chat");

    // @ts-ignore
    message = await User.populate(message, {
      path: "chat.users",
      select: "name pic email",
    });

    await Chat.findByIdAndUpdate(chatId, { latestMessage: message });

    res.status(201).json(message);
  } catch (error: any) {
    console.error("Error sending message:", error);
    res.status(500).json({ message: error.message || "Failed to send message" });
  }
});
