import express from "express";
import HODController from "../controller/HODController";
import isAuth from "../middlewares/isAuth";

const router = express.Router();

router.post("/login", HODController.signin);
router.post("/change-password", isAuth.isHODAuth, HODController.changePassword);
router.post("/meeting/new", isAuth.isHODAuth, HODController.createNewMeeting);
router.post("/meeting/review", isAuth.isHODAuth, HODController.addReview);

// Faculty management routes (HOD only)
router.post("/faculty", isAuth.isHODAuth, HODController.addFaculty);

// router.get("/isAuth", isAuth.isHODAuth, HODController.isAuthenticated);

export default router;