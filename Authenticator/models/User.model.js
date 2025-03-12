import mongoose from "mongoose";
import { type } from "os";

const userSchema = mongoose.Schema(
  {
    username: {
      type: String,
    },
    email: {
      type: String,
    },
    password: {
      type: String,
    },
    role: {
      enum: ["user", "admin"],
      type: String,
    },
    isVerified: {
      type: Boolean,
    },
    passwordResetToken: {
      type: String,
    },
    passwordResetExpires: {
      type: Date,
    },
    verificationToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.Model("User", userSchema);

export default User;
