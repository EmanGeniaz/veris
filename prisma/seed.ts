import { PrismaClient } from "@prisma/client";
import { seedDemo } from "../lib/seed-core";

const prisma = new PrismaClient();
seedDemo(prisma)
  .then(id => console.log("Seeded demo tenant:", id))
  .finally(() => prisma.$disconnect());
