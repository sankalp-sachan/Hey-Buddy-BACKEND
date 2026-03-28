import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  chatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
    required: true,
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  text: {
    type: String,
    trim: true,
  },
  media: [{
    content: String, // Base64 data
    fileName: String,
    type: {
      type: String,
      enum: ['image', 'video', 'file', 'audio'],
    },
    size: Number,
    viewOnce: { type: Boolean, default: false },
    opened: { type: Boolean, default: false },
  }],
  status: {
    type: String,
    enum: ['sent', 'delivered', 'seen'],
    default: 'sent',
  },
  reactions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    emoji: String,
  }],
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
  },
}, { timestamps: true });

const Message = mongoose.model('Message', messageSchema);
export default Message;
