import { PrismaClient } from "./generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { config } from "./src/config";

const adapter = new PrismaPg({
  connectionString: config.DATABASE_URL!,
});

export const prisma = new PrismaClient({
  adapter,
});