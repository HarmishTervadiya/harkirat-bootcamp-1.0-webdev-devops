import { Router } from "express";
import { addDsaProblem, addMcqQuestion, createContest, getContest, getDsaProblemDetails, submitDsaAnswer, submitMcqAnswer } from "../controllers/contest.controller";
import verifyJwt from "../middleware/auth.middleware";

const router = Router();

router.get("/:problemId?", verifyJwt, getDsaProblemDetails)

router.post("/:problemId/submit", verifyJwt, submitDsaAnswer)


export default router;
