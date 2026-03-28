import { Router } from "express";
import * as chatController from "../controllers/chatController";
import { authenticate } from "../middlewares/auth";

const router = Router();

router.use(authenticate);

router.post("/", chatController.createOrGetChat);
router.post("/group", chatController.createGroupChat);
router.get("/my-chats", chatController.getMyChats);

export default router;
