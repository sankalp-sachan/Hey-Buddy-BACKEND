import { Response, NextFunction } from "express";
import Message from "../models/Message";
import Chat from "../models/Chat";
import { IAuthRequest } from "../middlewares/auth";

export const sendMessage = async (req: IAuthRequest, res: Response, next: NextFunction) => {
  try {
    const { chatId, text, media, replyTo } = req.body;
    const senderId = req.user?.id as string;

    if (!chatId || (!text && (!media || media.length === 0))) {
      return res.status(400).json({ success: false, message: "Invalid message data" });
    }

    const message = await Message.create({
      chatId,
      senderId,
      text,
      media,
      replyTo,
    });

    const populatedMessage = await message.populate([
      { path: "senderId", select: "username email avatar" },
      { path: "replyTo" },
    ]);

    // Update last message in Chat model
    await Chat.findByIdAndUpdate(chatId, {
      lastMessage: {
        text: text || "Media sent",
        senderId,
        createdAt: new Date(),
      },
      updatedAt: new Date(),
    });

    res.status(201).json({ success: true, message: populatedMessage });
  } catch (error) {
    next(error);
  }
};

export const getMessagesByChatId = async (req: IAuthRequest, res: Response, next: NextFunction) => {
  try {
    const { chatId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const messages = await Message.find({ chatId })
      .populate("senderId", "username email avatar")
      .populate("replyTo")
      .sort({ createdAt: -1 }) // Get latest first for pagination
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      messages: messages.reverse(), // Back to chronological order
    });
  } catch (error) {
    next(error);
  }
};

export const editMessage = async (req: IAuthRequest, res: Response, next: NextFunction) => {
  try {
    const { messageId } = req.params;
    const { text } = req.body;
    const senderId = req.user?.id as string;

    const message = await Message.findOneAndUpdate(
      { _id: messageId, senderId },
      { text, isEdited: true },
      { new: true }
    ).populate("senderId", "username email avatar");

    if (!message) {
      return res.status(404).json({ success: false, message: "Message not found or unauthorized" });
    }

    res.status(200).json({ success: true, message });
  } catch (error) {
    next(error);
  }
};

export const deleteMessage = async (req: IAuthRequest, res: Response, next: NextFunction) => {
  try {
    const { messageId } = req.params;
    const senderId = req.user?.id as string;

    const message = await Message.findOneAndUpdate(
      { _id: messageId, senderId },
      { text: "This message was deleted", isDeleted: true, media: [] },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({ success: false, message: "Message not found or unauthorized" });
    }

    res.status(200).json({ success: true, message });
  } catch (error) {
    next(error);
  }
};
