import express from "express";
const Router = express.Router();
import { register, verifyUser, login } from "../controller/user.controller.js";

Router.post("/register", register);
Router.get("/verify/:token", verifyUser);
Router.post("/login", login);

export default Router;
