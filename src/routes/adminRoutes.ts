import express from 'express'   
const router = express.Router()

import { LoginController, 
  chartDataController, 
  getDashboardDetails, 
  getGraphUsersController, 
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
router.get("/get-all-users", getGraphUsersController)
router.get("/chart-data", chartDataController)

export default router