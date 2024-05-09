import express from "express";
const router = express.Router()

import { 
  addPostController,
 } from "../controllers/postController";


 router.post("/add-post", addPostController)

 export default router