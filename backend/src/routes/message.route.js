import express from "express";
import messageController from "../controllers/message.controller.js";
import {protectRoute} from "../middleware/auth.middleware.js"
const router=express.Router();
router.get("/users", protectRoute, messageController.getUsersForSidebar_get)
router.get("/:id", protectRoute, messageController.getMessages_get)
router.post("/send/:id",protectRoute,messageController.sendMessage_post)
export default router;