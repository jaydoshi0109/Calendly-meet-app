// routes/meetings.js
import express from "express";
import {
  createMeeting,
  confirmMeeting,
  cancelMeeting,
  getMeetingLogs,
  acceptMeeting,
  declineMeeting,
  getUserMeetings,
  getMeetingById
} from "../controllers/meetingController.js";
import { ensureAuth } from "../middleware/authMiddleware.js";
const router = express.Router();

// routes/meetings.js


router.post("/accept/:id", acceptMeeting);
router.post("/decline/:id", declineMeeting);
router.get("/all",ensureAuth, getUserMeetings);

router.post("/create", ensureAuth, createMeeting);
router.post("/confirm/:id", confirmMeeting);
router.delete("/:id", ensureAuth, cancelMeeting); // NEW
router.get("/logs", ensureAuth, getMeetingLogs); // NEW endpoint for logs
router.get("/:id",ensureAuth, getMeetingById);
export default router;
