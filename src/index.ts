import express, { Express } from 'express';
import sesssion, {
  SessionOptions,
  MemoryStore,
  SessionData,
} from "express-session"
import dotenv from "dotenv";
import http from "http";
import cors from "cors"
import connectDB from './config/db';
import userRoutes from './routes/userRoutes'
import adminRoutes from './routes/adminRoutes'
import postRoutes from './routes/postRoutes'
import chatRoutes from './routes/chatRoutes'
import connectionRoutes from './routes/connectionRoutes'
import errorHandler from './middlewares/errorMiddleware';
import { Server, Socket } from 'socket.io';
import socketIo_Config from './utils/socket/socket';

dotenv.config()

const app : Express =  express()
declare module "express-session" {
  interface Session {
    userDetails?: {userName: string; email: string; password: string}
    otp?: string;
    otpGeneratedTime?: number;
    email: string;
    userId: string;
  }
}

app.use(cors({
  origin: "http://localhost:5173",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
}))

app.use(express.json());
app.use(express.urlencoded({extended: true}));

const sessionSecret = process.env.SESSION_SECRET || "default_secret_key";
app.use(sesssion({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000,
  }
}))

connectDB()
const PORT = process.env.PORT || 3000

const server = http.createServer(app)
const io: Server = new Server(server, {
  cors: { origin: "*" },
})

socketIo_Config(io)

app.use("/api/", userRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api/post", postRoutes)
app.use("/api/connection", connectionRoutes)
app.use("/api/chat", chatRoutes)
app.use(errorHandler)

server.listen(PORT, () => {
  // console.log(`server starts running at http://localhost:${PORT}`);
  console.log(`server starts running at \x1b[36mhttp://localhost:${PORT}\x1b[0m`);
})