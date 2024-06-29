import { Document, Types } from "mongoose";

export enum Gender {
  Male = 'Male',
  Female = 'Female',
  Other = 'Other',
}

interface UserInterface extends Document {
  userName: string;
  name: string;
  email: string;
  phone?: string;
  password: string;
  profileImg?: string;
  bio?: string;
  gender?: string;
  savedPost: Types.ObjectId[];
  isBlocked: boolean;
  isDeleted: boolean;
  isOnline: boolean;
  isGoogle: boolean;
  isPrivate: boolean;
  isVerified:boolean;
  premiumExpiryDate:Date;
}

export default UserInterface