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
exports.chartDataController = exports.getDashboardDetails = exports.getPostReports = exports.reportBlockController = exports.postBlockController = exports.getPostsController = exports.userBlockController = exports.getUsersController = exports.LoginController = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const adminModel_1 = __importDefault(require("../models/admin/adminModel"));
const generateAdminToken_1 = __importDefault(require("../utils/generateAdminToken"));
const userModel_1 = __importDefault(require("../models/user/userModel"));
const postModel_1 = __importDefault(require("../models/post/postModel"));
const reportModel_1 = __importDefault(require("../models/report/reportModel"));
exports.LoginController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const admin = yield adminModel_1.default.findOne({ email });
    // console.log("email & password", email, password);
    if (admin && password == admin.password) {
        res.status(200).json({
            message: "Login Succussfull",
            _id: admin.id,
            name: admin.name,
            email: admin.email,
            profileImg: admin.profileImg,
            token: (0, generateAdminToken_1.default)(admin.id),
        });
    }
    else {
        res.status(400).json({ message: "Invalid Credentails" });
    }
}));
exports.getUsersController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield userModel_1.default.find({ isDeleted: false }).sort({ date: -1 });
    if (users) {
        res.status(200).json({ users });
    }
    else {
        res.status(400).json({ message: "Users not found" });
    }
}));
exports.userBlockController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.body;
    const user = yield userModel_1.default.findById(userId);
    // console.log(user);
    if (!user) {
        res.status(400).json({ message: "User not found" });
        return;
    }
    user.isBlocked = !user.isBlocked;
    yield user.save();
    const users = yield userModel_1.default.find({ isDeleted: false }).sort({ date: -1 });
    const blockedUser = user.isBlocked ? "Blocked" : "Unblocked";
    res.status(200).json({ users, message: `${user.userName} has been ${blockedUser}` });
}));
exports.getPostsController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const posts = yield postModel_1.default.find({}).sort({ date: -1 })
        .populate({
        path: "userId",
        select: "userName profileImg",
    });
    if (posts) {
        res.status(200).json({ posts });
    }
    else {
        res.status(400).json({ message: "Post not found" });
    }
}));
exports.postBlockController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { postId } = req.body;
    console.log("postid", postId);
    const post = yield postModel_1.default.findById(postId);
    if (!post) {
        res.status(400);
        throw new Error("Post not found");
    }
    post.isBlocked = !post.isBlocked;
    yield post.save();
    const posts = yield postModel_1.default.find({}).sort({ date: -1 }).lean();
    const blockedPost = post.isBlocked ? "Blocked" : "Unblocked";
    res.status(200).json({ posts, message: `${post.title} has been ${blockedPost}` });
}));
exports.reportBlockController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { postId } = req.body;
    console.log("postid", postId);
    const post = yield postModel_1.default.findById(postId);
    if (!post) {
        res.status(400);
        throw new Error("Post not found");
    }
    post.isBlocked = !post.isBlocked;
    yield post.save();
    const posts = yield postModel_1.default.find({}).sort({ date: -1 }).lean();
    const blockedPost = post.isBlocked ? "Blocked" : "Unblocked";
    res.status(200).json({ posts, message: `${post.title} has been ${blockedPost}` });
}));
exports.getPostReports = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const reports = yield reportModel_1.default.find({})
        .populate({
        path: 'postId',
        populate: ({
            path: 'userId'
        })
    })
        .sort({ date: -1 });
    console.log(reports);
    if (reports) {
        console.log("reports", reports);
        res.status(200).json({ reports });
    }
    else {
        res.status(404).json({ messsage: "No reports found" });
    }
}));
exports.getDashboardDetails = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const totalUsers = yield userModel_1.default.countDocuments({ isDeleted: false });
        const totalPosts = yield postModel_1.default.countDocuments();
        const blockedPosts = yield postModel_1.default.countDocuments({ isBlocked: true });
        const totalReports = yield reportModel_1.default.countDocuments();
        const status = {
            totalUsers,
            totalPosts,
            blockedPosts,
            totalReports,
        };
        res.status(200).json(status);
    }
    catch (err) {
        res.status(500).json(err);
    }
}));
exports.chartDataController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userJoinedDetails = yield userModel_1.default.aggregate([
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                    userCount: { $sum: 1 },
                },
            },
            {
                $sort: { _id: 1 },
            }
        ]);
        const postCreationDetails = yield postModel_1.default.aggregate([
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
        };
        console.log("chartdata", chartData);
        res.status(200).json({ chartData });
    }
    catch (error) {
    }
}));
