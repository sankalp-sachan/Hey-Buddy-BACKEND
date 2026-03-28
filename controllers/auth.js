import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import Joi from 'joi';

// @desc    Register user
// @route   POST /api/auth/register
export const register = async (req, res, next) => {
  const schema = Joi.object({
    username: Joi.string().min(3).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    avatar: Joi.string().optional(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    res.status(400);
    return next(new Error(error.details[0].message));
  }

  const { username, email, password, avatar } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      return next(new Error('User already exists'));
    }

    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
      res.status(400);
      return next(new Error('Username already taken'));
    }

    const user = await User.create({ username, email, password, avatar });

    if (user) {
      generateToken(res, user._id);
      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
      });
    } else {
      res.status(400);
      return next(new Error('Invalid user data'));
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
export const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select('+password');
    if (user && (await user.comparePassword(password))) {
      generateToken(res, user._id);
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
      });
    } else {
      res.status(401);
      return next(new Error('Invalid email or password'));
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
export const logout = (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: 'Logged out successfully' });
};

// @desc    Get user profile (protected)
// @route   GET /api/auth/profile
export const getProfile = async (req, res) => {
  const user = {
    _id: req.user._id,
    username: req.user.username,
    email: req.user.email,
    avatar: req.user.avatar,
  };
  res.status(200).json(user);
};
