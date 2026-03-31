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
  const { text, chatId, media } = req.body;

  if (!chatId || (!text && !media)) {
    res.status(400);
    return next(new Error('Invalid data passed into request'));
  }

  try {
    const newMessage = {
      senderId: req.user._id,
      text: text,
      chatId: chatId,
      media: media || [],
    };

    let message = await Message.create(newMessage);

    message = await message.populate('senderId', 'username avatar email');
    message = await message.populate('chatId');
    message = await User.populate(message, {
      path: 'chatId.participants',
      select: 'username avatar email',
    });

    // Update lastMessage in Chat
    await Chat.findByIdAndUpdate(chatId, { lastMessage: message._id });

    res.json(message);
  } catch (error) {
    next(error);
  }
};

// @desc    Edit a message (DISABLED)
export const editMessage = async (req, res, next) => {
  res.json({ message: 'Editing is now local-only' });
};

// @desc    Delete a message
export const deleteMessage = async (req, res, next) => {
  res.json({ message: 'Delete messages from your local history' });
};

// @desc    Clear all messages for a chat
export const clearMessages = async (req, res, next) => {
  res.json({ message: 'Clear messages from your local history' });
};

// @desc    Mark media as opened (DISABLED: Handled locally)
export const openMedia = async (req, res, next) => {
  res.json({ message: 'Media view status is now local' });
};
