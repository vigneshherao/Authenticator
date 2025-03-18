import User from "../models/User.model.js";
import crypto from "crypto";
import nodemailer from "nodemailer";

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

export { register, verifyUser };
