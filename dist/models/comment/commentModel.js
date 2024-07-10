"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const ReplyCommentSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    replyComment: { type: String, required: true },
    isReplyDeleted: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now },
});
const CommentSchema = new mongoose_1.Schema({
    postId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Post',
        required: true,
    },
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    comment: {
        type: String,
        required: true,
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    replyComments: [ReplyCommentSchema]
}, { timestamps: true });
const Comment = (0, mongoose_1.model)('Comment', CommentSchema);
exports.default = Comment;
