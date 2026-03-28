import express from 'express';
import { register, login, logout, getProfile } from '../controllers/auth.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/profile', protect, getProfile);

export default router;
