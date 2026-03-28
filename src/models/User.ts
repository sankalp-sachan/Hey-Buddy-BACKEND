import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  username: string;
  email: string;
  phoneNumber?: string;
  avatar?: string;
  status: "online" | "offline";
  lastSeen: Date;
  googleId?: string;
  password?: string;
  fcmToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phoneNumber: {
    type: String,
    sparse: true,
    unique: true,
  },
  avatar: {
    type: String,
    default: "",
  },
  status: {
    type: String,
    enum: ["online", "offline"],
    default: "offline",
  },
  lastSeen: {
    type: Date,
    default: Date.now,
  },
  googleId: {
    type: String,
    sparse: true,
    unique: true,
  },
  password: {
    type: String,
    minlength: 6,
  },
  fcmToken: {
    type: String,
    default: "",
  },
}, { timestamps: true });

export default mongoose.model<IUser>("User", UserSchema);
