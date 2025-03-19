import mongoose from "mongoose";
import bcyrpt from "bcrypt";

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
      default: "user",
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

userSchema.pre("save", async function (next) {
  try {
    if (this.isModified("password")) {
      const hasedPassword = await bcyrpt.hash(this.password, 10);
      this.password = hasedPassword;
    }

    next();
  } catch (error) {}
});

const User = mongoose.model("User", userSchema);

export default User;
