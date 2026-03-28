import User from '../models/User.js';

// @desc    Update user profile
// @route   PUT /api/users/profile
export const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.username = req.body.username || user.username;
      user.email = req.body.email || user.email;
      user.avatar = req.body.avatar || user.avatar;
      user.about = req.body.about || user.about;
      user.phoneNumber = req.body.phoneNumber || user.phoneNumber;

      const updatedUser = await user.save();

      res.status(200).json({
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
        about: updatedUser.about,
        phoneNumber: updatedUser.phoneNumber,
        status: updatedUser.status,
      });
    } else {
      res.status(404);
      return next(new Error('User not found'));
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Sync contacts by phone numbers
// @route   POST /api/users/sync-contacts
export const syncContacts = async (req, res, next) => {
  const { phoneNumbers } = req.body; // Array of phone numbers

  if (!phoneNumbers || !Array.isArray(phoneNumbers)) {
    res.status(400);
    return next(new Error('phoneNumbers array is required'));
  }

  try {
    const contacts = await User.find({
      phoneNumber: { $in: phoneNumbers },
      _id: { $ne: req.user._id }
    }).select('username email avatar about phoneNumber status');

    res.status(200).json(contacts);
  } catch (error) {
    next(error);
  }
};
