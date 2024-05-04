import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import Admin from "../models/admin/adminModel";
import generateAdminToken from "../utils/generateAdminToken";

export const LoginController = asyncHandler(
  async(req: Request, res: Response) => {
    const {email, password} = req.body
    const admin = await Admin.findOne({email})
    // console.log("email & password", email, password);
   if(admin && password == admin.password) {
    res.status(200).json({
      message: "Login Succussfull",
      _id: admin.id,
      name: admin.name,
      email: admin.email,
      profileImg: admin.profileImg,
      token: generateAdminToken(admin.id),
    })
   } else {
    res.status(400).json({message: "Invalid Credentails"});
   }
  }
)