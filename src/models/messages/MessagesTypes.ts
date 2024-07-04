import { Document, Types } from "mongoose";

export interface MessageDocument {
  conversationId: string;
  sender: Types.ObjectId;
  text: string;
  attachment: {
    type: string;
    url: string;
    filename: string;
    size: number;
  };
  isRead: boolean;
  isDeleted: boolean;
  sharedPost?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export default MessageDocument 