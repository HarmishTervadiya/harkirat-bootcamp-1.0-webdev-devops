import express from "express";
import { ApiResponse } from "./utils/ApiResponse";
import { StatusCodes } from "http-status-codes";
import authRouter from "./routes/auth.routes";
import healthcheckRouter from "./routes/healthcheck.routes";
import hotelRouter from "./routes/hotel.routes";
import bookingsRouter from "./routes/booking.routes";
import reviewRouter from "./routes/review.routes";

const app = express();

app.use(express.json());

app.use("/api/healthcheck", healthcheckRouter);
app.use("/api/auth", authRouter);
app.use("/api/hotels", hotelRouter);
app.use("/api/bookings", bookingsRouter);
app.use("/api/reviews", reviewRouter);

export { app };
