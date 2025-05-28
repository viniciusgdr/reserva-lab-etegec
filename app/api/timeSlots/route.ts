import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getSession } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const timeSlots = await prisma.timeSlot.findMany({
      select: {
        id: true,
        start: true,
        end: true,
      },
      orderBy: {
        start: 'asc',
      },
    });
    
    return NextResponse.json(timeSlots);
  } catch (error) {
    console.error('Erro ao listar horários:', error);
    return NextResponse.json(
      { message: 'Erro ao buscar horários' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const session = await getSession(request);
    
    if (!session) {
      return NextResponse.json({ message: 'Não autenticado' }, { status: 401 });
    }
    
    // Somente admin pode adicionar horários
    if (session.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Acesso negado' }, { status: 403 });
    }
    
    const { start, end } = await request.json();
    
    if (!start || !end) {
      return NextResponse.json(
        { message: 'Horário de início e término são obrigatórios' },
        { status: 400 }
      );
    }
    
    const newTimeSlot = await prisma.timeSlot.create({
      data: { 
        start,
        end
      },
    });
    
    return NextResponse.json(newTimeSlot, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar horário:', error);
    return NextResponse.json(
      { message: 'Erro ao criar horário' },
      { status: 500 }
    );
  }
}
