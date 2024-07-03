import express from "express"
const router = express.Router()


import { 
  acceptRequestController,
  followUserController, 
  getConnectionController, 
  getFollowRequestsController, 
  rejectRequestController, 
  unFollowUserController
} from "../controllers/connectionController"


router.post('/get-connection', getConnectionController)
router.post('/follow', followUserController)
router.post('/unfollow', unFollowUserController)
router.post('/accept-request',acceptRequestController);
router.post('/reject-request',rejectRequestController);
router.post('/get-requested-users',getFollowRequestsController);

export default router