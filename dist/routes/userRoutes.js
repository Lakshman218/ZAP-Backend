"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const userController_1 = require("../controllers/userController");
router.post("/login", userController_1.userLoginController);
router.post("/register", userController_1.userRegisterController);
router.post("/verifyOTP", userController_1.verifyOTPController);
router.post("/resendOTP", userController_1.resendOTPController);
router.post("/forgot-password", userController_1.forgotPasswordController);
router.post("/forgot-otp", userController_1.forgotOtpController);
router.post("/reset-password", userController_1.resetPasswordController);
router.post("/google-auth", userController_1.googleAuthController);
router.post("/edit-profile", userController_1.editProfileController);
exports.default = router;
