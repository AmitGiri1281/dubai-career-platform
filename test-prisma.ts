import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log("Testing Prisma runtime connection...");

  const jobs = await prisma.job.findMany({
    take: 3,
    select: {
      id: true,
      title: true,
      isPublished: true,
    },
  });

  console.log("DATABASE CONNECTION: PASS");
  console.log("Jobs returned:", jobs.length);
  console.log(jobs);
}

main()
  .catch((error) => {
    console.error("DATABASE CONNECTION: FAIL");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });