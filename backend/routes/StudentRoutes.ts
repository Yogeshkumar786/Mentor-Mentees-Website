import express from "express";
import StudentController from "../controller/StudentController";
import isAuth from "../middlewares/isAuth";

const router = express.Router();

router.post("/login", StudentController.signin);
router.post("/change-password", isAuth.isStudentAuth, StudentController.changePassword);
router.get("/me", isAuth.isStudentAuth, StudentController.getMyProfile);
router.get("/rollno/:rollNo", isAuth.isStudentAuth, StudentController.getStudentByRollNo);
// router.get("/isAuth", isAuth.isStudentAuth, StudentController.isAuthenticated);

// Project routes
router.post("/projects", isAuth.isStudentAuth, StudentController.addProject);
router.get("/projects", isAuth.isStudentAuth, StudentController.getMyProjects);
router.put("/projects/:projectId", isAuth.isStudentAuth, StudentController.updateProject);
router.delete("/projects/:projectId", isAuth.isStudentAuth, StudentController.deleteProject);

// Internship routes
router.post("/internships", isAuth.isStudentAuth, StudentController.addInternship);
router.get("/internships", isAuth.isStudentAuth, StudentController.getMyInternships);
router.put("/internships/:internshipId", isAuth.isStudentAuth, StudentController.updateInternship);
router.delete("/internships/:internshipId", isAuth.isStudentAuth, StudentController.deleteInternship);

export default router;