import { Document, Types } from "mongoose";

interface ConnectionInterface extends Document {
  userId: Types.ObjectId;
  followers: Types.ObjectId[];
  following: Types.ObjectId[];
  requested: Types.ObjectId[];
  requestSent:  Types.ObjectId[];
}

export default ConnectionInterface 