import { Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import generateToken from "../utils/generateToken";
import Post from "../models/post/postModel";
import User from "../models/user/userModel";

// create new post

export const addPostController = expressAsyncHandler(
  async(req: Request, res: Response) => {
    const {userId, imgUrl, title, description, hideLikes, hideComment} = req.body

    const post = await Post.create({
      userId, imgUrl: imgUrl, title, description, hideLikes, hideComment
    })
    console.log(post);

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