import { login, logout, changePassword } from "../controller/AuthController";
import express from "express";

const router = express.Router();
router.post("/login", login);
router.post("/logout", logout);
router.post("/change-password", changePassword);
export default router;