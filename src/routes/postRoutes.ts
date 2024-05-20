import express from "express";
const router = express.Router()

import { 
  addPostController,
  getPostController,
  getUserPostController,
 } from "../controllers/postController";
import { protect } from "../middlewares/auth";


 router.post("/add-post", protect, addPostController)
 router.post("/get-post", protect, getPostController)
 router.get("/get-user-post/:userId", protect, getUserPostController)

 export default router