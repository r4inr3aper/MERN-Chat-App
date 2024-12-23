import express, { Request, Response } from "express";
import mongoose from "mongoose";
import asyncHandler from "express-async-handler";
import Chat, { IChat } from "../models/chat.model.js";
import User, { IUser } from "../models/user.model.js";

interface AuthenticatedRequest extends Request {
  user?: IUser;
}

export const accessChats = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { userId } = req.body;

  if (!userId) {
    console.log("UserId param not sent with request");
    res.sendStatus(400);
    return;
  }

  let isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.user?._id } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate("users", "-password")
    .populate("latestMessage");
  // @ts-ignore
  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "name pic email",
  });

  if (isChat.length > 0) {
    res.send(isChat[0]);
  } else {
    const chatData: Partial<IChat> = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.user?._id, userId],
    };

    try {
      const createdChat = await Chat.create(chatData);
      const fullChat = await Chat.findOne({ _id: createdChat._id }).populate("users", "-password");
      res.status(200).json(fullChat);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
});

export const fetchChats = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const results = await Chat.find({ users: { $elemMatch: { $eq: req.user?._id } } })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 });

    const populatedResults = await User.populate(results, {
      path: "latestMessage.sender",
      select: "name pic email",
    });

    res.status(200).send(populatedResults);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

export const fetchAllGroups = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const results = await Chat.find({isGroupChat: true})
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 });

    const populatedResults = await User.populate(results, {
      path: "latestMessage.sender",
      select: "name pic email",
    });

    res.status(200).send(populatedResults);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

export const createGroupChat = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { users: usersJSON, name } = req.body;

  if (!usersJSON || !name) {
    res.status(400).send({ message: "Please fill all the fields" });
    return;
  }

  const users: IUser[] = JSON.parse(usersJSON);

  if (users.length < 2) {
    res.status(400).send("More than 2 users are required to form a group chat");
    return;
  }

  users.push(req.user as IUser);

  try {
    const groupChat = await Chat.create({
      chatName: name,
      users,
      isGroupChat: true,
      groupAdmin: req.user,
    });

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.status(200).json(fullGroupChat);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

export const renameGroup = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { chatId, chatName } = req.body;

  try {
    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      { chatName },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!updatedChat) {
      res.status(404).json({ message: "Chat not found" });
      return;
    }

    res.json(updatedChat);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

export const removeFromGroup = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { chatId, userId } = req.body;

  try {
    const removed = await Chat.findByIdAndUpdate(
      chatId,
      { $pull: { users: userId } },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!removed) {
      res.status(404).json({ message: "Chat not found" });
      return;
    }

    res.json(removed);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

export const removeSelfFromGroup = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { chatId } = req.body;

  if (!chatId) {
    res.status(400).send({ message: "Chat ID is required" });
    return;
  }

  const group = await Chat.findById(chatId);
  if (!group) {
    res.status(404).send({ message: "Group not found" });
    return;
  }

  if (!group.users.some(user => user.toString() === req.user?._id.toString())) {
    res.status(400).send({ message: "User not in the group" });
    return;
  }

  group.users = group.users.filter(user => user.toString() !== req.user?._id.toString());
  await group.save();

  res.status(200).send({ message: "Successfully left the group", group });
});

export const addToGroup = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { chatId, userId } = req.body;

  try {
    const added = await Chat.findByIdAndUpdate(
      chatId,
      { $push: { users: userId } },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!added) {
      res.status(404).json({ message: "Chat not found" });
      return;
    }

    res.json(added);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

export const addSelfToGroup = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { chatId } = req.body;

  if (!chatId) {
    res.status(400).send({ message: "Chat ID is required" });
    return;
  }

  const group = await Chat.findById(chatId);
  if (!group) {
    res.status(404).send({ message: "Group not found" });
    return;
  }

  if (group.users.some(user => user.toString() === req.user?._id.toString())) {
    res.status(400).send({ message: "User already in the group" });
    return;
  }

  group.users.push(new mongoose.Types.ObjectId(req.user!._id));
  await group.save();

  res.status(200).send({ message: "Successfully joined the group", group });
});


export const deleteGroupChat = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const chat = await Chat.findById(id);

    if (!chat) {
      res.status(404).json({ message: 'Group chat not found' });
      return;
    }

    if (!chat.isGroupChat) {
      res.status(400).json({ message: 'Not a group chat' });
      return;
    }

    await chat.deleteOne();
    res.status(200).json({ message: 'Group chat deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});
