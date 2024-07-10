"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const adminController_1 = require("../controllers/adminController");
router.post("/login", adminController_1.LoginController);
router.get("/get-users", adminController_1.getUsersController);
router.post("/user-block", adminController_1.userBlockController);
router.get("/get-posts", adminController_1.getPostsController);
router.post("/post-block", adminController_1.postBlockController);
router.get("/get-reports", adminController_1.getPostReports);
router.get("/get-details", adminController_1.getDashboardDetails);
router.get("/chart-data", adminController_1.chartDataController);
exports.default = router;
