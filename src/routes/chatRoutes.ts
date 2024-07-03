import express from "express";
import { upload } from "../utils/multer/multer"
const router = express.Router()

import { 
  addConversationController,
  addMessageController,
  findConversationController,
  getEligibleUsersController,
  getLastMessageController,
  getMessagesController,
  getUnReadMessageController,
  getUserConversationController,
  setMessageReadController,
} from "../controllers/chatController";

//  message routes
router.post("/chat-eligible-users", getEligibleUsersController)
router.post('/add-message', upload.single('file'), addMessageController)
router.get('/get-messages/:conversationId', getMessagesController)
router.get('/get-last-messages', getLastMessageController)
router.patch('/set-message-read', setMessageReadController)
router.post('/get-unread-messages', getUnReadMessageController)

// conversation routes
router.post("/add-conversation", addConversationController)
router.get("/get-conversations/:userId", getUserConversationController)
router.get("/find-conversation/:firstUserId/:secondUserId", findConversationController)

export default router