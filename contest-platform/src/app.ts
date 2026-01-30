import express from "express";
import authRouter from "./routes/auth.routes.ts";
import contestRouter from "./routes/contests.routes.ts"
import problemsRouter from "./routes/problems.routes.ts"

const app = express();
app.use(express.json());
app.use("/auth", authRouter);
app.use("/api/contests", contestRouter)
app.use("/api/problems", problemsRouter)
app.get("/healthcheck", async (_, res) => {
  res.status(200).send("Server connection is good");
});

export {app};
