import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import { getSession } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // Verificar sessão atual
    const session = await getSession(request);
    
    if (session) {
      // Invalidar a sessão no banco de dados
      await prisma.session.update({
        where: { id: session.sessionId },
        data: { isActive: false }
      });
    }

    // Limpar o cookie
    (await cookies()).delete('auth_token');

    return NextResponse.json({ message: 'Logout realizado com sucesso' });
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
