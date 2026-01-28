import { sql } from "../db";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";

const createContest = asyncHandler(async (req, res) => {
  const { title, description, startTime, endTime } = req.body;

  if (
    [title, description, startTime, endTime, req.user?.id].some(
      (field) => !field,
    )
  ) {
    return res.status(400).json(new ApiResponse(false, {}, "INVALID_REQUEST"));
  }

  if (req.user?.role !== "creator") {
    return res.status(401).json(new ApiResponse(false, {}, "FORBIDDEN"));
  }

  const insertedContest = await sql`insert into contests 
    (title, description, start_time, end_time, creator_id) values 
    (${title}, ${description}, ${startTime}, ${endTime}, ${req.user?.id})
    RETURNING *`;

  if (!insertedContest.length || insertedContest.length === 0) {
    return res.status(500).json(new ApiResponse(false, {}, "SERVER_ERROR"));
  }

  const contest = insertedContest[0];
  if (!contest) {
    return res.status(500).json(new ApiResponse(false, {}, "SERVER_ERROR"));
  }

  return res.status(201).json(new ApiResponse(true, contest, null));
});

const getContest = asyncHandler(async (req, res) => {
  const { contestId } = req.params;
  if (!contestId) {
    return res
      .status(404)
      .json(new ApiResponse(false, {}, "Contest not found"));
  }

  const data = await Promise.all([
    sql`select * from contests c
    where c.id=${contestId}`,
    sql`select * from mcq_questions where contest_id=${contestId}`,
    sql`select * from dsa_problems where contest_id=${contestId}`,
  ]);

  if (!data[0] || !data[1] || !data[2]) {
    return res
      .status(404)
      .json(new ApiResponse(false, {}, "Contest not found"));
  }

  const mcqs = data[1].map(({ correct_option_index, ...rest }) => rest);

  return res
    .status(200)
    .json(
      new ApiResponse(
        true,
        { ...data[0][0], mcqs, dsaProblems: data[2] },
        null,
      ),
    );
});

const addMcqQuestion = asyncHandler(async (req, res) => {
  const { questionText, options, correctOptionIndex, points } = req.body;
  const { contestId } = req.params;

  if (
    [questionText, correctOptionIndex, points, contestId].some(
      (field) => field === undefined || field === null,
    ) ||
    (options && options.length < 0)
  ) {
    return res.status(400).json(new ApiResponse(false, {}, "BAD_REQUEST"));
  }

  const createdAt = new Date().toISOString();

  const insertedMcq = await sql`insert into mcq_questions 
  (contest_id, question_text, options, correct_option_index, points, created_at) values
  (${contestId}, ${questionText}, ${JSON.stringify(options)}, ${correctOptionIndex}, ${points}, ${createdAt})
  RETURNING *`;

  if (insertedMcq && !insertedMcq[0]) {
    return res.status(500).json(new ApiResponse(false, {}, "SERVER_ERROR"));
  }

  return res.status(201).json(new ApiResponse(true, insertedMcq[0], null));
});

const submitMcqAnswer = asyncHandler(async (req, res) => {});

const addDsaProblem = asyncHandler(async (req, res) => {});

const getDsaProblemDetails = asyncHandler(async (req, res) => {
  const { problemId } = req.params;

  if (!problemId) {
    return res.status(404).json(new ApiResponse(false, {}, null));
  }

  const data = await Promise.all([
    sql`select * from dsa_problems where id=${problemId}`,
    sql`select * from test_cases where problem_id=${problemId}`,
  ]);

  if (!data[0] || !data[1]) {
    return res
      .status(404)
      .json(new ApiResponse(false, {}, "Dsa problem not found"));
  }

  return res
    .status(200)
    .json(new ApiResponse(true, { ...data[0][0], test_cases: data[1] }, null));
});

const submitDsaAnswer = asyncHandler(async (req, res) => {});

const getContestLeaderboard = asyncHandler(async (req, res) => {});

export {
  createContest,
  getContest,
  addMcqQuestion,
  submitDsaAnswer,
  submitMcqAnswer,
  addDsaProblem,
  getDsaProblemDetails,
  getContestLeaderboard,
};
