import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import Connections from "../models/connections/connectionModel";
import User from "../models/user/userModel";
import Conversation from "../models/conversations/conversationModel";
import Message from "../models/messages/MessagesModel";
import { s3Upload } from "../utils/cloudStorage/S3Bucket";


export const getEligibleUsersController = asyncHandler(
  async(req:Request, res:Response) => {
    try {
      const {userId} = req.body
      const connections = await Connections.findOne(
        {userId},
        {following: 1}
      )
      const followingUsers = connections?.following
      const validUsers = {$or: [{ _id: { $in: followingUsers } }]}
      // $or: [{isPrivate: false}, {_id: {$in: followingUsers}}]
      const users = await User.find(validUsers)
      // console.log("eligible users", users);
      res.status(200).json(users)
    } catch (err) {
      res.status(500).json(err);
    }
  }
)

export const addConversationController = asyncHandler(
  async(req:Request, res:Response) => {
    const { senderId, receiverId } = req.body
    // console.log("msg ids",senderId, receiverId);  
    const existConversation = await Conversation.findOne({
      members: { $all: [senderId, receiverId] },
    })
    .populate({
      path: "members",
      select: "userName name profileImg isVerified",
    })
    if(existConversation) {
      res.status(200).json(existConversation)
      return
    }
    const newConversation = new Conversation({
      members: [senderId, receiverId]
    })
    try {
      const savedConversation = await newConversation.save()
      const conversation = await Conversation.findById(savedConversation._id)
      .populate({
        path: "members",
        select: "userName name profileImg isVerified", 
      })
      res.status(200).json(conversation)
    } catch (err) { 
      res.status(500).json(err);
    }
  }
)

export const getUserConversationController = asyncHandler(
  async(req:Request, res:Response) => {
    try {
      const userId = req.params.userId
      const conversations = await Conversation.find({
        members: {$in: [userId]},
      })
      .populate({
        path: "members",
        select: "userName name profileImg isVerified", 
      })
      .sort({updatedAt: -1})
      
      const conversationWithMessages = await Promise.all(
        conversations.map(async (conversation) => {
          const messageCount = await Message.countDocuments({
              conversationId: conversation._id
          })
          return messageCount > 0 ? conversation : null
        })
      )
      const filteredConversations = conversationWithMessages.filter(
        (conversation) => conversation !== null
      )
      // console.log("conversations", filteredConversations);
      res.status(200).json(filteredConversations)
    } catch (err) {
      res.status(500).json(err);
    }
  }
)

export const findConversationController = asyncHandler(
  async(req:Request, res:Response) => {
    try {
      const conversation = await Conversation.findOne({
        members: {$all: [req.params.firstUserId, req.params.secondUserId]},
      })
      res.status(200).json({conversation})
    } catch (err) {
      res.status(500).json(err);
    }
  } 
)

// add message
export const addMessageController = asyncHandler(
  async(req:Request, res:Response) => {
    try {
      const { conversationId, sender, text } = req.body;
      // console.log("req body daatta",req.body);
      // console.log("req file daatta",req.file);
      let content = text
      let attachment = null

      if(req.file) {
        let type: string;
        if (req.file.mimetype.startsWith("image/")) {
          type = "image";
        } else if (req.file.mimetype.startsWith("video/")) {
          type = "video";
        } else if (req.file.mimetype.startsWith("audio/")) {
          type = "audio";
        } else {
          type = "file";
        }
        const fileUrl = await s3Upload(req.file)
        console.log("fileurl", fileUrl);
        attachment = {
          type: type,
          url: fileUrl,
          filename: fileUrl,
          size: req.file.size,
        };
        content = req.body.messageType;
      }

      const newMessage = new Message({
        conversationId,
        sender,
        text: content,
        attachment,
      })
      await Conversation.findByIdAndUpdate(
        conversationId, 
        { updatedAt: Date.now() },
        { new: true }
      )
      const savedMessages = await newMessage.save()
      // console.log("saved messages after adding", savedMessages);
      res.status(200).json(savedMessages)
    } catch (err) {
      res.status(500).json(err);
    }
  }
)

// get message
export const getMessagesController = asyncHandler(
  async(req:Request, res:Response) => {
    try {
      const messages = await Message.find({
        conversationId: req.params.conversationId,})
      //   .populate({
      //   path: 'sender',
      //   select: "userName name profileImg isVerified",
      // })
      // console.log("get messages", messages);
      res.status(200).json(messages)
    } catch (err) {
      res.status(500).json(err);
    }
  }
)

// get last message
export const getLastMessageController = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const pipeline: any[] = [
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

      const lastMessages = await Message.aggregate(pipeline);
      res.status(200).json(lastMessages);
    } catch (err) {
      res.status(500).json(err);
    }
  }
)

// set message read
export const setMessageReadController = asyncHandler(
  async(req:Request, res:Response) => {
    try {
      const { conversationId, userId } = req.body
      const messages = await Message.updateMany(
        { conversationId: conversationId, sender: { $ne: userId } },
        { $set: { isRead: true }}
      )
      res.status(200).json({messages})
    } catch (err) {
      res.status(500).json(err);
    }
  }
)

// get unread messsages
export const getUnReadMessageController = asyncHandler(
  async(req:Request, res:Response) => {
    try { 
      const { conversationId, userId } = req.body
      const messages = await Message.find({
        conversationId: conversationId,
        sender: { $ne: userId },
        isRead: false,
      })
      res.status(200).json({messages})
    } catch (err) {
      res.status(500).json(err);
    }
  }
)