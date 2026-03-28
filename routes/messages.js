import express from 'express';
import { getMessages, sendMessage, editMessage, deleteMessage } from '../controllers/messages.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

router.get('/:chatId', protect, getMessages);
router.post('/', protect, sendMessage);
router.put('/edit', protect, editMessage);
router.delete('/:messageId', protect, deleteMessage);

export default router;
