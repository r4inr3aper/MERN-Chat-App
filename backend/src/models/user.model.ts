import { Schema, model, Document, Types } from "mongoose";

interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  pic: string;
  isAdmin: boolean;
  matchPassword(enteredPassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        unique: true, 
        required: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    pic: {
      type: String,
      required: true,
      default: "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
    },
    // isGod: { 
    //     type: Boolean, 
    //     required: true, 
    //     default: false 
    // },
  },
  { timestamps: true }
);

const User = model<IUser>("User", userSchema);

export default User;
