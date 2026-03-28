import { Request, Response, NextFunction } from "express";
import User from "../models/User";
import * as authService from "../services/authService";
import jwt from "jsonwebtoken";

export const signup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, email, password, phoneNumber } = req.body;

    const userExists = await User.findOne({ $or: [{ username }, { email }, { phoneNumber }] });
    if (userExists) {
      return res.status(400).json({ success: false, message: "User with this username, email or phone already exists" });
    }

    const hashedPassword = await authService.hashPassword(password);
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      phoneNumber,
    });

    const token = authService.generateToken({ id: user._id.toString(), email: user.email, username: user.username });
    const refreshToken = authService.generateRefreshToken({ id: user._id.toString() });

    res.cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === "production", maxAge: 30 * 24 * 60 * 60 * 1000 });

    res.status(201).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        phoneNumber: user.phoneNumber,
        avatar: user.avatar,
      },
      token,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !user.password) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const isMatch = await authService.comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const token = authService.generateToken({ id: user._id.toString(), email: user.email, username: user.username });
    const refreshToken = authService.generateRefreshToken({ id: user._id.toString() });

    res.cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === "production", maxAge: 30 * 24 * 60 * 60 * 1000 });

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        phoneNumber: user.phoneNumber,
        avatar: user.avatar,
      },
      token,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
};

export const logout = (req: Request, res: Response) => {
  res.clearCookie("token");
  res.clearCookie("refreshToken");
  res.status(200).json({ success: true, message: "Logged out successfully" });
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ success: false, message: "Refresh token is required" });
    }

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET as string) as { id: string };
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    const token = authService.generateToken({ id: user._id.toString(), email: user.email, username: user.username });
    res.cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", maxAge: 7 * 24 * 60 * 60 * 1000 });

    res.status(200).json({ success: true, token });
  } catch (error) {
    res.status(401).json({ success: false, message: "Invalid refresh token" });
  }
};
