import { Schema, model } from "mongoose";
import { NotificationInterface } from "./notificationTypes";

const notificationSchema = new Schema<NotificationInterface>({
  senderId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  receiverId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  postId: {
    type: Schema.Types.ObjectId,
    ref: 'Post',
  },
  message: {
    type: String,
    required: true,
  },
  link: {
    type: String,
    required: true,
  },
  read: {
    type: Boolean,
    default: false,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
},
{ timestamps: true}
)

const Notification = model<NotificationInterface>('Notification', notificationSchema)
export default Notification;