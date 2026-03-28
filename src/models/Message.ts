import mongoose, { Schema, Document } from "mongoose";

export interface IMessage extends Document {
  chatId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  text?: string;
  media?: {
    url: string;
    type: "image" | "video" | "audio" | "document";
    name: string;
  }[];
  status: "sent" | "delivered" | "seen";
  reactions: {
    userId: mongoose.Types.ObjectId;
    emoji: string;
  }[];
  replyTo?: mongoose.Types.ObjectId;
  isDeleted: boolean;
  isEdited: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema: Schema = new Schema({
  chatId: {
    type: Schema.Types.ObjectId,
    ref: "Chat",
    required: true,
  },
  senderId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  text: {
    type: String,
    default: "",
  },
  media: [{
    url: { type: String, required: true },
    type: { type: String, enum: ["image", "video", "audio", "document"], required: true },
    name: { type: String, default: "" },
  }],
  status: {
    type: String,
    enum: ["sent", "delivered", "seen"],
    default: "sent",
  },
  reactions: [{
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    emoji: { type: String },
  }],
  replyTo: {
    type: Schema.Types.ObjectId,
    ref: "Message",
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  isEdited: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

export default mongoose.model<IMessage>("Message", MessageSchema);
