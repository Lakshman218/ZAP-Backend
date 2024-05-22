import { Schema, model } from "mongoose";
import ReportInterface from "./reportTypes";

const ReportSchema =  new Schema<ReportInterface>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  postId: {
    type: Schema.Types.ObjectId,
    ref: 'Post',
    required: true
  },
  reason: {
    type: String,
    required: true
  },
},{timestamps: true})

const Report = model<ReportInterface>('Report', ReportSchema);
export default Report
