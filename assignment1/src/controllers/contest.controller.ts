import { asyncHandler } from "../utils/asyncHandler";

const createContest = asyncHandler(async (req, res) => {});

const getContest = asyncHandler(async (req, res) => {});

const addMcqQuestion = asyncHandler(async (req, res) => {});

const submitMcqAnswer = asyncHandler(async (req, res) => {});

const addDsaProblem = asyncHandler(async (req, res) => {});

const getDsaProblemDetails = asyncHandler(async (req, res) => {});

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
