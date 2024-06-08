import express from 'express'   
const router = express.Router()

import { LoginController, 
  getDashboardDetails, 
  getPostReports, 
  getPostsController, 
  getUsersController, 
  postBlockController, 
  userBlockController 
} from '../controllers/adminController'
import {  } from '../controllers/postController'

router.post("/login", LoginController)
router.get("/get-users", getUsersController)
router.post("/user-block", userBlockController)
router.get("/get-posts", getPostsController)
router.post("/post-block", postBlockController)
router.get("/get-reports", getPostReports)
router.get("/get-details", getDashboardDetails)

export default router