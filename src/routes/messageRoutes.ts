import { Router } from "express";
import * as messageController from "../controllers/messageController";
import { authenticate } from "../middlewares/auth";

const router = Router();

router.use(authenticate);

router.post("/", messageController.sendMessage);
router.get("/:chatId", messageController.getMessagesByChatId);
router.patch("/:messageId", messageController.editMessage);
router.delete("/:messageId", messageController.deleteMessage);

export default router;
