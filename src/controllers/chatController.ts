import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import Connections from "../models/connections/connectionModel";
import User from "../models/user/userModel";
import Conversation from "../models/conversations/conversationModel";


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
      // console.log("usr in msg", users);
      res.status(200).json({users})
    } catch (err) {
      res.status(500).json(err);
    }
  }
)

export const addConversationController = asyncHandler(
  async(req:Request, res:Response) => {
    const { senderId, receiverId } = req.body
    console.log("msg ids",senderId, receiverId);  
    const existConversation = await Conversation.findOne({
      members: { $all: [senderId, receiverId] },
    })
    .populate({
      path: "members",
      select: "userName name profileImg isVerified",
    })
    if(existConversation) {
      res.status(200).json({existConversation})
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
      const conversations = await Conversation.find({
        members: {$in: [req.params.userId]},
      })
      .populate({
        path: "members",
        select: "userName name profileImg isVerified", 
      })
      .sort({updatedAt: -1})
    } catch (error) {
      
    }
  }
)