import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import friendController from "../controllers/friend.controller.js";

const router = express.Router();

router.post("/send-request/:id", protectRoute, friendController.sendRequest);
router.post("/accept-request/:id", protectRoute, friendController.acceptRequest);
router.post("/reject-request/:id", protectRoute, friendController.rejectRequest);
router.post("/remove-friend/:id", protectRoute, friendController.removeFriend);
router.get("/friends", protectRoute, friendController.getFriends);
router.get("/sent-requests", protectRoute, friendController.getSentRequests); // ✅ New Route

export default router;
