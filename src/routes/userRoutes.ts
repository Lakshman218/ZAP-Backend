import express from 'express'
const router = express.Router()

import { 
  userRegisterController, 
  userLoginController,
  verifyOTPController,
  resendOTPController,
  forgotPasswordController,
  forgotOtpController,
  resetPasswordController,
  googleAuthController,
  editProfileController,
  userSuggestionsController,
  userSearchController,
  getUserDetailsController,
  changePasswordController,
 } from '../controllers/userController'
 
import { getNotifications } from '../controllers/notificationController'

 router.post("/login", userLoginController)
router.post("/register", userRegisterController)
router.post("/verifyOTP", verifyOTPController)
router.post("/resendOTP", resendOTPController)
router.post("/forgot-password", forgotPasswordController)
router.post("/forgot-otp", forgotOtpController)
router.post("/reset-password", resetPasswordController)
router.post("/google-auth", googleAuthController)
router.post("/user-suggestions", userSuggestionsController)
router.post("/user-search", userSearchController)
router.get("/user-details/:userId", getUserDetailsController)
router.post("/edit-profile", editProfileController)
router.post("/change-password", changePasswordController)
router.post("/get-notifications", getNotifications)


export default router