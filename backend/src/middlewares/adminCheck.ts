import { Request, Response, NextFunction } from "express";
import User, { IUser } from "../models/user.model.js";
import asyncHandler from "express-async-handler";

interface AuthenticatedRequest extends Request {
  user?: { _id: string }; 
}

export const adminCheck = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.user?._id;

    if (!userId) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    const user: IUser | null = await User.findById(userId);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (!user.isAdmin) {
      res.status(403).json({ message: "Admin privileges required." });
      return;
    }

    next();
  }
);
