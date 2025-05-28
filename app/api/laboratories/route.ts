import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getSession } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const laboratories = await prisma.laboratory.findMany({
      select: {
        id: true,
        name: true,
      },
    });
    
    return NextResponse.json(laboratories);
  } catch (error) {
    console.error('Erro ao listar laboratórios:', error);
    return NextResponse.json(
      { message: 'Erro ao buscar laboratórios' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request);
    
    if (!session) {
      return NextResponse.json({ message: 'Não autenticado' }, { status: 401 });
    }
    
    // Verificar permissão (apenas admin)
    if (session.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Acesso negado' }, { status: 403 });
    }
    
    const { name } = await request.json();
    
    if (!name) {
      return NextResponse.json({ message: 'Nome é obrigatório' }, { status: 400 });
    }
    
    const newLaboratory = await prisma.laboratory.create({
      data: { name },
    });
    
    return NextResponse.json(newLaboratory, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar laboratório:', error);
    return NextResponse.json(
      { message: 'Erro ao criar laboratório' },
      { status: 500 }
    );
  }
}
