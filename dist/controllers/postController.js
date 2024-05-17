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
exports.addPostController = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const postModel_1 = __importDefault(require("../models/post/postModel"));
// create new post
exports.addPostController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, imgUrl, title, description, hideLikes, hideComment } = req.body;
    const post = yield postModel_1.default.create({
        userId, imgUrl: imgUrl, title, description, hideLikes, hideComment
    });
    console.log(post);
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
