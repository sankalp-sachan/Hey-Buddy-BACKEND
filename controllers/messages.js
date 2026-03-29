import Message from '../models/Message.js';
import User from '../models/User.js';
import Chat from '../models/Chat.js';

// @desc    Get all messages for a chat (DISABLED: Now using local storage)
export const getMessages = async (req, res, next) => {
  try {
    // Return empty array as messages are stored locally
    res.json([]);
  } catch (error) {
    next(error);
  }
};

// @desc    Send a message (Relay only, no storage)
export const sendMessage = async (req, res, next) => {
  const { text, chatId, media } = req.body;

  if (!chatId || (!text && !media)) {
    res.status(400);
    return next(new Error('Invalid data passed into request'));
  }

  // Just return the populated structure - NOT saving to DB
  try {
    const user = await User.findById(req.user._id).select('username avatar email');
    
    const message = {
      _id: `server_relay_${Date.now()}`,
      senderId: user,
      text: text,
      chatId: { _id: chatId },
      media: media || [],
      createdAt: new Date(),
    };

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
