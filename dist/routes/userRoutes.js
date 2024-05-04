"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.router();
const userController_1 = require("../controllers/userController");
router.post("/register", userController_1.userRegister);
router.post("/login", userController_1.userLogin);
exports.default = router;
