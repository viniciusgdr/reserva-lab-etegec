import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getSession } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);
    
    if (!session) {
      return NextResponse.json(
        { message: 'Não autenticado' },
        { status: 401 }
      );
    }

    const sessions = await prisma.session.findMany({
      where: {
        userId: session.userId,
        isActive: true,
        expiresAt: { gt: new Date() }
      },
      select: {
        id: true,
        userAgent: true,
        ipAddress: true,
        createdAt: true,
        lastActiveAt: true,
      },
      orderBy: { lastActiveAt: 'desc' }
    });

    return NextResponse.json(sessions);
  } catch (error) {
    console.error('Erro ao listar sessões:', error);
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession(request);
    
    if (!session) {
      return NextResponse.json(
        { message: 'Não autenticado' },
        { status: 401 }
      );
    }
    
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { message: 'ID da sessão é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se a sessão pertence ao usuário
    const targetSession = await prisma.session.findFirst({
      where: {
        id: sessionId,
        userId: session.userId,
      },
    });

    if (!targetSession) {
      return NextResponse.json(
        { message: 'Sessão não encontrada' },
        { status: 404 }
      );
    }

    // Invalidar a sessão
    await prisma.session.update({
      where: { id: sessionId },
      data: { isActive: false }
    });

    return NextResponse.json({ message: 'Sessão encerrada com sucesso' });
  } catch (error) {
    console.error('Erro ao encerrar sessão:', error);
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
