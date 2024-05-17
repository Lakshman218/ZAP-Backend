"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.editProfileController = exports.googleAuthController = exports.userLoginController = exports.resetPasswordController = exports.forgotOtpController = exports.forgotPasswordController = exports.resendOTPController = exports.verifyOTPController = exports.userRegisterController = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const speakeasy_1 = __importDefault(require("speakeasy"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const userModel_1 = __importDefault(require("../models/user/userModel"));
const sendVerifyEmail_1 = __importDefault(require("../utils/sendVerifyEmail"));
const generateToken_1 = __importDefault(require("../utils/generateToken"));
const connectionModel_1 = __importDefault(require("../models/connections/connectionModel"));
// Register new user
exports.userRegisterController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userName, email, password } = req.body;
    const userEmail = yield userModel_1.default.findOne({ email });
    if (userEmail) {
        res.status(500).json({ message: "Email already exist" });
    }
    const userId = yield userModel_1.default.findOne({ userName });
    if (userId) {
        res.status(500).json({ message: "UserName already exist" });
    }
    const otp = speakeasy_1.default.totp({
        secret: speakeasy_1.default.generateSecret({ length: 20 }).base32,
        digits: 4,
    });
    // console.log("req session details", req.session);
    const sessionData = req.session;
    sessionData.userDetails = { userName, email, password };
    sessionData.otp = otp;
    sessionData.otpGeneratedTime = Date.now();
    const salt = yield bcrypt_1.default.genSalt(10);
    const hashedPassword = yield bcrypt_1.default.hash(password, salt);
    sessionData.userDetails.password = hashedPassword;
    (0, sendVerifyEmail_1.default)(req, userName, email);
    console.log("register session", sessionData);
    res.status(200).json({ message: "OTP sent for verification ", email });
}));
// register otp verification 
exports.verifyOTPController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { otp } = req.body;
    console.log("otp verify session  ", req.session);
    const sessionData = req.session;
    const storedOTP = sessionData.otp;
    if (!storedOTP || otp !== storedOTP) {
        res.status(400).json({ message: "Invalid OTP" });
        return;
        // throw new Error("Invalid OTP")
    }
    const otpGeneratedTime = sessionData.otpGeneratedTime || 0;
    const currentTime = Date.now();
    const otpExpirationTime = 60 * 1000;
    if (currentTime - otpGeneratedTime > otpExpirationTime) {
        res.status(400).json({ message: "User details not found in session" });
        // throw new Error("User details not found in session")
    }
    const userDetails = sessionData.userDetails;
    if (!userDetails) {
        res.status(400).json({ message: "User details not found in session" });
        throw new Error("User details not found in session");
    }
    const user = yield userModel_1.default.create({
        userName: userDetails.userName,
        email: userDetails.email,
        password: userDetails.password,
    });
    delete sessionData.userDetails;
    delete sessionData.otp;
    delete sessionData.otpGeneratedTime;
    res.status(200).json({ message: "OTP verified, user created", user });
}));
// resend otp
exports.resendOTPController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("inside resend otp");
    const { email } = req.body;
    const otp = speakeasy_1.default.totp({
        secret: speakeasy_1.default.generateSecret({ length: 20 }).base32,
        digits: 4,
    });
    const sessionData = req.session;
    sessionData.otp = otp;
    sessionData.otpGeneratedTime = Date.now();
    const userDetails = sessionData.userDetails;
    console.log("sessiondata resendotp", sessionData);
    if (!userDetails) {
        res.status(400).json({ message: "User details not found in session" });
        // throw new Error("User details not found in session")
        return;
    }
    console.log(sessionData);
    (0, sendVerifyEmail_1.default)(req, userDetails.userName, userDetails.email);
    res.status(200).json({ message: "OTP sent for verification", email });
}));
// forgot password
exports.forgotPasswordController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    const user = yield userModel_1.default.findOne({ email });
    if (user === null || user === void 0 ? void 0 : user.isGoogle) {
        res.status(400).json({ message: "SignIn with google or Create account" });
        return;
    }
    if (user) {
        const otp = speakeasy_1.default.totp({
            secret: speakeasy_1.default.generateSecret({ length: 20 }).base32,
            digits: 4,
        });
        // console.log("req session",req.session);
        const sessionData = req.session;
        sessionData.otp = otp;
        sessionData.otpGeneratedTime = Date.now();
        sessionData.email = email;
        console.log("sessiondata in forgotPasswordController", sessionData);
        (0, sendVerifyEmail_1.default)(req, user.userName, user.email);
        res.status(200).json({ message: `OTP has been send to your email`, email });
    }
    else {
        res.status(400).json({ message: "User not found" });
        // throw new Error("Not User Found");
    }
}));
// forgot password otp verification
exports.forgotOtpController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { otp } = req.body;
    console.log("otp verification ", otp);
    if (!otp) {
        res.status(400).json({ message: "Please provide OTP" });
        return;
        // throw new Error("Please provide OTP");
    }
    const sessionData = req.session;
    const storedOTP = sessionData.otp;
    console.log("stored otp", storedOTP);
    if (!storedOTP || otp !== storedOTP) {
        res.status(400).json({ message: "Invalid OTP" });
        return;
        // throw new Error("Invalid OTP")
    }
    const otpGeneratedTime = sessionData.otpGeneratedTime || 0;
    const currentTime = Date.now();
    const otpExpirationTime = 60 * 1000;
    if (currentTime - otpGeneratedTime > otpExpirationTime) {
        res.status(400).json({ message: "OTP has expired" });
        return;
        // throw new Error("OTP has expired");
    }
    delete sessionData.otp;
    delete sessionData.otpGeneratedTime;
    // console.log("sessiondata in forgotOtpController", sessionData);
    res.status(200).json({ message: "OTP has been verified. Please reset password",
        email: sessionData === null || sessionData === void 0 ? void 0 : sessionData.email,
    });
}));
// reset password
exports.resetPasswordController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { password, confirmPassword } = req.body;
    const sessionData = req.session;
    console.log("sessiondata in resetPasswordController", sessionData);
    if (!sessionData || !sessionData.email) {
        res.status(400).json({ message: "No session data found in session" });
        return;
    }
    if (password !== confirmPassword) {
        res.status(400).json({ message: "Password do not match" });
        return;
    }
    const user = yield userModel_1.default.findOne({ email: sessionData.email });
    if (!user) {
        res.status(400).json({ message: "User not found" });
        return;
    }
    const salt = yield bcrypt_1.default.genSalt(10);
    const hashedPassword = yield bcrypt_1.default.hash(password, salt);
    user ? user.password = hashedPassword : null;
    yield (user === null || user === void 0 ? void 0 : user.save());
    res.status(200).json({ message: "Password has been reset successfully" });
}));
// Login user
exports.userLoginController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    console.log("email: ", email, "Password: ", password);
    const user = yield userModel_1.default.findOne({ email });
    if (user && typeof user.password === 'string' && (yield bcrypt_1.default.compare(password, user.password))) {
        res.status(200).json({
            message: "Login succussfull",
            _id: user.id,
            userName: user.userName,
            name: user.name,
            bio: user.bio,
            email: user.email,
            profileImg: user.profileImg,
            token: (0, generateToken_1.default)(user.id)
        });
    }
    else {
        res.status(400).json({ message: "invalid credentails" });
        // throw new Error("Invalid credentails");
    }
}));
// Google authentication
exports.googleAuthController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userName, email, profileImg } = req.body.userData;
    console.log("request body", req.body);
    console.log("user datas ", userName, email, profileImg);
    try {
        const userExist = yield userModel_1.default.findOne({ email });
        if (userExist) {
            if (userExist.isBlocked) {
                res.status(400).json({ message: "User is blocked" });
                return;
            }
            if (userExist.isGoogle) {
                res.json({
                    message: "Login succussfull",
                    _id: userExist.id,
                    userName: userExist.userName,
                    email: userExist.email,
                    name: userExist.name,
                    profileImg: userExist.profileImg,
                    bio: userExist.bio,
                    phone: userExist.phone,
                    token: (0, generateToken_1.default)(userExist.id)
                });
                return;
            }
            else {
                res.status(400).json({ message: "User already Exist with this email" });
            }
        }
        const randomPassword = Math.random().toString(36).slice(-8);
        const hashedPassword = yield bcrypt_1.default.hash(randomPassword, 10);
        const newUser = yield userModel_1.default.create({
            userName: userName,
            email: email,
            password: hashedPassword,
            profileImg: profileImg,
            isGoogle: true,
        });
        yield connectionModel_1.default.create({
            userId: newUser._id
        });
        const token = (0, generateToken_1.default)(newUser._id);
        res.status(200).json({
            message: "Login succussfull",
            _id: newUser.id,
            userName: newUser.userName,
            email: newUser.email,
            name: newUser.name,
            profileImg: newUser.profileImg,
            bio: newUser.bio,
            phone: newUser.phone,
            token: token,
        });
    }
    catch (error) {
        console.error("Error in Google authentication:", error);
        res.status(500).json({ message: "Server error" });
    }
}));
// Edit profile
exports.editProfileController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, image, userName, name, phone, bio, gender } = req.body;
        const user = yield userModel_1.default.findOne({ userId });
        if (!user) {
            res.status(400).json({ message: "User not found" });
            return;
        }
        const userExist = yield userModel_1.default.findOne({ userName });
        if (userExist && userExist._id !== userId) {
            res.status(400).json({ message: "Username taken" });
            return;
        }
        if (userName)
            user.userName = userName;
        if (name)
            user.name = name;
        if (image)
            user.profileImg = image;
        if (phone)
            user.phone = phone;
        if (bio)
            user.bio = bio;
        if (gender)
            user.gender = gender;
        yield user.save();
        res.status(200).json({
            _id: user.id,
            userName: user.userName,
            name: user.name,
            email: user.email,
            profileImg: user.profileImg,
            bio: user.bio,
            phone: user.phone,
            token: (0, generateToken_1.default)(user.id),
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}));
