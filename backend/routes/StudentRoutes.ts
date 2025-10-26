import express from "express";
import { 
  getProfile, 
  addProject, 
  getProjects,
  addInternship,
  getInternships,
  addCoCurricular,
  getCoCurriculars,
  getCareerDetails
} from "../controller/StudentController";
import { isAuth } from "../middlewares/isAuth";

const router = express.Router();

// Student profile
router.get("/profile", isAuth, getProfile);

// Project routes
router.post("/add-project", isAuth, addProject);
router.get("/projects", isAuth, getProjects);

// Internship routes
router.post("/add-internship", isAuth, addInternship);
router.get("/internships", isAuth, getInternships);

// Co-curricular routes
router.post("/add-cocurricular", isAuth, addCoCurricular);
router.get("/cocurriculars", isAuth, getCoCurriculars);

// Career details (education interests)
router.get("/career-details", isAuth, getCareerDetails);

export default router;