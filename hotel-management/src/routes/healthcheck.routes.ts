import { Router } from "express";
import { StatusCodes } from "http-status-codes";
import { ApiResponse } from "../utils/ApiResponse";

const router=Router()

router.get("/healthcheck", (req, res) => {
  return res
    .status(StatusCodes.OK)
    .json(new ApiResponse(true, { message: "Server is running!" }, null));
});

export default router