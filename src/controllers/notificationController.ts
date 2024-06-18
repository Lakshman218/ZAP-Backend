import { Request, Response } from 'express';
import asyncHandler from "express-async-handler";
import Notification from '../models/notifications/notificationModel';
import Connections from '../models/connections/connectionModel';

export const getNotifications = asyncHandler(
  async(req: Request, res: Response):Promise<void> => {
    try {
      const userId = req.body.userId
      console.log("userId", userId);
      const notifications = await Notification.find({receiverId: userId})
      .populate({
        path: 'senderId',
        select: 'userName name profileImg',
      })
      .sort({createdAt: -1})
      console.log("notifications", notifications);
      res.status(200).json({ notifications: notifications })
    } catch (error) {
      console.error('Error fetching notifications:', error);
      res.status(500).json({ message: 'Error fetching notifications' });
    }
  }
)