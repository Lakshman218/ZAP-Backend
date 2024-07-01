import express from "express";
const router = express.Router()

import { 
  addConversationController,
  addMessageController,
  findConversationController,
  getEligibleUsersController,
  getLastMessageController,
  getMessagesController,
  getUserConversationController,
} from "../controllers/chatController";

//  message routes
router.post("/chat-eligible-users", getEligibleUsersController)
router.post('/add-message', addMessageController)
router.get('/get-messages/:conversationId', getMessagesController)
router.get('/get-last-messages', getLastMessageController)

// conversation routes
router.post("/add-conversation", addConversationController)
router.get("/get-conversations/:userId", getUserConversationController)
router.get("/find-conversation/:firstUserId/:secondUserId", findConversationController)

export default router