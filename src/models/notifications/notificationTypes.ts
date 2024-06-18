import { Document, Schema, Types } from "mongoose";

export interface NotificationInterface extends Document {
  senderId: Types.ObjectId;
  receiverId: Types.ObjectId;
  postId?: Types.ObjectId;
  message: string;
  link: string;
  read: boolean;
  isDeleted: boolean;
  createdAt: Date;
}
