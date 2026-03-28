import Chat from '../models/Chat.js';
import User from '../models/User.js';

// @desc    Access or create a 1-to-1 chat
export const accessChat = async (req, res, next) => {
  const { userId } = req.body;

  if (!userId) {
    res.status(400);
    return next(new Error('UserId param not sent with request'));
  }

  try {
    let isChat = await Chat.find({
      isGroup: false,
      $and: [
        { participants: { $elemMatch: { $eq: req.user._id } } },
        { participants: { $elemMatch: { $eq: userId } } },
      ],
    })
      .populate('participants', '-password')
      .populate('lastMessage');

    isChat = await User.populate(isChat, {
      path: 'lastMessage.senderId',
      select: 'username avatar email',
    });

    if (isChat.length > 0) {
      res.send(isChat[0]);
    } else {
      const chatData = {
        groupName: 'sender',
        isGroup: false,
        participants: [req.user._id, userId],
      };

      const createdChat = await Chat.create(chatData);
      const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        'participants',
        '-password'
      );
      res.status(200).json(FullChat);
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get all chats for a user
export const fetchChats = async (req, res, next) => {
  try {
    let chats = await Chat.find({ participants: { $elemMatch: { $eq: req.user._id } } })
      .populate('participants', '-password')
      .populate('adminIds', '-password')
      .populate('lastMessage')
      .sort({ updatedAt: -1 });

    chats = await User.populate(chats, {
      path: 'lastMessage.senderId',
      select: 'username avatar email',
    });

    res.status(200).json(chats);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a group chat
export const createGroupChat = async (req, res, next) => {
  if (!req.body.users || !req.body.name) {
    res.status(400);
    return next(new Error('Please fill all the fields'));
  }

  let users = JSON.parse(req.body.users);

  if (users.length < 2) {
    res.status(400);
    return next(new Error('More than 2 users are required to form a group chat'));
  }

  users.push(req.user);

  try {
    const groupChat = await Chat.create({
      groupName: req.body.name,
      participants: users,
      isGroup: true,
      adminIds: [req.user],
    });

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate('participants', '-password')
      .populate('adminIds', '-password');

    res.status(200).json(fullGroupChat);
  } catch (error) {
    next(error);
  }
};

// @desc    Rename a group
export const renameGroup = async (req, res, next) => {
  const { chatId, groupName } = req.body;

  try {
    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      { groupName },
      { new: true }
    )
      .populate('participants', '-password')
      .populate('adminIds', '-password');

    if (!updatedChat) {
      res.status(404);
      return next(new Error('Chat not found'));
    } else {
      res.json(updatedChat);
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Add member to group
export const addToGroup = async (req, res, next) => {
  const { chatId, userId } = req.body;

  try {
    const added = await Chat.findByIdAndUpdate(
      chatId,
      { $push: { participants: userId } },
      { new: true }
    )
      .populate('participants', '-password')
      .populate('adminIds', '-password');

    if (!added) {
      res.status(404);
      return next(new Error('Chat not found'));
    } else {
      res.json(added);
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Remove member from group
export const removeFromGroup = async (req, res, next) => {
  const { chatId, userId } = req.body;

  try {
    const removed = await Chat.findByIdAndUpdate(
      chatId,
      { $pull: { participants: userId } },
      { new: true }
    )
      .populate('participants', '-password')
      .populate('adminIds', '-password');

    if (!removed) {
      res.status(404);
      return next(new Error('Chat not found'));
    } else {
      res.json(removed);
    }
  } catch (error) {
    next(error);
  }
};
// @desc    Delete a chat
export const deleteChat = async (req, res, next) => {
  try {
    const chat = await Chat.findById(req.params.id);
    if (!chat.participants.includes(req.user._id)) {
      res.status(403);
      return next(new Error('Unauthorized to delete this chat'));
    }
    await Message.deleteMany({ chatId: req.params.id });
    await Chat.findByIdAndDelete(req.params.id);
    res.json({ message: 'Chat deleted' });
  } catch (error) {
    next(error);
  }
};
