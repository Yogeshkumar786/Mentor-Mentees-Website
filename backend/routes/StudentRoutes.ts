import express from "express";
import StudentController from "../controller/StudentController";
import isAuth from "../middlewares/isAuth";

const router = express.Router();

router.post("/login", StudentController.signin);
router.post("/change-password", isAuth.isStudentAuth, StudentController.changePassword);
router.get("/me", isAuth.isStudentAuth, StudentController.getMyProfile);
router.get("/rollno/:rollNo", isAuth.isStudentAuth, StudentController.getStudentByRollNo);
// router.get("/isAuth", isAuth.isStudentAuth, StudentController.isAuthenticated);

export default router;