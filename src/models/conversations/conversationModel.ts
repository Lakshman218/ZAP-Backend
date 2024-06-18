import { Model, Schema, model } from "mongoose";
import { ConversationDocument } from "./conversationTypes";

const ConversationSchema = new Schema<ConversationDocument>(
  {
    members: {
      type: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
      }],
      required: true,
    },
    isGroup: {
      type: Boolean,
      default: false
    }
  },
  {timestamps: true}
)

const Conversation = model<ConversationDocument>("Conversation", ConversationSchema)
export default Conversation

