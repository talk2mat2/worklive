import { Router } from "express";
import { createUser, getUsers, loginUser } from "../controllers/user.controller";

const router = Router();

router.post("/", createUser);
router.get("/", getUsers);
router.post("/login", loginUser);

export default router;
