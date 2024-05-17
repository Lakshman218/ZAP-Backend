import express from "express";
const router = express.Router()

import { 
  addPostController,
  getPostController,
  getUserPostController,
 } from "../controllers/postController";


 router.post("/add-post", addPostController)
 router.post("/get-post", getPostController)
 router.get("/get-user-post/:userId",getUserPostController)

 export default router