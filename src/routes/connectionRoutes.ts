import express from "express"
const router = express.Router()


import { 
  followUserController, 
  getConnectionController, 
  unFollowUserController
} from "../controllers/connectionController"


router.post('/get-connection', getConnectionController)
router.post('/follow', followUserController)
router.post('/unfollow', unFollowUserController)