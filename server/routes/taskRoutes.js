import express from "express";
import {
  createSubTask,
  createTask,
  dashboardStatistics,
  deleteRestoreTask,
  duplicateTask,
  getCalendarTasks,
  getTask,
  getTasks,
  postTaskActivity,
  restoreTask,
  searchTasks,
  trashTask,
  updateTask,
} from "../controllers/taskController.js";
import multer from "multer";
const upload = multer({ dest: "uploads/" });
import { isAdminRoute, protectRoute } from "../middlewares/authMiddlewave.js";

const router = express.Router();
router.get("/search", protectRoute, searchTasks);
router.post(
  "/create",
  protectRoute,
  isAdminRoute,
  upload.array("assets", 5),
  createTask
);
router.post("/duplicate/:id", protectRoute, isAdminRoute, duplicateTask);
router.post("/activity/:id", protectRoute, postTaskActivity);

router.get("/dashboard", protectRoute, dashboardStatistics);
router.get("/", protectRoute, getTasks);
router.get("/calendar", protectRoute, getCalendarTasks);
router.get("/:id", protectRoute, getTask);

router.put("/create-subtask/:id", protectRoute, isAdminRoute, createSubTask);
router.put("/update/:id", protectRoute, isAdminRoute, updateTask);
router.put("/:id/trash", protectRoute, isAdminRoute, trashTask);
router.put("/:id/restore", protectRoute, isAdminRoute, restoreTask);

router.delete(
  "/delete-restore/:id?",
  protectRoute,
  isAdminRoute,
  deleteRestoreTask
);

export default router;
