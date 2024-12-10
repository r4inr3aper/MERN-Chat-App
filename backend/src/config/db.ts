import mongoose from "mongoose";

const connectDB = async (): Promise<void> => {
  try {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error("DATABASE_URL is not defined");
    }

    const conn = await mongoose.connect(databaseUrl);

    console.log("MongoDB Connected!");
  } catch (error) {
    console.error(error);
    process.exit(1); 
  }
};

export default connectDB;