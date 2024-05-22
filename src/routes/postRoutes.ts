import express from "express";
const router = express.Router()

import { 
  addPostController,
  deletePostController,
  getEditPostController,
  getPostController,
  getSavedPostController,
  getUserPostController,
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

 export default router