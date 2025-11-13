import jwt from 'jsonwebtoken';
import { ENV } from './_core/env';

// Secret key para assinar os tokens JWT
// Em produção, isso deve vir de uma variável de ambiente segura
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Duração do token: 7 dias
const TOKEN_EXPIRATION = '7d';

export interface JwtPayload {
  userId: number;
  email: string;
  name?: string;
}

/**
 * Gera um token JWT para o usuário
 */
export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: TOKEN_EXPIRATION,
  });
}

/**
 * Verifica e decodifica um token JWT
 * Retorna o payload se o token for válido, ou null se for inválido
 */
export function verifyToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    return decoded;
  } catch (error) {
    console.error('[JWT] Token verification failed:', error);
    return null;
  }
}

/**
 * Extrai o token do header Authorization
 * Formato esperado: "Bearer <token>"
 */
export function extractTokenFromHeader(authHeader?: string): string | null {
  if (!authHeader) return null;
  
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }
  
  return parts[1];
}
