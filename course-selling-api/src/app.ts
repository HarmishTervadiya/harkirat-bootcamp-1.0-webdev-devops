import express from "express";
import authRouter from "./routes/auth.routes";
const app = express();

app.use(express.json());
app.get("/healthcheck", async (_, res) => {
  return res
    .status(200)
    .send("Connection is working")
    .json({ success: true, message: "Server connection is working" });
});

app.use("/auth", authRouter);

export { app };
