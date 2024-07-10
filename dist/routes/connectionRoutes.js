"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const connectionController_1 = require("../controllers/connectionController");
router.post('/get-connection', connectionController_1.getConnectionController);
router.post('/follow', connectionController_1.followUserController);
router.post('/unfollow', connectionController_1.unFollowUserController);
router.post('/accept-request', connectionController_1.acceptRequestController);
router.post('/reject-request', connectionController_1.rejectRequestController);
router.post('/get-requested-users', connectionController_1.getFollowRequestsController);
exports.default = router;
