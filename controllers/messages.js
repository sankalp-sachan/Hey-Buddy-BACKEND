import Message from '../models/Message.js';
import User from '../models/User.js';
import Chat from '../models/Chat.js';

// @desc    Get all messages for a chat
export const getMessages = async (req, res, next) => {
  try {
    const messages = await Message.find({ chatId: req.params.chatId })
      .populate('senderId', 'username avatar email')
      .populate('chatId');
    res.json(messages);
  } catch (error) {
    next(error);
  }
};

// @desc    Send a message
export const sendMessage = async (req, res, next) => {
  const { text, chatId } = req.body;

  if (!chatId || (!text && !req.body.media)) {
    res.status(400);
    return next(new Error('Invalid data passed into request'));
  }

  const newMessage = {
    senderId: req.user._id,
    text: text,
    chatId: chatId,
    media: req.body.media || [],
  };

  try {
    let message = await Message.create(newMessage);

    message = await message.populate('senderId', 'username avatar');
    message = await message.populate('chatId');
    message = await User.populate(message, {
      path: 'chatId.participants',
      select: 'username avatar email',
    });

    await Chat.findByIdAndUpdate(req.body.chatId, { lastMessage: message });

    res.json(message);
  } catch (error) {
    next(error);
  }
};

// @desc    Edit a message
export const editMessage = async (req, res, next) => {
  const { messageId, text } = req.body;
  try {
    const message = await Message.findById(messageId);
    if (message.senderId.toString() !== req.user._id.toString()) {
      res.status(403);
      return next(new Error('Unauthorized to edit this message'));
    }
    message.text = text;
    await message.save();
    res.json(message);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a message
export const deleteMessage = async (req, res, next) => {
  try {
    const message = await Message.findById(req.params.messageId);
    if (message.senderId.toString() !== req.user._id.toString()) {
      res.status(403);
      return next(new Error('Unauthorized to delete this message'));
    }
    await message.delete();
    res.json({ message: 'Message deleted' });
  } catch (error) {
    next(error);
  }
};
// @desc    Clear all messages for a chat
export const clearMessages = async (req, res, next) => {
  try {
    const chat = await Chat.findById(req.params.chatId);
    if (!chat.participants.includes(req.user._id)) {
      res.status(403);
      return next(new Error('Unauthorized to clear this chat'));
    }
    await Message.deleteMany({ chatId: req.params.chatId });
    await Chat.findByIdAndUpdate(req.params.chatId, { lastMessage: null });
    res.json({ message: 'Chat cleared' });
  } catch (error) {
    next(error);
  }
};
