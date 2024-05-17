"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const generateAdminToken = (id) => {
    console.log("admin id", id);
    return jsonwebtoken_1.default.sign({ id, role: "admin" }, process.env.JWT_SECRET_KEY, {
        expiresIn: '30d',
    });
};
exports.default = generateAdminToken;
