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
 } from '../controllers/userController'

 router.post("/login", userLoginController)
router.post("/register", userRegisterController)
router.post("/verifyOTP", verifyOTPController)
router.post("/resendOTP", resendOTPController)
router.post("/forgot-password", forgotPasswordController)
router.post("/forgot-otp", forgotOtpController)
router.post("/reset-password", resetPasswordController)
router.post("/google-auth", googleAuthController)
router.post("/edit-profile", editProfileController)


export default router