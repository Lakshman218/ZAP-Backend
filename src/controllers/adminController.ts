import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import Admin from "../models/admin/adminModel";
import generateAdminToken from "../utils/generateAdminToken";
import User from "../models/user/userModel";
import Post from "../models/post/postModel";
import Report from "../models/report/reportModel";

export const LoginController = asyncHandler(
  async(req: Request, res: Response) => {
    const {email, password} = req.body
    const admin = await Admin.findOne({email})
    // console.log("email & password", email, password);
   if(admin && password == admin.password) {
    res.status(200).json({
      message: "Login Succussfull",
      _id: admin.id,
      name: admin.name,
      email: admin.email,
      profileImg: admin.profileImg,
      token: generateAdminToken(admin.id),
    })
   } else {
    res.status(400).json({message: "Invalid Credentails"});
   }
  }
)

export const getUsersController = asyncHandler(
  async(req:Request, res:Response) => {

    const users = await User.find({isDeleted: false}).sort({date: -1})
    if(users) {
      res.status(200).json({users})
    } else {
      res.status(400).json({message: "Users not found"})
    }
  }
)

export const userBlockController = asyncHandler(
  async(req:Request, res:Response) => {
    const {userId} = req.body
    const user = await User.findById(userId)
    // console.log(user);
    if(!user) {
      res.status(400).json({message: "User not found"})
      return
    }
    user.isBlocked = !user.isBlocked
    await user.save()
    const users = await User.find({isDeleted: false}).sort({date: -1})
    const blockedUser = user.isBlocked ? "Blocked" : "Unblocked"
    res.status(200).json({users, message: `${user.userName} has been ${blockedUser}`})
  }
)

export const getPostsController = asyncHandler(
  async(req:Request, res:Response) => {
    const posts = await Post.find({}).sort({date: -1})
    .populate({
      path: "userId",
      select: "userName profileImg",
    })
    if(posts) {
      res.status(200).json({posts})
    } else {
      res.status(400).json({message: "Post not found"})
    }
  }
)

export const postBlockController = asyncHandler(
  async (req: Request, res: Response) => {
    const {postId}  = req.body;
    console.log("postid",postId);
    const post = await Post.findById(postId);
    
    if (!post) {
      res.status(400);
      throw new Error("Post not found");
    }
    post.isBlocked = !post.isBlocked;    
    await post.save();

    const posts = await Post.find({}).sort({ date: -1 }).lean();    
    const blockedPost = post.isBlocked ? "Blocked" : "Unblocked";
    
    res.status(200).json({ posts, message: `${post.title} has been ${blockedPost}` });
  }
);

export const reportBlockController = asyncHandler(
  async (req: Request, res: Response) => {
    const {postId}  = req.body;
    console.log("postid",postId);
    const post = await Post.findById(postId);
    
    if (!post) {
      res.status(400);
      throw new Error("Post not found");
    }
    post.isBlocked = !post.isBlocked;    
    await post.save();

    const posts = await Post.find({}).sort({ date: -1 }).lean();    
    const blockedPost = post.isBlocked ? "Blocked" : "Unblocked";
    
    res.status(200).json({ posts, message: `${post.title} has been ${blockedPost}` });
  }
);

export const getPostReports = asyncHandler(
  async(req: Request, res: Response) => {
    const reports = await Report.find({})
    .populate({
      path:'postId',
      populate:({
        path:'userId'
      })
    })
    .sort({date: -1})
    console.log(reports)
    if(reports) {
      console.log("reports", reports);
      res.status(200).json({reports})
    } else {
      res.status(404).json({messsage: "No reports found"})
    }
  }
)

export const getDashboardDetails  = asyncHandler(
  async(req:Request, res:Response) => {
    try {
      const totalUsers = await User.countDocuments({isDeleted: false});
      const totalPosts = await Post.countDocuments();
      const blockedPosts = await Post.countDocuments({ isBlocked: true });
      const totalReports = await Report.countDocuments();

      const status = {
        totalUsers,
        totalPosts,
        blockedPosts,
        totalReports,
      }
    res.status(200).json(status)
    } catch (err) {
      res.status(500).json(err);
    }
  }
)

//  get all users
export const getGraphUsersController = asyncHandler(
  async(req:Request, res:Response) => {
    try {
      console.log("hereeeeeee");
      const users = await User.find({isDeleted: false}).select('createdAt')
      console.log("users for graph", users);
      res.status(200).json({users})
    } catch (err) {
      res.status(500).json(err);
    }
  }
)

export const chartDataController = asyncHandler(
  async(req:Request, res:Response) => {
    try {
      const userJoinedDetails = await User.aggregate([
        {
          $group: {
            _id: {$dateToString: { format: "%Y-%m", date: "$createdAt"}},
            userCount: { $sum: 1 },
          },
        },
        {
          $sort: { _id: 1 },
        }
      ])
      const postCreationDetails = await Post.aggregate([
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
            postCount: { $sum: 1 },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ]);

      const chartData = {
        userJoinedDetails,
        postCreationDetails,
      }
      console.log("chartdata", chartData);
      res.status(200).json({chartData})
    } catch (error) {
      
    }
  }
)