import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/user.js";

export const dbConnection = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("DB connection established");
    const adminExists = await User.findOne({ email: "admin@example.com" });

    if (!adminExists) {
      // Create an admin user if it doesn't exist
      const adminUser = await User.create({
        name: "Admin User",
        email: "admin@example.com",
        password: await bcrypt.hash("adminpassword", 10), // Hash the password
        isAdmin: true,
        role: "Administrator",
        title: "Admin",
      });

      console.log("Admin user created:", adminUser);
    } else {
      console.log("Admin user already exists:", adminExists);
    }
  } catch (error) {
    console.log("DB Error: " + error);
    process.exit(1);
  }
};

export const createJWT = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  // Change sameSite from strict to none when you deploy your app
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    sameSite: "lax", //prevent CSRF attack
    maxAge: 1 * 24 * 60 * 60 * 1000, //1 day
  });
  return token;
};
