import { login, logout, changePassword, register } from "../controller/AuthController";
import express from "express";
import { isAuth } from "../middlewares/isAuth";
import { isAdmin } from "../middlewares/isAdmin";

const router = express.Router();
router.post("/login", login);
router.post("/logout", logout);
router.post("/change-password", isAuth, changePassword);
router.post("/register", isAuth, isAdmin, register);
export default router;