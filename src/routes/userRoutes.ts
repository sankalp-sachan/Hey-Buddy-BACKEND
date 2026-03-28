import { Router } from "express";
import * as userController from "../controllers/userController";
import { authenticate } from "../middlewares/auth";

const router = Router();

router.use(authenticate);

router.get("/search", userController.searchUsers);
router.get("/profile", userController.getMyProfile);
router.patch("/profile", userController.updateUserProfile);
router.post("/sync-contacts", userController.syncContacts);

export default router;
