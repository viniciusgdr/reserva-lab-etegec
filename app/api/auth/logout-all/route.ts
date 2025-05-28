import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import { getSession } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // Verificar sessão atual
    const session = await getSession(request);
    
    if (!session) {
      return NextResponse.json(
        { message: 'Não autenticado' },
        { status: 401 }
      );
    }

    // Invalidar todas as sessões do usuário
    await prisma.session.updateMany({
      where: {
        userId: session.userId,
        isActive: true
      },
      data: { isActive: false }
    });

    // Limpar o cookie
    (await cookies()).delete('auth_token');

    return NextResponse.json({ message: 'Todas as sessões foram encerradas com sucesso' });
  } catch (error) {
    console.error('Erro ao encerrar sessões:', error);
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
