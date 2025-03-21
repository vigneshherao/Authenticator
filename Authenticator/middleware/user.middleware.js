import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/User.model.js";

const authUser = async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return res.status(400).json({ message: "Invalid token" });
  }

  try {
    const decodedObj = jwt.verify(token, process.env.JWT_SECRET);

    console.log(decodedObj);

    const { id } = decodedObj;

    const user = await User.findById(id).select("-password -verificationToken");

    req.user = user;

    next();
  } catch (error) {
    console.log(error);

    res.status(401).json({ message: "Unauthorized User" });

    next();
  }
};

export { authUser };
