import { NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'sua-chave-secreta';

export interface SessionData {
  userId: string;
  email: string;
  role: string;
  sessionId: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function getSession(_request: NextRequest): Promise<SessionData | null> {
  try {
    // Pegar token do cookie
    const cookieStore = await cookies();
    console.log('Cookie Store:', cookieStore);
    const token = cookieStore.get('auth_token')?.value;
    
    if (!token) {
      return null;
    }

    // Verificar JWT
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
      role: string;
      sessionId: string;
    };

    // Verificar se a sessão existe e está ativa
    const session = await prisma.session.findUnique({
      where: {
        id: decoded.sessionId,
        isActive: true,
        expiresAt: { gt: new Date() }
      }
    });

    if (!session) {
      return null;
    }

    // Atualizar o último acesso da sessão
    await prisma.session.update({
      where: { id: session.id },
      data: { lastActiveAt: new Date() }
    });

    return {
      userId: decoded.id,
      email: decoded.email,
      role: decoded.role,
      sessionId: decoded.sessionId
    };
  } catch (error) {
    console.error('Erro ao verificar sessão:', error);
    return null;
  }
}

export async function requireAuth(
  request: NextRequest,
  allowedRoles: string[] = []
): Promise<{ isAuthorized: boolean; session: SessionData | null }> {
  const session = await getSession(request);
  
  if (!session) {
    return { isAuthorized: false, session: null };
  }
  
  // Verificar roles
  if (allowedRoles.length > 0 && !allowedRoles.includes(session.role)) {
    return { isAuthorized: false, session };
  }
  
  return { isAuthorized: true, session };
}
