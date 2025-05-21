import User from "../models/user.js";
import { createJWT } from "../utils/index.js";
import Notice from "../models/notification.js";
import mongoose from "mongoose";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js";

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, isAdmin, role, title } = req.body;

    const userExist = await User.findOne({ email });

    if (userExist) {
      return res.status(400).json({
        status: false,
        message: "User already exists",
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      isAdmin: false,
      role,
      title,
    });

    if (user) {
      isAdmin ? createJWT(res, user._id) : null;

      user.password = undefined;

      res.status(201).json(user);
    } else {
      return res
        .status(400)
        .json({ status: false, message: "Invalid user data" });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        status: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res
        .status(401)
        .json({ status: false, message: "Invalid email or password." });
    }

    if (!user?.isActive) {
      return res.status(401).json({
        status: false,
        message: "User account has been deactivated, contact the administrator",
      });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        status: false,
        message: "Invalid email or password",
      });
    }

    // Clear any old tokens before creating new one
    res.cookie("token", "", {
      httpOnly: true,
      expires: new Date(0),
    });

    // Create new token
    const token = createJWT(res, user._id);
    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;

    res.status(200).json({
      status: true,
      token,
      user: {
        ...userWithoutPassword,
        isAdmin: user.isAdmin, // Explicitly include admin status
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ status: false, message: error.message });
  }
};
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    const resetToken = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.resetPasswordExpire = Date.now() + 30 * 60 * 1000;

    await user.save();

    // ✅ Properly nested try-catch

    const resetUrl = `${req.headers.origin}/reset-password/${resetToken}`;
    const message = `Password reset requested. Click: ${resetUrl}`;
    try {
      await sendEmail({
        email: user.email,
        subject: "Password Reset",
        message,
      });

      res.status(200).json({
        status: true,
        message: "Password reset email sent",
      });
      console.log(`Reset email sent to ${user.email}`);
    } catch (emailError) {
      // Cleanup on email failure
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      console.error("EMAIL ERROR DETAILS:", {
        message: emailError.message,
        stack: emailError.stack,
        response: emailError.response,
        user: user.email,
      });
      await user.save();

      return res.status(500).json({
        status: false,
        message: "Email could not be sent",
      });
    }
  } catch (error) {
    // ✅ Correct outer catch
    console.error(error);
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    // Hash the token provided in the URL
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find user by token and check if token is not expired
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    }).select("+password"); // Ensure password field is included

    if (!user) {
      return res
        .status(400)
        .json({ status: false, message: "Invalid or expired token" });
    }

    // Update the user's password
    user.password = newPassword; // This will be hashed in the pre-save hook
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    // Clear any existing auth cookies
    res.cookie("token", "", {
      httpOnly: true,
      expires: new Date(0),
    });
    createJWT(res, user._id);
    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;
    res.status(200).json({
      status: true,
      message: "Password reset successfully",
      user: userWithoutPassword,
      token: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: error.message });
  }
};

export const logoutUser = async (req, res) => {
  try {
    res.cookie("token", "", {
      httpOnly: true,
      expires: new Date(0),
    });

    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const addUser = async (req, res) => {
  try {
    // const { id } = req.params;
    console.log("Request Body:", req.body);
    const { name, email, title, role } = req.body;

    // Validate required fields
    if (!name?.trim() || !email?.trim() || !title?.trim() || !role?.trim()) {
      return res.status(400).json({
        status: false,
        message: "All fields are required",
      });
    }

    const user = await User.create({
      name,
      email,
      title,
      role,
      password: "DefaultPassword123",
      isAdmin: false,
      isActive: true,
    });
    user.password = undefined;
    res.status(200).json({
      status: true,
      message: "User created successfully",
      user,
    });
  } catch (error) {
    res.status(400).json({
      status: false,
      message: error.message,
    });
  }
};

export const getTeamList = async (req, res) => {
  try {
    const users = await User.find().select(
      "name title role email isActive createdAt"
    );
    console.log(users);
    res.status(200).json(users);
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const getNotificationsList = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ status: false, message: "Unauthorized" });
    }
    const { userId } = req.user;
    console.log("Fetching notifications for userId:", userId);
    const notice = await Notice.find({
      team: userId,
      isRead: { $nin: [userId] },
    })
      .populate("task", "title")
      .populate({
        path: "team",
        select: "name email",
      })
      .sort({ createdAt: -1 });
    console.log("Fetched Notifications:", notice);
    res.status(200).json(notice);
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const { userId, isAdmin } = req.user;
    // const { id } = req.params;
    const { name, title, role, email, targetUserId } = req.body;

    // const id =
    //   isAdmin && userId === _id
    //     ? userId
    //     : isAdmin && userId !== _id
    //     ? _id
    //     : userId;
    // Determine which user to update
    const updateUserId = isAdmin && targetUserId ? targetUserId : userId;

    const user = await User.findById(updateUserId);
    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    // Regular users can only update their own name and title
    if (!isAdmin) {
      user.name = name || user.name;
      user.title = title || user.title;
    } else {
      // Admins can update all fields
      user.name = name || user.name;
      user.title = title || user.title;
      user.role = role || user.role;
      user.email = email || user.email;
    }

    await user.save();
    user.password = undefined;

    res.status(200).json({
      status: true,
      message: "Profile Updated Successfully.",
      user,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const markNotificationRead = async (req, res) => {
  try {
    const { userId } = req.user;

    const { isReadType, id } = req.query;

    if (isReadType === "all") {
      await Notice.updateMany(
        { team: userId, isRead: { $nin: [userId] } },
        { $push: { isRead: userId } },
        { new: true }
      );
    } else {
      await Notice.findOneAndUpdate(
        { _id: id, isRead: { $nin: [userId] } },
        { $push: { isRead: userId } },
        { new: true }
      );
    }

    res.status(201).json({ status: true, message: "Done" });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const changeUserPassword = async (req, res) => {
  try {
    const { userId } = req.user;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        status: false,
        message: "Current and new password are required",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        status: false,
        message: "Current password is incorrect",
      });
    }
    // Update password
    user.password = newPassword;
    await user.save();

    user.password = undefined;

    res.status(200).json({
      status: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Password change error:", error);
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

export const activateUserProfile = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: false,
        message: "Invalid user ID format",
      });
    }

    const user = await User.findById(id);
    if (!user)
      return res.status(404).json({ status: false, message: "User not found" });

    user.isActive = req.body.isActive; //!user.isActive

    await user.save();

    res.status(200).json({
      status: true,
      message: `User account has been ${
        user?.isActive ? "activated" : "disabled"
      }`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const deleteUserProfile = async (req, res) => {
  try {
    const { id } = req.params;

    await User.findByIdAndDelete(id);

    res
      .status(200)
      .json({ status: true, message: "User deleted successfully" });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};
