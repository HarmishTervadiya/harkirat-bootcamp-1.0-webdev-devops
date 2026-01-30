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
    return res
      .status(400)
      .json(new ApiResponse(false, null, "INVALID_REQUEST"));
  }

  if (req.user?.role !== "creator") {
    return res.status(403).json(new ApiResponse(false, null, "FORBIDDEN"));
  }

  const insertedContest = await sql`insert into contests 
    (title, description, start_time, end_time, creator_id) values 
    (${title}, ${description}, ${startTime}, ${endTime}, ${req.user?.id})
    RETURNING *`;

  if (!insertedContest.length || insertedContest.length === 0) {
    return res.status(500).json(new ApiResponse(false, null, "SERVER_ERROR"));
  }

  const contest = insertedContest[0];
  if (!contest) {
    return res.status(500).json(new ApiResponse(false, null, "SERVER_ERROR"));
  }

  return res.status(201).json(new ApiResponse(true, contest, null));
});

const getContest = asyncHandler(async (req, res) => {
  const { contestId } = req.params;
  if (!contestId) {
    return res
      .status(404)
      .json(new ApiResponse(false, null, "CONTEST_NOT_FOUND"));
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
      .json(new ApiResponse(false, null, "CONTEST_NOT_FOUND"));
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
    return res
      .status(400)
      .json(new ApiResponse(false, null, "INVALID_REQUEST"));
  }

  const createdAt = new Date().toISOString();

  const insertedMcq = await sql`insert into mcq_questions 
  (contest_id, question_text, options, correct_option_index, points, created_at) values
  (${contestId}, ${questionText}, ${JSON.stringify(options)}, ${correctOptionIndex}, ${points}, ${createdAt})
  RETURNING *`;

  if (insertedMcq && !insertedMcq[0]) {
    return res.status(500).json(new ApiResponse(false, null, "SERVER_ERROR"));
  }

  return res.status(201).json(new ApiResponse(true, insertedMcq[0], null));
});

const submitMcqAnswer = asyncHandler(async (req, res) => {
  const { contestId, questionId } = req.params;
  const { selectedOptionIndex } = req.body;
  if (
    [contestId, questionId, selectedOptionIndex].some(
      (field) => field === undefined || field === null,
    )
  ) {
    return res
      .status(400)
      .json(new ApiResponse(false, null, "INVALID_REQUEST"));
  }

  const data = await sql`select c.id as contest_id, m.id as question_id,
    c.creator_id as creator_id,
    m.points as points, 
    c.end_time, 
    (c.end_time >= CAST(NOW() AS DATE)) as contest_active,
    s.id as submission_id,
    s.is_correct,
    m.correct_option_index from 
    mcq_questions m left join contests c on m.contest_id=c.id 
    left join mcq_submissions s on s.question_id=m.id  
    and s.user_id=${req.user?.id}
    where c.id=${contestId} and m.id=${questionId}`;

  console.log(data);

  if (data.length === 0) {
    return res
      .status(404)
      .json(new ApiResponse(false, null, "QUESTION_NOT_FOUND"));
  }

  const row = data[0]!;
  if (!row.contest_active) {
    return res
      .status(400)
      .json(new ApiResponse(false, null, "CONTEST_NOT_ACTIVE"));
  }

  if (row.creator_id === req.user?.id) {
    return res.status(403).json(new ApiResponse(false, null, "FORBIDDEN"));
  }

  if (row.is_correct) {
    return res
      .status(400)
      .json(new ApiResponse(false, null, "ALREADY_SUBMITTED"));
  }

  const isCorrect = selectedOptionIndex === row.correct_option_index;
  const points = isCorrect ? row.points || 0 : 0;
  const date = new Date().toLocaleDateString();

  const createdSubmission =
    await sql`insert into mcq_submissions (question_id, user_id, selected_option_index, is_correct, points_earned, submitted_at) values 
    (${questionId},${req.user?.id},${selectedOptionIndex}, ${isCorrect}, ${points}, ${date})`;

  console.log("Inserted submission", createdSubmission);
  if (!createdSubmission) {
    return res.status(500).json(new ApiResponse(false, null, "SERVER_ERROR"));
  }

  return res
    .status(201)
    .json(new ApiResponse(true, { isCorrect, pointsEarned: points }, null));
});

const addDsaProblem = asyncHandler(async (req, res) => {
  const { contestId } = req.params;
  const {
    title,
    description,
    tags,
    points,
    timeLimit,
    memoryLimit,
    testCases,
  } = req.body;
  if (
    [
      contestId,
      title,
      description,
      tags,
      points,
      timeLimit,
      memoryLimit,
      testCases,
    ].some((field) => !field)
  ) {
    return res
      .status(400)
      .json(new ApiResponse(false, null, "INVALID_REQUEST"));
  }

  if (req.user?.role != "creator")
    return res.status(403).json(new ApiResponse(false, null, "FORBIDDEN"));

  if (!Array.isArray(testCases) || testCases.length === 0) {
    return res
      .status(400)
      .json(new ApiResponse(false, null, "INVALID_REQUEST"));
  }

  const [result] = await sql.transaction([
    sql`
        WITH contest_check AS (
          SELECT id FROM contests WHERE id = ${contestId}
        ),
        inserted_problem AS (
          INSERT INTO dsa_problems
            (contest_id, title, description, tags, points, time_limit, memory_limit, created_at)
          SELECT
            ${contestId},
            ${title},
            ${description},
            ${JSON.stringify(tags)},
            ${points},
            ${timeLimit},
            ${memoryLimit},
            ${new Date().toDateString()}
          FROM contest_check
          RETURNING id
        ),
        inserted_test_cases AS (
          INSERT INTO test_cases
            (problem_id, input, expected_output, is_hidden, created_at)
          SELECT
            ip.id,
            tc.input,
            tc."expectedOutput",
            tc."isHidden",
            ${new Date().toDateString()}
          FROM inserted_problem ip,
          jsonb_to_recordset(${JSON.stringify(testCases)}::jsonb)
            AS tc(input text, "expectedOutput" text, "isHidden" boolean)
          RETURNING id
        )
        SELECT
          (SELECT id FROM inserted_problem) AS problem_id,
          COUNT(*) AS test_case_count
        FROM inserted_test_cases;
      `,
  ]);

  if (!result || !result[0]?.problem_id) {
    return res
      .status(404)
      .json(new ApiResponse(false, null, "CONTEST_NOT_FOUND"));
  }

  return res.status(201).json(
    new ApiResponse(
      true,
      {
        id: result[0].problem_id,
        contestId,
        testCaseCount: result[0].test_case_count,
      },
      null,
    ),
  );
});

const getDsaProblemDetails = asyncHandler(async (req, res) => {
  const { problemId } = req.params;

  if (!problemId) {
    return res
      .status(404)
      .json(new ApiResponse(false, null, "PROBLEM_NOT_FOUND"));
  }

  const data = await Promise.all([
    sql`select * from dsa_problems where id=${problemId}`,
    sql`select * from test_cases where problem_id=${problemId} and is_hidden=false`,
  ]);

  if (data[0].length === 0 || data[1].length === 0) {
    return res
      .status(404)
      .json(new ApiResponse(false, null, "PROBLEM_NOT_FOUND"));
  }

  return res
    .status(200)
    .json(new ApiResponse(true, { ...data[0][0], test_cases: data[1] }, null));
});

const submitDsaAnswer = asyncHandler(async (req, res) => {
  const { problemId } = req.params;

  const { code, language } = req.body;

  if (!code || !language) {
    return res
      .status(400)
      .json(new ApiResponse(false, null, "INVALID_REQUEST"));
  }

  const data = await sql`
     SELECT
    c.id AS contest_id,
    m.id AS problem_id,
    c.creator_id,
    m.points,
    c.end_time,
    (NOW() <= c.end_time) AS contest_active
    FROM dsa_problems m
    JOIN contests c ON m.contest_id = c.id
    WHERE m.id = ${problemId};
   `;
  console.log(data);
  if (data.length === 0) {
    return res
      .status(404)
      .json(new ApiResponse(false, null, "PROBLEM_NOT_FOUND"));
  }

  const row = data[0]!;
  if (!row.contest_active) {
    return res
      .status(400)
      .json(new ApiResponse(false, null, "CONTEST_NOT_ACTIVE"));
  }

  if (row.creator_id === req.user?.id) {
    return res.status(403).json(new ApiResponse(false, null, "FORBIDDEN"));
  }

  const testCases =
    await sql`select * from test_cases where problem_id=${problemId}`;

  if (!testCases || testCases.length === 0) {
    return res
      .status(404)
      .json(new ApiResponse(false, null, "PROBLEM_NOT_FOUND"));
  }

  let testCasesPassed = 0;
  for (const testCase of testCases) {
    // Todo: code excution
    testCasesPassed++;
  }

  const status = "accepted";
  const executionTime = 1000;

  const pointsEarned = Math.floor(
    (testCasesPassed / testCases.length) * row.points,
  );

  const submittedAnswer = await sql`insert into dsa_submissions 
  (user_id, problem_id, code, language, status, points_earned, test_cases_passed, total_test_cases, execution_time, submitted_at)
  values
  (${req.user?.id}, ${problemId}, ${code}, ${language}, ${status}, ${pointsEarned}, ${testCasesPassed},${testCases.length}, ${executionTime},${new Date().toDateString()})
  RETURNING *`;

  if (!Array.isArray(submittedAnswer) || submittedAnswer.length === 0) {
    return res.status(500).json(new ApiResponse(false, null, "SERVER_ERROR"));
  }

  return res.status(201).json(
    new ApiResponse(
      true,
      {
        status,
        pointsEarned,
        testCasesPassed,
        totalTestCases: testCases.length,
      },
      null,
    ),
  );
});

// This endpoint was made by @harpalll
const getContestLeaderboard = asyncHandler(async (req, res) => {
  const { contestId } = req.params;
  const leaderboard = await sql`
  WITH mcq_scores AS (
    SELECT
      s.user_id,
      SUM(s.points_earned) AS mcq_points
    FROM mcq_submissions s
    JOIN mcq_questions q ON q.id = s.question_id
    WHERE q.contest_id = ${contestId}
    GROUP BY s.user_id
  ),
  dsa_best_per_problem AS (
    SELECT
      user_id,
      problem_id,
      MAX(points_earned) AS best_points
    FROM dsa_submissions
    GROUP BY user_id, problem_id
  ),
  dsa_scores AS (
    SELECT
      db.user_id,
      SUM(db.best_points) AS dsa_points
    FROM dsa_best_per_problem db
    JOIN dsa_problems p ON p.id = db.problem_id
    WHERE p.contest_id = ${contestId}
    GROUP BY db.user_id
  ),
  total_scores AS (
    SELECT
      u.id AS user_id,
      u.name,
      COALESCE(m.mcq_points, 0) + COALESCE(d.dsa_points, 0) AS total_points
    FROM users u
    LEFT JOIN mcq_scores m ON m.user_id = u.id
    LEFT JOIN dsa_scores d ON d.user_id = u.id
  )
  SELECT
    user_id AS "userId",
    name,
    total_points AS "totalPoints",
    DENSE_RANK() OVER (ORDER BY total_points DESC) AS rank
  FROM total_scores
  WHERE total_points > 0
  ORDER BY rank, name;
`;
  return res.status(200).json(new ApiResponse(true, leaderboard, null));
});

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
