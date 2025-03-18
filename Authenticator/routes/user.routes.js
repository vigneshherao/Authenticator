import express from "express";
const Router = express.Router();
import { register, verifyUser } from "../controller/user.controller.js";

Router.post("/register", register);
Router.get("/verify/:token", verifyUser);

export default Router;
