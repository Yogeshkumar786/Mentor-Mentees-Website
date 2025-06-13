import express from "express";
import AuthController from "../controller/AuthController";

const router = express.Router();

router.post("/student/login", AuthController.StudentLogin);
router.post("/faculty/login", AuthController.FacultyLogin);
router.post("/hod/login", AuthController.HODLogin);
router.get("/logout", AuthController.logout);

export default router;