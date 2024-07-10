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
exports.getExplorePostController = exports.handlePostLikeController = exports.handlePostCommentController = exports.getCommentsCount = exports.ReplyCommentController = exports.deleteReplyCommentController = exports.deleteCommentController = exports.addCommentController = exports.getPostCommentsController = exports.likePostController = exports.reportPostController = exports.updatePostController = exports.getEditPostController = exports.deletePostController = exports.getSavedPostController = exports.savePostController = exports.getPostController = exports.singlePostController = exports.getUserPostController = exports.addPostController = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const generateToken_1 = __importDefault(require("../utils/generateToken"));
const postModel_1 = __importDefault(require("../models/post/postModel"));
const userModel_1 = __importDefault(require("../models/user/userModel"));
const connectionModel_1 = __importDefault(require("../models/connections/connectionModel"));
const reportModel_1 = __importDefault(require("../models/report/reportModel"));
const commentModel_1 = __importDefault(require("../models/comment/commentModel"));
const notificationHelpers_1 = require("../helpers/notificationHelpers");
// create new post
exports.addPostController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("add post", req.body);
    const { userId, imgUrl, title, description, hideLikes, hideComment } = req.body;
    // console.log("image url",imgUrl);
    const post = yield postModel_1.default.create({
        userId, imgUrl: imgUrl, title, description, hideLikes, hideComment
    });
    // console.log(post);
    if (!post) {
        res.status(400).json({ message: "Unable to add post" });
    }
    const posts = yield postModel_1.default.find({ isBlocked: false, isDeleted: false })
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
        .sort({ date: -1 });
    res.status(200).json({ message: "Post added succussfully", posts });
}));
// get user posts
exports.getUserPostController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // console.log("in user post");
    const id = req.params.userId;
    const posts = yield postModel_1.default.find({
        userId: id,
        isBlocked: false,
        isDeleted: false,
    })
        .populate({
        path: "userId",
        select: "userName name profileImg isVerified",
    })
        .populate({
        path: "likes",
        select: "userName name profileImg isVerified",
    })
        .sort({ date: -1 });
    // console.log("userposts", posts)
    res.status(200).json(posts);
}));
// get single post 
exports.singlePostController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { postId } = req.body;
    const post = yield postModel_1.default.findOne({
        _id: postId,
        isBlocked: false,
        isDeleted: false,
    })
        .populate({
        path: "userId",
        select: "userName name profileImg isVerified",
    })
        .populate({
        path: "likes",
        select: "userName name profileImg isVerified",
    });
}));
// get all posts
// export const getPostController = asyncHandler(
//   async(req:Request, res:Response) => {
//     const {userId} = req.body
//     const connections = await Connections.findOne({userId}, {following: 1}) 
//     const followingUsers = connections?.following
//     // const validUsers = {$or: [{ isPrivate: false }, { _id: { $in: followingUsers } }]}
//     const validUsers = {$or: [{ _id: { $in: followingUsers } }]}
//     const users = await User.find(validUsers)
//     const userIds = users.map((user) => user._id)
//     interface PostsQuery {
//       userId: {$in: string[]};
//       isBlocked: boolean;
//       isDeleted: boolean;
//       or?: {[key: string]: any}[];
//     }
//     const postsQuery: PostsQuery = {
//       userId: {$in: [...userIds, userId]},
//       isBlocked: false,
//       isDeleted: false,
//     }
//     const posts = await Post.find(postsQuery)
//       .populate({
//         path: "userId",
//         select: "userName name profileImg isVerified",
//       })
//       .populate({
//         path: "likes",
//         select: "userName name profileImg isVerified",
//       })
//       .sort({date: -1})
//       // console.log(posts);
//       res.status(200).json(posts)
//   }
// )
exports.getPostController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.body;
        // Fetch the user's connections
        const connections = yield connectionModel_1.default.findOne({ userId }, { following: 1 });
        const followingUsers = (connections === null || connections === void 0 ? void 0 : connections.following) || [];
        // Fetch valid users who are not blocked or deleted
        const validUsers = yield userModel_1.default.find({
            _id: { $in: followingUsers },
            isBlocked: false,
            isDeleted: false
        });
        const validUserIds = validUsers.map(user => user._id);
        // Prepare the posts query
        const postsQuery = {
            userId: { $in: [...validUserIds, userId] },
            isBlocked: false,
            isDeleted: false
        };
        // Fetch the posts
        const posts = yield postModel_1.default.find(postsQuery)
            .populate({
            path: "userId",
            select: "userName name profileImg isVerified",
            match: { isBlocked: false, isDeleted: false }
        })
            .populate({
            path: "likes",
            select: "userName name profileImg isVerified",
            match: { isBlocked: false, isDeleted: false }
        })
            .sort({ date: -1 });
        res.status(200).json(posts);
    }
    catch (err) {
        res.status(500).json(err);
    }
}));
// save posts
exports.savePostController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { postId, userId } = req.body;
    console.log(postId, userId);
    const user = yield userModel_1.default.findById(userId);
    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }
    const isSaved = user.savedPost.includes(postId);
    let mssg;
    if (isSaved) {
        yield userModel_1.default.findOneAndUpdate({ _id: userId }, { $pull: { savedPost: postId } }, { new: true });
        mssg = "Post unSaved";
    }
    else {
        yield userModel_1.default.findOneAndUpdate({ _id: userId }, { $push: { savedPost: postId } }, { new: true });
        mssg = "Post saved";
    }
    const updatedUser = yield userModel_1.default.findById(userId);
    console.log("saved post", user.savedPost);
    res.status(200).json({
        message: mssg,
        _id: updatedUser === null || updatedUser === void 0 ? void 0 : updatedUser.id,
        userName: updatedUser === null || updatedUser === void 0 ? void 0 : updatedUser.userName,
        name: updatedUser === null || updatedUser === void 0 ? void 0 : updatedUser.name,
        bio: updatedUser === null || updatedUser === void 0 ? void 0 : updatedUser.bio,
        email: updatedUser === null || updatedUser === void 0 ? void 0 : updatedUser.email,
        phone: updatedUser === null || updatedUser === void 0 ? void 0 : updatedUser.phone,
        gender: updatedUser === null || updatedUser === void 0 ? void 0 : updatedUser.gender,
        profileImg: updatedUser === null || updatedUser === void 0 ? void 0 : updatedUser.profileImg,
        savedPost: updatedUser === null || updatedUser === void 0 ? void 0 : updatedUser.savedPost,
        token: (0, generateToken_1.default)(updatedUser === null || updatedUser === void 0 ? void 0 : updatedUser.id)
    });
}));
// get saved post
// export const getSavedPostController = asyncHandler(
//   async(req: Request, res: Response) => {
//     const id = req.params.userId;
//     const user = await User.findOne(
//       {_id: id, isBlocked: false},
//       { savedPost: 1, _id: 0 }
//     )
//     if(user) {
//       const savedPost = user.savedPost
//       const posts = await Post.find({
//         _id: {$in: savedPost},
//         isDeleted: false,
//         isBlocked: false
//       }).populate(  
//         "userId"
//       );
//       // console.log("saved posts",posts);
//       res.status(200).json(posts)
//     } else {
//       res.status(400);
//       throw new Error("User not found")
//     }
//   }
// )
exports.getSavedPostController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.userId;
    try {
        const user = yield userModel_1.default.findOne({ _id: id, isBlocked: false, isDeleted: false }, { savedPost: 1, _id: 0 });
        if (user) {
            const savedPost = user.savedPost;
            // Ensure posts are not deleted or blocked
            const posts = yield postModel_1.default.find({
                _id: { $in: savedPost },
                isDeleted: false,
                isBlocked: false
            }).populate({
                path: "userId",
                select: "userName name profileImg isVerified",
                match: { isBlocked: false, isDeleted: false }
            });
            const validPosts = posts.filter(post => post.userId !== null);
            res.status(200).json(validPosts);
        }
        else {
            res.status(400);
            throw new Error("User not found");
        }
    }
    catch (err) {
        res.status(500).json(err);
    }
}));
exports.deletePostController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { postId, userId } = req.body;
    console.log(postId);
    const post = yield postModel_1.default.findById(postId);
    // console.log(post);
    if (!post) {
        res.status(404);
        throw new Error("Post Cannot be found");
    }
    post.isDeleted = true;
    yield post.save();
    const posts = yield postModel_1.default.find({
        userId: userId,
        isBlocked: false,
        isDeleted: false,
    })
        .populate({
        path: 'userId',
        select: "userName name profileImg isVerified",
    })
        .sort({ data: -1 });
    res.status(200).json({ posts });
}));
exports.getEditPostController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { postId } = req.body;
    const post = yield postModel_1.default.findById(postId);
    if (!post) {
        throw new Error("Post Cannot be found");
    }
    res.status(200).json(post);
}));
exports.updatePostController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { postId, userId, title, description } = req.body;
    // console.log(postId, userId, title, description);
    const post = yield postModel_1.default.findById(postId);
    if (!post) {
        res.status(400);
        throw new Error("Post cannot be found");
    }
    if (title)
        post.title = title;
    if (description)
        post.description = description;
    yield post.save();
    const posts = yield postModel_1.default.find({
        userId: userId,
        isBlocked: false,
        isDeleted: false,
    })
        .populate({
        path: "userId",
        select: "userName name profileImg isVerified",
    })
        .sort({ date: -1 });
    res.status(200).json(posts);
}));
exports.reportPostController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, postId, reason } = req.body;
    // console.log(userId, postId, reason);
    const existingReport = yield reportModel_1.default.findOne({ userId, postId });
    if (existingReport) {
        res.status(400).json({ message: "You have already reported this post." });
        return;
    }
    const report = new reportModel_1.default({
        userId,
        postId,
        reason
    });
    yield report.save();
    const reportCount = yield reportModel_1.default.countDocuments({ postId });
    const REPORT_COUNT_LIMIT = 3;
    if (reportCount >= REPORT_COUNT_LIMIT) {
        yield postModel_1.default.findByIdAndUpdate(postId, { isBlocked: true });
        res.status(200).json({ message: "Post has been blocked due to multiple reports." });
        return;
    }
    res.status(200).json({ message: "Post has been reported successfully." });
}));
exports.likePostController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { postId, userId } = req.body;
    const post = yield postModel_1.default.findById(postId);
    if (!post) {
        res.status(404);
        throw new Error("Post not found");
    }
    const isLiked = post.likes.includes(userId);
    if (isLiked) {
        yield postModel_1.default.findOneAndUpdate({ _id: postId }, { $pull: { likes: userId } }, { new: true });
    }
    else {
        console.log("matching", post.userId, userId);
        if (post.userId.toString() !== userId) {
            const notificationData = {
                senderId: userId,
                receiverId: post.userId.toString(), // Ensure this is a string
                message: "liked your post",
                link: `/profile`,
                read: false,
                isDeleted: false,
                postId: postId,
            };
            yield (0, notificationHelpers_1.createNotification)(notificationData);
        }
        yield postModel_1.default.findOneAndUpdate({ _id: postId }, { $push: { likes: userId } }, { new: true });
    }
    const posts = yield postModel_1.default.find({
        userId: userId,
        isBlocked: false,
        isDeleted: false,
    })
        .populate({
        path: "userId",
        select: "userName name profileImg isVerified",
    })
        .sort({ date: -1 });
    // console.log("posts while like",posts);
    res.status(200).json({ posts });
}));
// get post comments
// export const getPostCommentsController = asyncHandler(
//   async(req:Request, res:Response) => {
//     const postId = req.params.postId
//     // console.log("postId for getting comment",postId);
//     const comments = await Comment.find({
//       postId: postId,
//       isDeleted: false 
//     })
//     .populate({
//       path: "userId",
//       select: "userName name profileImg",
//     })
//     .populate({
//       path: "replyComments.userId",
//       select: "userName name profileImg",
//     })
//     .sort({createdAt: -1})
//     // console.log("get comments",comments);
//     res.status(200).json({comments})
//   }
// )
exports.getPostCommentsController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const postId = req.params.postId;
    try {
        const comments = yield commentModel_1.default.find({
            postId: postId,
            isDeleted: false
        })
            .populate({
            path: "userId",
            select: "userName name profileImg",
            match: { isBlocked: false, isDeleted: false }
        })
            .populate({
            path: "replyComments.userId",
            select: "userName name profileImg",
            match: { isBlocked: false, isDeleted: false }
        })
            .sort({ createdAt: -1 });
        const validComments = comments.filter(comment => comment.userId !== null);
        validComments.forEach(comment => {
            comment.replyComments = comment.replyComments.filter(reply => reply.userId !== null);
        });
        res.status(200).json({ comments: validComments });
    }
    catch (err) {
        res.status(500).json(err);
    }
}));
// add comment
exports.addCommentController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { postId, userId, comment } = req.body;
    console.log(postId, userId, comment);
    const newComment = yield commentModel_1.default.create({
        postId,
        userId,
        comment,
    });
    yield newComment.save();
    const postUploader = yield postModel_1.default.findById(postId);
    if (postUploader && postUploader.userId !== userId) {
        const notificationData = {
            senderId: userId,
            receiverId: postUploader.userId,
            message: "commented on a post",
            link: `/user-profile/${postUploader.userId}`,
        };
        (0, notificationHelpers_1.createNotification)(notificationData);
    }
    const comments = yield commentModel_1.default.find({
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
    res.status(200).json({ message: "Comment added succussfully", comments });
}));
// delete comment
exports.deleteCommentController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { commentId } = req.body;
    const comment = yield commentModel_1.default.findById(commentId);
    if (!comment) {
        res.status(404);
        throw new Error("Comment not found");
    }
    comment.isDeleted = true;
    yield comment.save();
    const comments = yield commentModel_1.default.find({
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
    res.status(200).json({ message: "Comment deleted succussfully", comments });
}));
// delete Comment reply
exports.deleteReplyCommentController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { commentId, replyUser, replyTime } = req.body;
    // if (!mongoose.Types.ObjectId.isValid(commentId) || !mongoose.Types.ObjectId.isValid(replyUser)) {
    //   res.status(400).json({ message: 'Invalid ID format' });
    //   return
    // }
    const comment = yield commentModel_1.default.findById(commentId);
    if (!comment) {
        res.status(404).json({ message: 'Comment not found' });
        return;
    }
    const reply = comment.replyComments.find((reply) => reply.userId.toString() === replyUser &&
        new Date(reply.timestamp).toISOString() === new Date(replyTime).toISOString());
    if (!reply) {
        res.status(404).json({ message: 'Reply comment not found' });
        return;
    }
    reply.isReplyDeleted = true;
    yield comment.save();
    const comments = yield commentModel_1.default.find({
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
    res.status(200).json({ message: "Comment deleted succussfully", comments });
}));
// reply comment
exports.ReplyCommentController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { commentId, userId, replyComment } = req.body;
    console.log(commentId, userId, replyComment);
    const comment = yield commentModel_1.default.findById(commentId);
    if (!comment) {
        res.status(404);
        throw new Error("Comment not found");
    }
    const newReplyComment = {
        userId,
        replyComment,
        timestamp: new Date(),
    };
    comment.replyComments.push(newReplyComment);
    yield comment.save();
    const comments = yield commentModel_1.default.find({
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
    res.status(200).json({ message: "Reply Comment added succussfully", comments });
}));
// get comment count
exports.getCommentsCount = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const postId = req.params.postId;
    // console.log("cmt count",req.params.postId);
    const commentCounts = yield commentModel_1.default.countDocuments({
        postId,
        isDeleted: false,
    });
    // console.log("count",commentCounts);
    res.status(200).json({ commentCounts });
}));
exports.handlePostCommentController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { postId, userId } = req.body;
    // console.log("manage commetn",postId);
    const post = yield postModel_1.default.findById(postId);
    if (!post) {
        res.status(400).json({ message: "post not found" });
        return;
    }
    post.hideComment = !post.hideComment;
    yield post.save();
    const posts = yield postModel_1.default.find({
        userId: userId,
        isBlocked: false,
        isDeleted: false,
    })
        .populate({
        path: "userId",
        select: "userName name profileImg isVerified",
    })
        .sort({ date: -1 });
    const commentState = post.hideComment ? "Comment is hidden" : "Comment is visible";
    res.status(200).json({ message: `${commentState}`, posts });
}));
exports.handlePostLikeController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { postId, userId } = req.body;
    // console.log("manage like",postId, userId);
    const post = yield postModel_1.default.findById(postId);
    if (!post) {
        res.status(400).json({ message: "post not found" });
        return;
    }
    post.hideLikes = !post.hideLikes;
    yield post.save();
    const posts = yield postModel_1.default.find({
        userId: userId,
        isBlocked: false,
        isDeleted: false,
    })
        .populate({
        path: "userId",
        select: "userName name profileImg isVerified",
    })
        .sort({ date: -1 });
    const likeState = post.hideLikes ? "Like is hidden" : "Like is visible";
    res.status(200).json({ message: `${likeState}`, posts });
}));
exports.getExplorePostController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.body;
        // console.log("explore", userId);
        const posts = yield postModel_1.default.find({
            // userId: { $ne: userId },
            isBlocked: false,
            isDeleted: false,
        })
            .populate({
            path: "userId",
            select: "userName name profileImg isVerified",
            match: { isBlocked: false, isDeleted: false, isPrivate: false }
        })
            .populate({
            path: "likes",
            select: "userName name profileImg isVerified",
            match: { isBlocked: false, isDeleted: false }
        })
            .sort({ date: -1 });
        // Filter out posts where the associated user or any like is null
        const validPosts = posts.filter(post => post.userId !== null);
        validPosts.forEach(post => {
            post.likes = post.likes.filter(like => like !== null);
        });
        res.status(200).json(validPosts);
    }
    catch (err) {
        res.status(500).json(err);
    }
}));
