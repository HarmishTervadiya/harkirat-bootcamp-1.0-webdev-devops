import express from "express";
import { ApiResponse } from "./utils/ApiResponse";
import { StatusCodes } from "http-status-codes";

const app = express();

app.use(express.json());

app.get("/healthcheck", (req, res) => {
  return res
    .status(StatusCodes.OK)
    .json(new ApiResponse(true, { message: "Server is running!" }, null));
});

export { app };
