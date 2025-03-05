import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import friendController from "../controllers/friend.controller.js";

const router = express.Router();

router.get("/search", protectRoute, friendController.searchUsers);
router.get("/", protectRoute, friendController.getFriends);
router.get("/sent-requests", protectRoute, friendController.getSentRequests); 
router.get("/received-requests", protectRoute, friendController.getReceivedRequests); 
router.post("/send-request/:id", protectRoute, friendController.sendRequest);
router.post("/cancel-request/:id", protectRoute, friendController.cancelRequest);
router.post("/accept-request/:id", protectRoute, friendController.acceptRequest);
router.post("/reject-request/:id", protectRoute, friendController.rejectRequest);
router.post("/remove-friend/:id", protectRoute, friendController.removeFriend);

export default router;  
