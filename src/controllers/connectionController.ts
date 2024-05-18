import {Request, Response} from "express"
import asyncHandler from "express-async-handler";
import User from "../models/user/userModel";
import Connections from "../models/connections/connectionModel";

export const getConnectionController = asyncHandler(
  async(req:Request, res:Response) => {
    const {userId} = req.body
    // console.log("userid for getting connection",userId);
    const connection = await Connections.findOne({userId}).populate({
      path: "followers",
      select: "userName profileImg isVerified",
    })
    .populate({
      path: "following",
      select: "usernName profileImg isVerified",
    })
    //  console.log("get connectioin", connection);
    res.status(200).json({ connection })
  }
)

export const followUserController = asyncHandler(
  async(req:Request, res:Response) => {
    const {userId, followingUser} = req.body
    // console.log(userId, followingUser);
    let followed = false;

    const followingUserInfo = await User.findById(followingUser)
    if(!followingUserInfo) {
      res.status(400).json({message: "user not found"})
      return
    }
    if(followingUserInfo.isPrivate) {
      await Connections.findOneAndUpdate(
        {userId: followingUser},
        {$addToSet: {requested: userId}},
        {upsert: true}
      );
      await Connections.findByIdAndUpdate(
        {userId},
        {$addToSet: {requestSend: followingUser}},
        {upsert: true}
      );
    } else {
      await Connections.findOneAndUpdate(
        {userId: followingUser},
        {$addToSet: {followers: userId}},
        {upsert: true}
      );
      await Connections.findOneAndUpdate(
        {userId},
        {$addToSet: {following: followingUser}},
        {upsert: true}
      )
      followed = true
    }
    const followingUserConnections = await Connections.find({
      userId: followingUser,
    })
    console.log(followingUserConnections);
    res.status(200).json({success: true, message: "User followed successfully", followed})
  }
)

export const unFollowUserController = asyncHandler(
  async(req: Request, res: Response) => {
    const { userId, unfollowingUser } = req.body;
    console.log("heheheh", req.body, userId, unfollowingUser);
    await Connections.findOneAndUpdate(
      {userId: unfollowingUser},
      {$pull: {followers: userId, requestSent: userId}}
    )

    await Connections.findOneAndUpdate(
      {userId},
      {$pull: {following: unfollowingUser, requested: unfollowingUser}}
    )

    res.status(200).json({success: true, message: "User unfollowed successfully"})
  }
)