"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUnReadMessageController = exports.setMessageReadController = exports.getLastMessageController = exports.getMessagesController = exports.addMessageController = exports.findConversationController = exports.getUserConversationController = exports.addConversationController = exports.getEligibleUsersController = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const connectionModel_1 = __importDefault(require("../models/connections/connectionModel"));
const userModel_1 = __importDefault(require("../models/user/userModel"));
const conversationModel_1 = __importDefault(require("../models/conversations/conversationModel"));
const MessagesModel_1 = __importDefault(require("../models/messages/MessagesModel"));
const S3Bucket_1 = require("../utils/cloudStorage/S3Bucket");
exports.getEligibleUsersController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.body;
        const connections = yield connectionModel_1.default.findOne({ userId }, { following: 1 });
        const followingUsers = connections === null || connections === void 0 ? void 0 : connections.following;
        const validUsers = { $or: [{ _id: { $in: followingUsers } }] };
        // $or: [{isPrivate: false}, {_id: {$in: followingUsers}}]
        const users = yield userModel_1.default.find(validUsers);
        // console.log("eligible users", users);
        res.status(200).json(users);
    }
    catch (err) {
        res.status(500).json(err);
    }
}));
exports.addConversationController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { senderId, receiverId } = req.body;
    // console.log("msg ids",senderId, receiverId);  
    const existConversation = yield conversationModel_1.default.findOne({
        members: { $all: [senderId, receiverId] },
    })
        .populate({
        path: "members",
        select: "userName name profileImg isVerified",
    });
    if (existConversation) {
        res.status(200).json(existConversation);
        return;
    }
    const newConversation = new conversationModel_1.default({
        members: [senderId, receiverId]
    });
    try {
        const savedConversation = yield newConversation.save();
        const conversation = yield conversationModel_1.default.findById(savedConversation._id)
            .populate({
            path: "members",
            select: "userName name profileImg isVerified",
        });
        res.status(200).json(conversation);
    }
    catch (err) {
        res.status(500).json(err);
    }
}));
exports.getUserConversationController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.params.userId;
        const conversations = yield conversationModel_1.default.find({
            members: { $in: [userId] },
        })
            .populate({
            path: "members",
            select: "userName name profileImg isVerified",
        })
            .sort({ updatedAt: -1 });
        const conversationWithMessages = yield Promise.all(conversations.map((conversation) => __awaiter(void 0, void 0, void 0, function* () {
            const messageCount = yield MessagesModel_1.default.countDocuments({
                conversationId: conversation._id
            });
            return messageCount > 0 ? conversation : null;
        })));
        const filteredConversations = conversationWithMessages.filter((conversation) => conversation !== null);
        // console.log("conversations", filteredConversations);
        res.status(200).json(filteredConversations);
    }
    catch (err) {
        res.status(500).json(err);
    }
}));
exports.findConversationController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const conversation = yield conversationModel_1.default.findOne({
            members: { $all: [req.params.firstUserId, req.params.secondUserId] },
        });
        res.status(200).json({ conversation });
    }
    catch (err) {
        res.status(500).json(err);
    }
}));
// add message
exports.addMessageController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { conversationId, sender, text, sharedPost } = req.body;
        // console.log("all msg details", conversationId, sender, text, sharedPost);
        // console.log("sharedPost", sharedPost);
        let content = text;
        let attachment = null;
        let sharedPostData = null;
        if (req.file) {
            let type;
            if (req.file.mimetype.startsWith("image/")) {
                type = "image";
            }
            else if (req.file.mimetype.startsWith("video/")) {
                type = "video";
            }
            else if (req.file.mimetype.startsWith("audio/")) {
                type = "audio";
            }
            else {
                type = "file";
            }
            const fileUrl = yield (0, S3Bucket_1.s3Upload)(req.file);
            // console.log("fileurl", fileUrl);
            attachment = {
                type: type,
                url: fileUrl,
                filename: fileUrl,
                size: req.file.size,
            };
            content = req.body.messageType;
        }
        if (sharedPost) {
            sharedPostData = sharedPost; // Parse the sharedPost data
        }
        // console.log("sharedPostData", sharedPostData);
        const newMessage = new MessagesModel_1.default({
            conversationId,
            sender,
            text: content,
            attachment,
            sharedPost: sharedPostData,
        });
        // console.log("newMessage", newMessage);
        yield conversationModel_1.default.findByIdAndUpdate(conversationId, { updatedAt: Date.now() }, { new: true });
        console.log("conversation updated");
        const savedMessages = yield newMessage.save();
        console.log("savedMessages", savedMessages);
        res.status(200).json(savedMessages);
    }
    catch (err) {
        res.status(500).json(err);
    }
}));
// get message
exports.getMessagesController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const messages = yield MessagesModel_1.default.find({
            conversationId: req.params.conversationId,
        })
            .populate({
            path: 'sharedPost',
            populate: {
                path: 'userId',
                select: 'userName name profileImg isVerified'
            }
        })
            .populate({
            path: 'sender',
            select: "userName name profileImg isVerified",
        });
        res.status(200).json(messages);
    }
    catch (err) {
        res.status(500).json(err);
    }
}));
// get last message
exports.getLastMessageController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const pipeline = [
            {
                $sort: { createdAt: -1 },
            },
            {
                $group: {
                    _id: "$conversationId",
                    lastMessage: { $first: "$$ROOT" },
                },
            },
            {
                $replaceRoot: { newRoot: "$lastMessage" },
            },
        ];
        const lastMessages = yield MessagesModel_1.default.aggregate(pipeline);
        res.status(200).json(lastMessages);
    }
    catch (err) {
        res.status(500).json(err);
    }
}));
// set message read
exports.setMessageReadController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { conversationId, userId } = req.body;
        const messages = yield MessagesModel_1.default.updateMany({ conversationId: conversationId, sender: { $ne: userId } }, { $set: { isRead: true } });
        res.status(200).json({ messages });
    }
    catch (err) {
        res.status(500).json(err);
    }
}));
// get unread messsages
exports.getUnReadMessageController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { conversationId, userId } = req.body;
        const messages = yield MessagesModel_1.default.find({
            conversationId: conversationId,
            sender: { $ne: userId },
            isRead: false,
        });
        res.status(200).json({ messages });
    }
    catch (err) {
        res.status(500).json(err);
    }
}));
