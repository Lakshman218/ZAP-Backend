import { Request, Response, json } from "express";
import asyncHandler from "express-async-handler";
import generateToken from "../utils/generateToken";
import Post from "../models/post/postModel";
import User from "../models/user/userModel";
import Connections from "../models/connections/connectionModel";
import Report from "../models/report/reportModel";

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

// get user posts

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

// get all posts

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

// save posts

export const savePostController = asyncHandler(
  async(req:Request, res:Response) => {
    const {postId, userId} = req.body
    console.log(postId, userId);
    const user = await User.findById(userId)
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }
    const isSaved = user.savedPost.includes(postId)
    let mssg
    if(isSaved) {
      await User.findOneAndUpdate(
        { _id: userId },
        { $pull:{savedPost:postId} },
        { new: true }
      );
      mssg = "Post unSaved"
    } else {
      await User.findOneAndUpdate(
        { _id: userId },
        { $push: {savedPost:postId} },
        { new: true }
      );
      mssg = "Post saved"
    }
    const updatedUser = await User.findById(userId);
    console.log("saved post",user.savedPost);
    res.status(200).json({
      message: mssg,
      _id: updatedUser?.id,
      userName: updatedUser?.userName,
      name: updatedUser?.name,
      bio: updatedUser?.bio,
      email: updatedUser?.email,
      phone: updatedUser?.phone,
      gender: updatedUser?.gender,
      profileImg: updatedUser?.profileImg,
      savedPost: updatedUser?.savedPost,
      token: generateToken(updatedUser?.id)
    })
  }
)

// get saved post

export const getSavedPostController = asyncHandler(
  async(req: Request, res: Response) => {
    const id = req.params.userId;
    // console.log("userid",id);
    const user = await User.findOne(
      {_id: id, isBlocked: false},
      { savedPost: 1, _id: 0 }
    )
    if(user) {
      const savedPost = user.savedPost
      const posts = await Post.find({
        _id: {$in: savedPost},
        isDeleted: false,
        isBlocked: false
      }).populate(  
        "userId"
      );
      // console.log("saved posts",posts);
      res.status(200).json(posts)
    } else {
      res.status(400);
      throw new Error("User not found")
    }
  }
)

export const deletePostController = asyncHandler(
  async(req: Request, res: Response) => {
    const {postId, userId} = req.body
    console.log(postId);
    const post = await Post.findById(postId)
    // console.log(post);
    if (!post) {
      res.status(404);
      throw new Error("Post Cannot be found");
    }
    post.isDeleted = true
    await post.save()
    const posts = await Post.find({
      userId: userId,
      isBlocked: false,
      isDeleted: false,
    })
    .populate({
      path: 'userId',
      select: "userName name profileImg isVerified",
    })
    .sort({data: -1})
    res.status(200).json({posts})
  }
)

export const getEditPostController = asyncHandler(
  async(req: Request, res: Response) => {
    const {postId} = req.body
    const post = await Post.findById(postId)
    if(!post) {
      throw new Error("Post Cannot be found");
    }
    res.status(200).json(post)
  }
)

export const updatePostController = asyncHandler(
  async(req: Request, res: Response) => {
    const {postId, userId, title, description} = req.body
    // console.log(postId, userId, title, description);
    const post = await Post.findById(postId)
    if (!post) {
      res.status(400);
      throw new Error("Post cannot be found");
    }
    if (title) post.title = title;
    if (description) post.description = description;
    await post.save()
    const posts = await Post.find({
      userId: userId,
      isBlocked: false,
      isDeleted: false,
    })
    .populate({
      path: "userId",
      select: "userName name profileImg isVerified",
    })
    .sort({ date: -1 });
    res.status(200).json(posts)
  }
)

export const reportPostController = asyncHandler(
  async(req: Request, res: Response) => {
    const {userId, postId, reason} = req.body
    // console.log(userId, postId, reason);
    const existingReport = await Report.findOne({userId, postId})
    if(existingReport) {
      res.status(400).json({message: "You have already reported this post."})
      return
    }
    const report = new Report({
      userId,
      postId,
      reason
    })
    await report.save()

    const reportCount = await Report.countDocuments({postId})
    const REPORT_COUNT_LIMIT = 3  
    if(reportCount >= REPORT_COUNT_LIMIT) {
      await Post.findByIdAndUpdate(postId, {isBlocked:true})
      res.status(200).json({ message: "Post has been blocked due to multiple reports."});
      return
    }
    res.status(200).json({ message: "Post has been reported successfully." });
  }
)