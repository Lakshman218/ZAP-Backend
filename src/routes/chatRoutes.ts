import express from "express";
const router = express.Router()

import { 
  addConversationController,
  getEligibleUsersController,
  getUserConversationController,
} from "../controllers/chatController";

//  message routes
router.post("/chat-eligible-users", getEligibleUsersController)

// conversation routes
router.post("/add-conversation", addConversationController)
router.post("/get-conversations/:userId", getUserConversationController)

export default router