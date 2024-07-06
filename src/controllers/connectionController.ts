import {Request, Response} from "express"
import asyncHandler from "express-async-handler";
import User from "../models/user/userModel";
import Connections from "../models/connections/connectionModel";
import { createNotification } from "../helpers/notificationHelpers";

export const getConnectionController = asyncHandler(
  async(req:Request, res:Response) => {
    const {userId} = req.body
    // console.log("userid for getting connection",userId);
    const connection = await Connections.findOne({userId}).populate({
      path: "followers",
        select: "userName name profileImg isVerified",
        match: { isBlocked: false, isDeleted: false }
      }).populate({
        path: "following",
        select: "userName name profileImg isVerified",
        match: { isBlocked: false, isDeleted: false }
      });
    //  console.log("get connectioin", connection);
    res.status(200).json({ connection })
  }
)

export const followUserController = asyncHandler(async (req: Request, res: Response) => {
  const { userId, followingUser } = req.body;
  // console.log("following ids",userId, followingUser);
  const followingUserInfo = await User.findById(followingUser);
  let followed = false;
  if (!followingUserInfo) {
    res.status(400);
    throw new Error("User not found");
  }

  if (followingUserInfo.isPrivate) {
    await Connections.findOneAndUpdate(
      { userId: followingUser },
      { $addToSet: { requested: userId } },
      { upsert: true }
    );
    await Connections.findOneAndUpdate(
      { userId },
      { $addToSet: { requestSent: followingUser } },
      { upsert: true }
    );

    const notificationData = {
      senderId:userId,
      receiverId: followingUser,
      message: 'requested to Follow',
      link: `/users-profile/${followingUser}/`, 
      read: false, 
   
    };

    createNotification(notificationData)
  } else {
    await Connections.findOneAndUpdate(
      { userId: followingUser },
      { $addToSet: { followers: userId } },
      { upsert: true }
    );
    await Connections.findOneAndUpdate(
      { userId },
      { $addToSet: { following: followingUser } },
      { upsert: true }
    );
    followed = true;
    const notificationData = {
      senderId:userId,
      receiverId: followingUser,
      message: 'Started Following you',
      link: `/visit-profile/posts/`, 
      read: false, 
   
    };

    createNotification(notificationData)
  }
  const followingUserConnections = await Connections.find({
    userId: followingUser,
  });
  console.log(followingUserConnections);
  res
    .status(200)
    .json({ success: true, message: "User followed successfully", followed });
});

export const unFollowUserController = asyncHandler(
  async(req: Request, res: Response) => {
    const { userId, unfollowingUser } = req.body;
    // console.log("to unfollow usr", req.body, userId, unfollowingUser);
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

export const acceptRequestController = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId, requestedUser } = req.body;
    // console.log(userId,requestedUser)
    await Connections.findOneAndUpdate(
      { userId },
      {
        $pull: { requested: requestedUser },
        $addToSet: { followers: requestedUser },
      },
      { new: true }
    );
    await Connections.findOneAndUpdate(
      { userId: requestedUser },
      {
        $pull: { requestSent: userId },
        $addToSet: { following: userId },
      },
      { new: true }
    );
    const notificationData = {
      senderId:userId,
      receiverId: requestedUser ,
      message: 'accepted your request',
      link: `/visit-profile/posts/`, 
      read: false, 
   
    };

    createNotification(notificationData)
    
    const connections = await Connections.findOne({ userId }).populate({
        path: "requested",
        select: "userName name profileImg isVerified",
      });
          res
      .status(200)
      .json({ success: true, message: "Follow request accepted successfully",connections:connections?.requested });
  }
);


export const rejectRequestController = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId, requestedUser } = req.body;
    console.log("reject req",  userId, requestedUser);
    await Connections.findOneAndUpdate(
      { userId },
      { $pull: { requested: requestedUser } },
      { new: true }
    );

    await Connections.findOneAndUpdate(
      { userId: requestedUser },
      { $pull: { requestSent: userId } },
      { new: true }
    );
    const connections = await Connections.findOne({ userId }).populate({
        path: "requested",
        select: "userName name profileImg isVerified",
      });
      // console.log("reject request")

    res
      .status(200)
      .json({ success: true, message: "Follow request rejected successfully" ,connections:connections?.requested});
  }
);


export const getFollowRequestsController = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId } = req.body;

    const requests = await Connections.findOne({ userId }).populate({
      path: "requested",
      select: "userName name profileImg isVerified",
    });
    // console.log("manage request",requests?.requested);
    res.status(200).json({ requests: requests?.requested });
  }
);