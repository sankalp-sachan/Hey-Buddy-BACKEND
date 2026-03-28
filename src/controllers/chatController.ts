import { Response, NextFunction } from "express";
import Chat from "../models/Chat";
import { IAuthRequest } from "../middlewares/auth";
import mongoose from "mongoose";

export const createOrGetChat = async (req: IAuthRequest, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.body;
    const currentUserId = req.user?.id as string;

    if (!userId) {
      return res.status(400).json({ success: false, message: "UserId param is required" });
    }

    // Check if 1-to-1 chat already exists
    let chat = await Chat.findOne({
      isGroup: false,
      participants: { $all: [currentUserId, userId] },
    }).populate("participants", "-password");

    if (!chat) {
      chat = await Chat.create({
        participants: [currentUserId, userId],
        isGroup: false,
      });
      chat = await chat.populate("participants", "-password");
    }

    res.status(200).json({ success: true, chat });
  } catch (error) {
    next(error);
  }
};

export const createGroupChat = async (req: IAuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, participants } = req.body;
    const currentUserId = req.user?.id as string;

    if (!name || !participants || participants.length < 1) {
      return res.status(400).json({ success: false, message: "Group name and participants are required" });
    }

    const groupParticipants = [...participants, currentUserId];

    const chat = await Chat.create({
      groupName: name,
      participants: groupParticipants,
      isGroup: true,
      adminIds: [currentUserId],
    });

    const fullChat = await Chat.findById(chat._id).populate("participants", "-password");

    res.status(201).json({ success: true, chat: fullChat });
  } catch (error) {
    next(error);
  }
};

export const getMyChats = async (req: IAuthRequest, res: Response, next: NextFunction) => {
  try {
    const currentUserId = req.user?.id as string;

    const chats = await Chat.find({
      participants: { $in: [currentUserId] },
    })
      .populate("participants", "-password")
      .populate("adminIds", "-password")
      .sort({ updatedAt: -1 });

    res.status(200).json({ success: true, chats });
  } catch (error) {
    next(error);
  }
};
