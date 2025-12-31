import express from "express";
import HODController from "../controller/HODController";
import isAuth from "../middlewares/isAuth";

const router = express.Router();

router.post("/meeting/new", isAuth.isHODAuth, HODController.createNewMeeting);
router.post("/meeting/review", isAuth.isHODAuth, HODController.addReview);

// Faculty management routes (HOD only)
router.post("/faculty", isAuth.isHODAuth, HODController.addFaculty);

// Mentor assignment route (HOD only)
router.post("/assign-mentor", isAuth.isHODAuth, HODController.assignMentor);

// Assign one faculty to multiple students (HOD only)
router.post("/assign-mentor-bulk", isAuth.isHODAuth, HODController.assignMentorToMultipleStudents);

// router.get("/isAuth", isAuth.isHODAuth, HODController.isAuthenticated);

export default router;