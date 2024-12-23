import { Request, Response } from "express";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import generateToken from "../config/token.js";
import { IUser } from "../models/user.model.js";

interface AuthenticatedRequest extends Request {
  user?: IUser; 
}

export const signup = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password, pic } = req.body;

  if (!name || !email || !password) {
    res.status(400).json({ success: false, message: "Please enter all fields!" });
    return;
  }

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400).json({ success: false, message: "User already exists!" });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      pic,
    });

    const savedUser = await newUser.save();

    res.status(201).json({
      success: true,
      message: "User registered successfully!",
      user: {
        _id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
        pic: savedUser.pic,
      },
      token: generateToken(savedUser._id),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while registering the user.",
      error: (error as Error).message,
    });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ success: false, message: "Please provide email and password!" });
    return;
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ success: false, message: "User doesn't exist!" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ success: false, message: "Invalid password!" });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Login successful!",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        pic: user.pic,
      },
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred during login.",
      error: (error as Error).message,
    });
  }
};

export const logout = async (_req: Request, res: Response): Promise<void> => {
  try {
    res.status(200).json({ success: true, message: "Logout successful!" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred during logout.",
      error: (error as Error).message,
    });
  }
};


export const allUsers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const search = req.query.search as string | undefined;
    const keyword = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const userId = req.user?._id;
    const users = await User.find(keyword).find({ _id: { $ne: userId } });

    res.send(users);
  } catch (error) {
    res.status(500).json({ success: false, message: "An error occurred", error });
  }};
  
  export const getUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?._id;

      if (!userId) {
        res.status(401).json({ success: false, message: "Unauthorized access!" });
        return;
      }

      const user = await User.findById(userId).select("name email isAdmin pic");

      if (!user) {
        res.status(404).json({ success: false, message: "User not found!" });
        return;
      }

      res.status(200).json({
        success: true,
        user: {
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin,
          pic: user.pic,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "An error occurred while fetching user credentials.",
        error: (error as Error).message,
      });
    }
  };