import { eq } from "drizzle-orm";
import { users, type User } from "../drizzle/schema";
import { getDb } from "./db";
import bcrypt from "bcryptjs";

/**
 * Cria um novo usuário no banco de dados
 */
export async function createUser(data: {
  fullName: string;
  email: string;
  phone: string;
  cpf: string;
  password: string;
}): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Hash da senha
  const passwordHash = await bcrypt.hash(data.password, 10);

  const result = await db.insert(users).values({
    fullName: data.fullName,
    email: data.email,
    phone: data.phone,
    cpf: data.cpf,
    passwordHash,
    loginMethod: "local",
  });

  return Number(result[0].insertId);
}

/**
 * Busca um usuário pelo e-mail
 */
export async function getUserByEmail(email: string): Promise<User | undefined> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Busca um usuário pelo CPF
 */
export async function getUserByCpf(cpf: string): Promise<User | undefined> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.cpf, cpf)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Busca um usuário pelo ID
 */
export async function getUserById(id: number): Promise<User | undefined> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Verifica se a senha fornecida corresponde ao hash armazenado
 */
export async function verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}
