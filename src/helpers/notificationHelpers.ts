import { Types } from "mongoose";
import Notification from "../models/notifications/notificationModel";
import { NotificationInterface } from "../models/notifications/notificationTypes";

interface NotificationArgs {
  senderId: Types.ObjectId|undefined|any;
  receiverId: Types.ObjectId|undefined|any;
  message: string|any;
  link: string|any;
  postId?: Types.ObjectId|undefined|any;
  read?: boolean;
  isDeleted?: boolean;
}

export const createNotification = async(args: NotificationArgs) : Promise<NotificationInterface> => {
  try {
    const {
      senderId,
      receiverId,
      message,
      link,
      postId,
      read,
      isDeleted,
    } = args

    const newNotification = new Notification({
      senderId,
      receiverId,
      message,
      link,
      postId,
      read,
      isDeleted,
    })

    const savedNotification = await newNotification.save()
    return savedNotification
  } catch (error) {
    throw new Error('Error creating notification');
  }
}
