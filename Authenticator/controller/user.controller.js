import User from "../models/User.model.js";
import crypto from "crypto";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import bcyrpt from "bcrypt";

dotenv.config();

const register = async (req, res) => {
  const { username, email, password, role } = req.body;

  if (!username || !email || !password || !role) {
    return res.status(400).json({ message: "Please fill in all fields" });
  }

  try {
    const isExistingUser = await User.findOne({ email });

    if (isExistingUser) {
      res.status(400).json({ message: "User already exists" });
    }

    const user = new User({
      username,
      email,
      password,
      role,
    });

    const generatedVerificationToken = crypto.randomBytes(32).toString("hex");

    user.verificationToken = generatedVerificationToken;

    await user.save();

    const transport = nodemailer.createTransport({
      host: "sandbox.smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: "a597c3ef9d6596",
        pass: "331929c7919ff1",
      },
    });

    const mailOPtions = {
      from: '"Chaicode" <test@mailtrap.io>',
      to: user.email,
      subject: "Verification link from chaicode",
      text: "Hello Please verify the mail!",
      html: `<b>Click Here</b>
      <br/>
      ${process.env.BASE_URL}/api/v1/users/verify/${generatedVerificationToken}
      `,
    };

    const result = await transport.sendMail(mailOPtions);
    console.log(`Verification email sent to ${user.email}`);

    console.log("Email sent:", result);

    return res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server Error", error });
  }
};

const verifyUser = async (req, res) => {
  const { token } = req.params;

  if (!token) {
    return res.status(400).json({ message: "Invalid token" });
  }

  try {
    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      return res.status(400).json({ message: "Invalid token" });
    }

    if (token !== user.verificationToken) {
      return res.status(400).json({ message: "Invalid token" });
    }

    user.isVerified = true;
    user.verificationToken = null;

    await user.save();

    res.status(200).json({ message: "User verified successfully" });
  } catch (error) {}
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Please fill in all fields" });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isPasswordMatch = await bcyrpt.compare(password, user.password);

    if (!isPasswordMatch) {
      return res
        .status(400)
        .json({ message: "Password is not correct credentials" });
    }

    if (!user.isVerified) {
      return res.status(400).json({ message: "Please verify your account!" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    const cookieOptions = {
      httpOnly: true,
      secure: true,
      maxAge: 24 * 60 * 60 * 1000,
    };

    res.cookie("token", token, cookieOptions);

    res.status(200).json({ message: "User logged in successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server Error", error });
  }
};

const getUser = (req, res) => {
  try {
    res.status(200).json({
      user: req.user,
      sucess: true,
      message: "User fetched successfully",
    });
  } catch (error) {}
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  console.log(email);

  if (!email) {
    return res.status(400).json({ message: "Please fill the email field" });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    console.log(user);

    const resetToken = crypto.randomBytes(32).toString("hex");

    user.passwordResetToken = resetToken;
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    await user.save();

    const transport = nodemailer.createTransport({
      host: "sandbox.smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: "a597c3ef9d6596",
        pass: "331929c7919ff1",
      },
    });

    const mailOPtions = {
      from: '"Chaicode" <test@mailtrap.io>',
      to: user.email,
      subject: "Forgot Password from chaicode",
      text: "Hello forgot password link will expires in 10 min!",
      html: `<b>Click Here</b>
      <br/>
      ${process.env.BASE_URL}/api/v1/users/reset-password/${resetToken}
      `,
    };

    await transport.sendMail(mailOPtions);
    console.log(`Reset password email sent to ${user.email}`);
    res.status(200).json({ message: "Reset password link sent to your email" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server Error", error });
  }
};

const passwordReset = async (req, res) => {
  const { token } = req.params;
  const { password, rePassword } = req.body;

  if (!password || !rePassword) {
    return res.status(400).json({ message: "Please fill in all fields" });
  }

  if (!token) {
    return res.status(400).json({ message: "Invalid token" });
  }

  try {
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (password !== rePassword) {
      return res.status(400).json({ message: "Password do not match" });
    }

    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server Error", error });
  }
};

export { register, verifyUser, login, getUser, forgotPassword, passwordReset };
