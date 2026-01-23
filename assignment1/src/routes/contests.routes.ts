import { Router } from "express";
import { addDsaProblem, addMcqQuestion, createContest, getContest, getContestLeaderboard, submitMcqAnswer } from "../controllers/contest.controller";
import verifyJwt from "../middleware/auth.middleware";

const router = Router();

router.route("/:contestId?")
.get(verifyJwt, getContest)
.post(verifyJwt, createContest);

router.post("/:contestId/mcq", verifyJwt, addMcqQuestion)
router.post("/:contestId/mcq/:questionId/submit", verifyJwt, submitMcqAnswer)

router.route(":contestId/dsa")
.post(verifyJwt, addDsaProblem)

router.get("/:contestId/leaderboard", verifyJwt, getContestLeaderboard)

export default router;
