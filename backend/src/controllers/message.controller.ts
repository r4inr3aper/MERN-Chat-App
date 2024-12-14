import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import Message, { IMessage } from "../models/message.model.js";
import User, { IUser } from "../models/user.model.js";
import Chat from "../models/chat.model.js";
import { Types } from "mongoose";

export const allMessages = asyncHandler(async (req: Request, res: Response) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name pic email")
      .populate("chat");

    res.json(messages);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

export const sendMessage = asyncHandler(async (req: Request, res: Response) => {
  const { content, chatId }: { content: string; chatId: Types.ObjectId } = req.body;

  if (!content || !chatId) {
    console.log("Invalid data passed into request");
    return res.status(400).json({ message: "Invalid data passed into request" });
  }

  const newMessage = {
    sender: req.user?._id,
    content: content,
    chat: chatId,
  };

  try {
    let message = await Message.create(newMessage);

    message = await message.populate("sender", "name pic").populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
      select: "name pic email",
    });

    await Chat.findByIdAndUpdate(chatId, { latestMessage: message });

    res.json(message);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});
