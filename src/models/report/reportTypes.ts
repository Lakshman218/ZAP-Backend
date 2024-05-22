import { Document, Schema, Types } from "mongoose";

interface ReportInterface extends Document {
  userId:  Types.ObjectId;
  postId: Types.ObjectId;
  reason: string;
}

export default ReportInterface