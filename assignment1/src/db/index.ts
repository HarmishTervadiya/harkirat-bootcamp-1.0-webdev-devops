import { neon } from '@neondatabase/serverless';
import { env } from '../../env';

const sql = neon(env.DB_URL ?? "");

export default sql 