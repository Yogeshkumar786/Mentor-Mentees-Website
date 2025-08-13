import express from "express";
import FacultyController from "../controller/FacultyController";
import isAuth from "../middlewares/isAuth";

const router = express.Router();

router.post("/login", FacultyController.signin);
router.post("/change-password", isAuth.isFacultyAuth, FacultyController.changePassword);
router.post("/meeting/new", isAuth.isFacultyAuth, FacultyController.createNewMeeting);
router.post("/meeting/review", isAuth.isFacultyAuth, FacultyController.addReview);

// Faculty profile management
router.put("/details", isAuth.isFacultyAuth, FacultyController.updateFacultyDetails);

// router.get("/isAuth", isAuth.isFacultyAuth, FacultyController.isAuthenticated);

export default router;