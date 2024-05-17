"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_session_1 = __importDefault(require("express-session"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const db_1 = __importDefault(require("./config/db"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
const postRoutes_1 = __importDefault(require("./routes/postRoutes"));
const errorMiddleware_1 = __importDefault(require("./middlewares/errorMiddleware"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const sessionSecret = process.env.SESSION_SECRET || "default_secret_key";
app.use((0, express_session_1.default)({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000,
    }
}));
app.use((0, cors_1.default)({
    origin: "http://localhost:5173",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
}));
app.use(errorMiddleware_1.default);
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use("/api/", userRoutes_1.default);
app.use("/api/admin", adminRoutes_1.default);
app.use("/api/post", postRoutes_1.default);
const PORT = process.env.PORT || 3000;
(0, db_1.default)();
app.listen(PORT, () => {
    // console.log(`server starts running at http://localhost:${PORT}`);
    console.log(`server starts running at \x1b[36mhttp://localhost:${PORT}\x1b[0m`);
});
