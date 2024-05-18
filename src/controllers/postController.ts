import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import generateToken from "../utils/generateToken";
import Post from "../models/post/postModel";
import User from "../models/user/userModel";
import Connections from "../models/connections/connectionModel";

// create new post

export const addPostController = asyncHandler(
  async(req: Request, res: Response) => {
    const {userId, imgUrl, title, description, hideLikes, hideComment} = req.body
    // console.log("image url",imgUrl);
    const post = await Post.create({
      userId, imgUrl: imgUrl, title, description, hideLikes, hideComment
    })
    // console.log(post);

    if(!post) {
      res.status(400).json({message: "Unable to add post"})
    }

    const posts = await Post.find({isBlocked: false, isDeleted: false})
    .populate({
      path: "userId",
      select: "userName profileImg isVerified",
    })
    .populate({
      path: "likes",
      select: "userName profileImg isVerified",
    })
    .populate({
      path: "comments",
      select: "userName profileImg isVerified",
    })
    .sort({date: -1})
    res.status(200).json({message: "Post added succussfully", posts})
  }
)

export const getUserPostController = asyncHandler(
  async(req:Request, res:Response) => {
    // console.log("in user post");
    const id = req.params.userId
    const posts = await Post.find({
      userId: id,
      isBlocked: false,
      isDeleted: false,
    })
    .populate({
      path: "userId",
      select: "userName profileImg isVerified",
    })
    .sort({date: -1})
    // console.log("userposts", posts)
    res.status(200).json(posts)
  }
)

export const getPostController = asyncHandler(
  async(req:Request, res:Response) => {
    const {userId} = req.body
    
    const connections = await Connections.findOne({userId}, {following: 1}) 
    const followingUsers = connections?.following
    // const validUsers = {$or: [{ isPrivate: false }, { _id: { $in: followingUsers } }]}
    const validUsers = {$or: [{ _id: { $in: followingUsers } }]}
    const users = await User.find(validUsers)
    const userIds = users.map((user) => user._id)

    interface PostsQuery {
      userId: {$in: string[]};
      isBlocked: boolean;
      isDeleted: boolean;
      or?: {[key: string]: any}[];
    }
    const postsQuery: PostsQuery = {
      userId: {$in: [...userIds, userId]},
      isBlocked: false,
      isDeleted: false,
    }
    const posts = await Post.find(postsQuery)
      .populate({
        path: "userId",
        select: "userName profileImg isVerified",
      })
      .sort({date: -1})
      // console.log(posts);
      res.status(200).json(posts)
  }
)