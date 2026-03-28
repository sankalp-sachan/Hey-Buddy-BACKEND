import User from '../models/User.js';

// @desc    Get all users / search
export const getUsers = async (req, res, next) => {
  const keyword = req.query.search
    ? {
        $or: [
          { username: { $regex: req.query.search, $options: 'i' } },
          { email: { $regex: req.query.search, $options: 'i' } },
        ],
      }
    : {};

  try {
    const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
    res.json(users);
  } catch (error) {
    next(error);
  }
};

// @desc    Get user by ID
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      res.json(user);
    } else {
      res.status(404);
      return next(new Error('User not found'));
    }
  } catch (error) {
    next(error);
  }
};
