import bcrypt from "bcryptjs";
import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    title: { type: String, required: false },
    role: { type: String, required: false },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, required: true, default: false },
    tasks: [{ type: Schema.Types.ObjectId, ref: "Task" }],
    isActive: { type: Boolean, required: true, default: true },
    resetPasswordToken: { type: String },
    resetPasswordExpire: { type: Date },
    leaves: [
      {
        date: { type: Date, required: true },
        reason: String,
        approved: { type: Boolean, default: false },
      },
    ],
  },

  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
