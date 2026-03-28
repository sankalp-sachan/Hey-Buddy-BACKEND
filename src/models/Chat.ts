import mongoose, { Schema, Document } from "mongoose";

export interface IChat extends Document {
  participants: mongoose.Types.ObjectId[];
  isGroup: boolean;
  groupName?: string;
  groupAvatar?: string;
  adminIds: mongoose.Types.ObjectId[];
  lastMessage?: mongoose.Types.ObjectId | { text: string; senderId: string; createdAt: Date };
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ChatSchema: Schema = new Schema({
  participants: [{
    type: Schema.Types.ObjectId,
    ref: "User",
  }],
  isGroup: {
    type: Boolean,
    default: false,
  },
  groupName: {
    type: String,
    default: "",
  },
  groupAvatar: {
    type: String,
    default: "",
  },
  adminIds: [{
    type: Schema.Types.ObjectId,
    ref: "User",
  }],
  lastMessage: {
    type: Schema.Types.Mixed, // Simplified, will be updated during runtime
  },
  isArchived: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

export default mongoose.model<IChat>("Chat", ChatSchema);
