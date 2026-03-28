import { Request, Response, NextFunction } from "express";
import User from "../models/User";
import { IAuthRequest } from "../middlewares/auth";

export const searchUsers = async (req: IAuthRequest, res: Response, next: NextFunction) => {
  try {
    const { search } = req.query;
    const currentUserId = req.user?.id as string;

    const users = await User.find({
      $and: [
        {
          $or: [
            { username: { $regex: search as string, $options: "i" } },
            { email: { $regex: search as string, $options: "i" } },
          ],
        },
        { _id: { $ne: currentUserId } },
      ],
    }).select("username email avatar status lastSeen");

    res.status(200).json({ success: true, users });
  } catch (error) {
    next(error);
  }
};

export const updateUserProfile = async (req: IAuthRequest, res: Response, next: NextFunction) => {
  try {
    const { username, avatar } = req.body;
    const userId = req.user?.id as string;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { username, avatar },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, user: updatedUser });
  } catch (error) {
    next(error);
  }
};

export const getMyProfile = async (req: IAuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id as string;
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};
export const syncContacts = async (req: IAuthRequest, res: Response, next: NextFunction) => {
  try {
    const { contacts } = req.body; // Array of strings (phone numbers)
    const currentUserId = req.user?.id as string;

    if (!contacts || !Array.isArray(contacts)) {
      return res.status(400).json({ success: false, message: "Contacts must be an array" });
    }

    const matchedUsers = await User.find({
      $and: [
        { phoneNumber: { $in: contacts } },
        { _id: { $ne: currentUserId } }
      ]
    }).select("username phoneNumber avatar status lastSeen");

    res.status(200).json({ success: true, users: matchedUsers });
  } catch (error) {
    next(error);
  }
};
