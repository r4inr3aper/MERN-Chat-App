import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import User, { IUser } from "../models/user.model.js";

interface DecodedToken {
  id: string;
}

interface AuthenticatedRequest extends Request {
  user?: IUser;
}

const protect = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  let token: string | undefined;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Bearer vdsjvdsnv
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as DecodedToken;

      req.user = await User.findById(decoded.id).select("-password");

      next();
    } catch (error) {
      res.status(401).json({ message: "Not authorized, token failed!" });
    }
  } else {
    res.status(401).json({ message: "Not authorized, no token provided!" });
  }
};

export default protect;
