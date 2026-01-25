import express from "express";
import authRouter from "./routes/auth.routes";
import courseRouter from "./routes/course.routes"
import lessonRouter from "./routes/lesson.routes"
import purchaseRouter from "./routes/purchase.routes"
import userRouter from "./routes/user.routes"

const app = express();

app.use(express.json());
app.get("/healthcheck", async (_, res) => {
  return res
    .status(200)
    .send("Connection is working")
    .json({ success: true, message: "Server connection is working" });
});

app.use("/auth", authRouter);
app.use("/courses", courseRouter)
app.use("/lessons", lessonRouter)
app.use("/purchases", purchaseRouter)
app.use("/users", userRouter)
export { app };
