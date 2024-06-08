import { Request, Response, json } from "express";
import asyncHandler from "express-async-handler";
import generateToken from "../utils/generateToken";
import Post from "../models/post/postModel";
import User from "../models/user/userModel";
import Connections from "../models/connections/connectionModel";
import Report from "../models/report/reportModel";
import Comment from "../models/comment/commentModel";

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
      select: "userName name profileImg isVerified",
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
        select: "userName name profileImg isVerified",
      })
      .populate({
        path: "likes",
        select: "userName name profileImg isVerified",
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

export const likePostController = asyncHandler(
  async(req: Request, res: Response) => {
    const {postId, userId} = req.body
    const post = await Post.findById(postId)
    if (!post) {
      res.status(404);
      throw new Error("Post not found");
    }
    const isLiked = post.likes.includes(userId)
    if(isLiked) {
      await Post.findOneAndUpdate(
        { _id: postId },
        { $pull: {likes: userId} },
        { new: true }
      );
    } else {
      await Post.findOneAndUpdate(
        { _id: postId },
        { $push: {likes: userId} },
        { new: true }
      )
    }

    const posts = await Post.find({
      userId: userId,
      isBlocked: false,
      isDeleted: false,
    })
    .populate({
      path: "userId",
      select: "userName name profileImg isVerified",
    })
    .sort({date: -1})
    // console.log("posts while like",posts);
    res.status(200).json({posts})
  }
)

// get post comments
export const getPostCommentsController = asyncHandler(
  async(req:Request, res:Response) => {
    const postId = req.params.postId
    // console.log("postId for getting comment",postId);
    const comments = await Comment.find({
      postId: postId,
      isDeleted: false 
    })
    .populate({
      path: "userId",
      select: "userName name profileImg",
    })
    .populate({
      path: "replyComments.userId",
      select: "userName name profileImg",
    })
    .sort({createdAt: -1})
    // console.log("get comments",comments);
    res.status(200).json({comments})
  }
)

// add comment
export const addCommentController = asyncHandler(
  async(req:Request, res:Response) => {
    const {postId, userId, comment} = req.body;
    console.log(postId, userId, comment);
    const newComment = await Comment.create({
      postId,
      userId,
      comment,
    })
    await newComment.save()

    const comments = await Comment.find({
      postId: postId,
      isDeleted: false
    })
    .populate({
      path: "userId",
      select: "userName name profileImg"
    })
    .populate({
      path: "replyComments.userId",
      select: "userName name profileImg"
    })
    .sort({ createdAt: -1 });
    res.status(200).json({message: "Comment added succussfully", comments})
  }
)

// delete comment
export const deleteCommentController = asyncHandler(
  async(req:Request, res:Response) => {
    const {commentId} = req.body
    const comment = await Comment.findById(commentId)
    if(!comment) {
      res.status(404);
      throw new Error("Comment not found");
    }
    comment.isDeleted = true;
    await comment.save()

    const comments = await Comment.find({
      postId: comment.postId,
      isDeleted: false,
    })
    .populate({
      path: "userId",
      select: "userName name profileImg"
    })
    .populate({
      path: "replyComments.userId",
      select: "userName name profileImg"
    })
    .sort({ createdAt: -1 });
    res.status(200).json({message: "Comment deleted succussfully", comments})
  }
)

// reply comment
export const ReplyCommentController = asyncHandler(
  async(req:Request, res:Response) => {
    const { commentId, userId, replyComment } = req.body
    const comment = await Comment.findById(commentId)
    if (!comment) {
      res.status(404);
      throw new Error("Comment not found");
    }
    const newReplyComment = {
      userId,
      replyComment,
      timestamp: new Date(),
    }
    comment.replyComments.push(newReplyComment)
    await comment.save()

    const comments = await Comment.find({
      postId: comment.postId,
      isDeleted: false,
    })
    .populate({
      path: "userId",
      select: "userName name profileImg"
    })
    .populate({
      path: "replyComments.userId",
      select: "userName name profileImg"
    })
    .sort({ createdAt: -1 });
    res.status(200).json({message: "Reply Comment added succussfully", comments})
  }
)

// get comment count
export const getCommentsCount = asyncHandler(
  async(req:Request, res:Response) => {
    const postId = req.params.postId
    const commentCounts = await Comment.countDocuments({
      postId,
      isDeleted: false,
    })
    res.status(200).json({commentCounts})
  }
)

export const handlePostCommentController = asyncHandler(
  async(req:Request, res:Response) => {
    const {postId, userId} = req.body
    // console.log("manage commetn",postId);
    const post = await Post.findById(postId)
    if(!post) {
      res.status(400).json({message: "post not found"})
      return
    }
    post.hideComment = !post.hideComment
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
    .sort({date: -1})
    const commentState = post.hideComment ? "Comment is hidden" : "Comment is visible"
    res.status(200).json({message: `${commentState}`, posts})
  }
)

export const handlePostLikeController = asyncHandler(
  async(req:Request, res:Response) => {
    const {postId, userId} = req.body
    // console.log("manage like",postId, userId);
    const post = await Post.findById(postId)
    if(!post) {
      res.status(400).json({message: "post not found"})
      return
    }
    post.hideLikes = !post.hideLikes
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
    .sort({date: -1})
    const likeState = post.hideLikes ? "Like is hidden" : "Like is visible"
    res.status(200).json({message: `${likeState}`, posts})
  }
)