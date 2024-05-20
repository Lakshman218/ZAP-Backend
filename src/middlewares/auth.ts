import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import { Request, Response, NextFunction } from "express";
import User from "../models/user/userModel";

interface RequestWithToken extends Request {
  token?: string
  user?: any;
}

const protect = asyncHandler(
  async(req: RequestWithToken, res: Response, next: NextFunction) => {
    let token
    if(
      req.headers.authorization && req.headers.authorization.startsWith("Bearer") 
    ) {
      try {
        token = req.headers.authorization.split(" ")[1]
        req.token = token
        const decoded: any = jwt.verify(
          token,
          process.env.JWT_SECRET_KEY as string
        )

        if(decoded.role !== 'user') {
          res.status(401).json({message: "Not authorized"})
          return
        }
        req.user = await User.findById(decoded.id).select("-password")
        if(req.user.isBlocked) {
          res.status(401)
          throw new Error("User Is Blocked");
        }
        next()
      } catch (error) {
        console.log(error);
        res.status(401).json({message: "Not authorized"})
        return
      }
    }
    if(!token) {
      res.status(401).json({message: "Not authorized"})
      return
    }
  }
)

export {protect}