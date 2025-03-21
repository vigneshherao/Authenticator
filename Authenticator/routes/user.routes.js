import express from "express";
const Router = express.Router();
import {
  register,
  verifyUser,
  login,
  getUser,
  forgotPassword,
  passwordReset,
} from "../controller/user.controller.js";
import { authUser } from "../middleware/user.middleware.js";

Router.post("/register", register);
Router.get("/verify/:token", verifyUser);
Router.post("/login", login);
Router.get("/profile", authUser, getUser);
Router.post("/forgot-password", forgotPassword);
Router.post("/reset-password/:token", passwordReset);

export default Router;
