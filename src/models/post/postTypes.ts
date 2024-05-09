import { Document, Schema, Types } from "mongoose"

interface PostInterface extends Document {
  userId: Types.ObjectId;
  imgUrl: string[];
  title: string;
  description: string;
  date: Date;
  likes: Types.ObjectId[];
  comments: Types.ObjectId[];
  isHidden: boolean;
  isBlocked: boolean;
  hideComment: boolean;  
  hideLikes: boolean;
  isDeleted: boolean;
}

export default PostInterface;