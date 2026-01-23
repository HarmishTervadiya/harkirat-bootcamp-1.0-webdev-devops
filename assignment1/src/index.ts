import { config } from "../config.ts";
import {app} from "./app.ts";

const port = config.PORT;

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
