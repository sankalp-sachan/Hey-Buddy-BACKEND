import express from 'express';
import { getUsers, getUserById, subscribeUser } from '../controllers/users.js';
import { updateProfile, syncContacts } from '../controllers/contacts.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

router.get('/', protect, getUsers);
router.get('/:id', protect, getUserById);
router.put('/profile', protect, updateProfile);
router.post('/sync-contacts', protect, syncContacts);
router.post('/subscribe', protect, subscribeUser);

export default router;
