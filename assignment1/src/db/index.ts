import { neon } from "@neondatabase/serverless";
import { config } from "../../config";

const sql = neon(config.DB_URL ?? "");

export default sql;
