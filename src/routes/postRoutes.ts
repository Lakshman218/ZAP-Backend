import express from "express";
const router = express.Router()

import { 
  ReplyCommentController,
  addCommentController,
  addPostController,
  deleteCommentController,
  deletePostController,
  getCommentsCount,
  getEditPostController,
  getPostCommentsController,
  getPostController,
  getSavedPostController,
  getUserPostController,
  handlePostCommentController,
  handlePostLikeController,
  likePostController,
  reportPostController,
  savePostController,
  updatePostController,
 } from "../controllers/postController";
import { protect } from "../middlewares/auth";


 router.post("/add-post", protect, addPostController)
 router.post("/get-post", protect, getPostController)
 router.post("/get-edit-post", getEditPostController)
 router.post("/edit-post", protect, updatePostController)
 router.get("/get-user-post/:userId", protect, getUserPostController)
 router.post("/save-post", protect, savePostController)
 router.post("/delete-post", protect, deletePostController)
 router.get("/user-saved-post/:userId", protect, getSavedPostController)
 router.post("/report-post", protect, reportPostController)
 router.post("/like-post", protect, likePostController)
 router.get("/get-post-comments/:postId", protect, getPostCommentsController)
 router.post("/add-comment", protect, addCommentController)
 router.post("/reply-comment", protect, ReplyCommentController)
 router.delete("/delete-post-comment", protect, deleteCommentController)
 router.get("/get-comments-count/:postId", protect, getCommentsCount)
 router.post("/handle-comment", protect, handlePostCommentController)
 router.post("/handle-like", protect, handlePostLikeController)

 export default router