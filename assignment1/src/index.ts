import { env } from "../env.ts";
import app from "./app.ts";

const port = env.PORT;

app.listen(port,() => {
  console.log( `Server started on port ${port}`);
});