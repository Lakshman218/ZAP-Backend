import {Schema, Document, Types} from 'mongoose'

export interface ReplyCommentInterface {
  userId: Schema.Types.ObjectId | string
  replyComment: string;
  isReplyDeleted?: boolean;
  timestamp: Date;
}

export interface CommentInterface extends Document {
  postId: Types.ObjectId;
  userId: Types.ObjectId;
  comment: string;
  isDeleted: boolean;
  timestamp: Date;
  replyComments: ReplyCommentInterface[];
}