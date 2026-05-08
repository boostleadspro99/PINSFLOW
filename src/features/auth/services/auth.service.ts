import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { registerSchema, type RegisterInput } from "../schemas/auth.schema";

const SALT_ROUNDS = 12;

export async function registerUser(input: RegisterInput) {
  const parsed = registerSchema.parse(input);

  const existing = await prisma.user.findUnique({
    where: { email: parsed.email },
    select: { id: true },
  });

  if (existing) {
    throw new Error("An account with this email already exists.");
  }

  const passwordHash = await bcrypt.hash(parsed.password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      name: parsed.name,
      email: parsed.email,
      passwordHash,
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  return user;
}
