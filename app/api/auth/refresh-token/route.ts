import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { getSession } from '@/lib/auth';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'sua-chave-secreta';
const SESSION_DURATION_DAYS = 1;

export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request);
    
    if (!session) {
      return NextResponse.json(
        { message: 'Não autenticado' },
        { status: 401 }
      );
    }

    // Atualizar a data de expiração da sessão
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + SESSION_DURATION_DAYS);

    // Gera um novo token JWT
    const newToken = jwt.sign(
      { 
        id: session.userId,
        email: session.email,
        role: session.role,
        sessionId: session.sessionId
      },
      JWT_SECRET,
      { expiresIn: `${SESSION_DURATION_DAYS}d` }
    );

    // Atualiza a sessão com o novo token
    await prisma.session.update({
      where: { id: session.sessionId },
      data: { 
        token: newToken,
        lastActiveAt: new Date(),
        expiresAt
      }
    });

    // Define o cookie com o novo token
    (await cookies()).set('auth_token', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      maxAge: SESSION_DURATION_DAYS * 24 * 60 * 60, // em segundos
      sameSite: 'strict',
      path: '/',
    });

    return NextResponse.json({ message: 'Token renovado com sucesso' });
  } catch (error) {
    console.error('Erro ao renovar token:', error);
    return NextResponse.json(
      { message: 'Não foi possível renovar o token' },
      { status: 401 }
    );
  }
}
