import { Router } from "express";
import { signUpUser, signInUser } from "../controllers/auth.controller";

const router = Router();

router.route("/signup").post(signUpUser);

router.route("/login").post(signInUser);

export default router;
