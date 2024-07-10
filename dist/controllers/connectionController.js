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
exports.getFollowRequestsController = exports.rejectRequestController = exports.acceptRequestController = exports.unFollowUserController = exports.followUserController = exports.getConnectionController = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const userModel_1 = __importDefault(require("../models/user/userModel"));
const connectionModel_1 = __importDefault(require("../models/connections/connectionModel"));
const notificationHelpers_1 = require("../helpers/notificationHelpers");
exports.getConnectionController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.body;
    // console.log("userid for getting connection",userId);
    const connection = yield connectionModel_1.default.findOne({ userId }).populate({
        path: "followers",
        select: "userName name profileImg isVerified",
        match: { isBlocked: false, isDeleted: false }
    }).populate({
        path: "following",
        select: "userName name profileImg isVerified",
        match: { isBlocked: false, isDeleted: false }
    });
    //  console.log("get connectioin", connection);
    res.status(200).json({ connection });
}));
exports.followUserController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, followingUser } = req.body;
    // console.log("following ids",userId, followingUser);
    const followingUserInfo = yield userModel_1.default.findById(followingUser);
    let followed = false;
    if (!followingUserInfo) {
        res.status(400);
        throw new Error("User not found");
    }
    if (followingUserInfo.isPrivate) {
        yield connectionModel_1.default.findOneAndUpdate({ userId: followingUser }, { $addToSet: { requested: userId } }, { upsert: true });
        yield connectionModel_1.default.findOneAndUpdate({ userId }, { $addToSet: { requestSent: followingUser } }, { upsert: true });
        const notificationData = {
            senderId: userId,
            receiverId: followingUser,
            message: 'requested to Follow',
            link: `/users-profile/${followingUser}/`,
            read: false,
        };
        (0, notificationHelpers_1.createNotification)(notificationData);
    }
    else {
        yield connectionModel_1.default.findOneAndUpdate({ userId: followingUser }, { $addToSet: { followers: userId } }, { upsert: true });
        yield connectionModel_1.default.findOneAndUpdate({ userId }, { $addToSet: { following: followingUser } }, { upsert: true });
        followed = true;
        const notificationData = {
            senderId: userId,
            receiverId: followingUser,
            message: 'Started Following you',
            link: `/visit-profile/posts/`,
            read: false,
        };
        (0, notificationHelpers_1.createNotification)(notificationData);
    }
    const followingUserConnections = yield connectionModel_1.default.find({
        userId: followingUser,
    });
    console.log(followingUserConnections);
    res
        .status(200)
        .json({ success: true, message: "User followed successfully", followed });
}));
exports.unFollowUserController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, unfollowingUser } = req.body;
    // console.log("to unfollow usr", req.body, userId, unfollowingUser);
    yield connectionModel_1.default.findOneAndUpdate({ userId: unfollowingUser }, { $pull: { followers: userId, requestSent: userId } });
    yield connectionModel_1.default.findOneAndUpdate({ userId }, { $pull: { following: unfollowingUser, requested: unfollowingUser } });
    res.status(200).json({ success: true, message: "User unfollowed successfully" });
}));
exports.acceptRequestController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, requestedUser } = req.body;
    // console.log(userId,requestedUser)
    yield connectionModel_1.default.findOneAndUpdate({ userId }, {
        $pull: { requested: requestedUser },
        $addToSet: { followers: requestedUser },
    }, { new: true });
    yield connectionModel_1.default.findOneAndUpdate({ userId: requestedUser }, {
        $pull: { requestSent: userId },
        $addToSet: { following: userId },
    }, { new: true });
    const notificationData = {
        senderId: userId,
        receiverId: requestedUser,
        message: 'accepted your request',
        link: `/visit-profile/posts/`,
        read: false,
    };
    (0, notificationHelpers_1.createNotification)(notificationData);
    const connections = yield connectionModel_1.default.findOne({ userId }).populate({
        path: "requested",
        select: "userName name profileImg isVerified",
    });
    res
        .status(200)
        .json({ success: true, message: "Follow request accepted successfully", connections: connections === null || connections === void 0 ? void 0 : connections.requested });
}));
exports.rejectRequestController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, requestedUser } = req.body;
    console.log("reject req", userId, requestedUser);
    yield connectionModel_1.default.findOneAndUpdate({ userId }, { $pull: { requested: requestedUser } }, { new: true });
    yield connectionModel_1.default.findOneAndUpdate({ userId: requestedUser }, { $pull: { requestSent: userId } }, { new: true });
    const connections = yield connectionModel_1.default.findOne({ userId }).populate({
        path: "requested",
        select: "userName name profileImg isVerified",
    });
    // console.log("reject request")
    res
        .status(200)
        .json({ success: true, message: "Follow request rejected successfully", connections: connections === null || connections === void 0 ? void 0 : connections.requested });
}));
exports.getFollowRequestsController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.body;
    const requests = yield connectionModel_1.default.findOne({ userId }).populate({
        path: "requested",
        select: "userName name profileImg isVerified",
    });
    // console.log("manage request",requests?.requested);
    res.status(200).json({ requests: requests === null || requests === void 0 ? void 0 : requests.requested });
}));
