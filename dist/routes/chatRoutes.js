"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = require("../utils/multer/multer");
const router = express_1.default.Router();
const chatController_1 = require("../controllers/chatController");
//  message routes
router.post("/chat-eligible-users", chatController_1.getEligibleUsersController);
router.post('/add-message', multer_1.upload.single('file'), chatController_1.addMessageController);
router.get('/get-messages/:conversationId', chatController_1.getMessagesController);
router.get('/get-last-messages', chatController_1.getLastMessageController);
router.patch('/set-message-read', chatController_1.setMessageReadController);
router.post('/get-unread-messages', chatController_1.getUnReadMessageController);
// conversation routes
router.post("/add-conversation", chatController_1.addConversationController);
router.get("/get-conversations/:userId", chatController_1.getUserConversationController);
router.get("/find-conversation/:firstUserId/:secondUserId", chatController_1.findConversationController);
exports.default = router;
