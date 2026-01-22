import express from "express";
import authRouter from "./routes/auth.routes.ts";

const app = express();
app.use(express.json());
app.use("/auth", authRouter);

app.get("/healthcheck", async (_, res) => {
  res.status(200).send("Server connection is good");
});

export default app;
