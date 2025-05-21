import express from "express";
import { isAdminRoute, protectRoute } from "../middlewares/authMiddlewave.js";
import {
  activateUserProfile,
  addUser,
  changeUserPassword,
  deleteUserProfile,
  forgotPassword,
  getNotificationsList,
  getTeamList,
  loginUser,
  logoutUser,
  markNotificationRead,
  registerUser,
  resetPassword,
  updateUserProfile,
} from "../controllers/userController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);

router.get("/get-team", protectRoute, getTeamList);
router.get("/notifications", protectRoute, getNotificationsList);

router.put("/update-profile", protectRoute, updateUserProfile);
router.put("/read-noti", protectRoute, markNotificationRead);
router.put("/change-password", protectRoute, changeUserPassword);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);
// //   FOR ADMIN ONLY - ADMIN ROUTES
router
  .route("/:id")
  .put(protectRoute, isAdminRoute, activateUserProfile)
  .delete(protectRoute, isAdminRoute, deleteUserProfile);

router.post("/add-user", protectRoute, isAdminRoute, addUser);

export default router;
