import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getSession } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const session = await getSession(request);
    
    if (!session) {
      return NextResponse.json({ message: 'Não autenticado' }, { status: 401 });
    }
    
    const isAdmin = session.role === 'ADMIN';
    const userId = session.userId;
    
    // Filtrar por usuário se não for admin
    const where = isAdmin ? {} : { professorId: userId };
    
    const reservations = await prisma.reservation.findMany({
      where,
      include: {
        professor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        laboratory: true,
        timeSlot: true,
      },
      orderBy: [
        { date: 'asc' },
        { timeSlot: { start: 'asc' } },
      ],
    });
    
    return NextResponse.json(reservations);
  } catch (error) {
    console.error('Erro ao listar reservas:', error);
    return NextResponse.json(
      { message: 'Erro ao buscar reservas' },
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
    
    const { laboratoryId, timeSlotId, date, professorId } = await request.json();
    
    if (!laboratoryId || !timeSlotId || !date) {
      return NextResponse.json({ message: 'Dados incompletos' }, { status: 400 });
    }
    
    // Determinar o professor (o próprio usuário ou outro, se for admin)
    const reservingProfessorId = professorId || session.userId;
    
    // Verificar permissões - apenas admin pode criar para outros
    if (professorId && professorId !== session.userId && session.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Acesso negado' }, { status: 403 });
    }
    
    // Verificar se o horário já está reservado
    const existingReservation = await prisma.reservation.findFirst({
      where: {
        laboratoryId,
        timeSlotId,
        date,
        status: 'ACTIVE',
      },
    });
    
    if (existingReservation) {
      return NextResponse.json({ message: 'Este horário já está reservado' }, { status: 409 });
    }
    
    // Criar a reserva
    const newReservation = await prisma.reservation.create({
      data: {
        laboratoryId,
        timeSlotId,
        date,
        professorId: reservingProfessorId,
        status: 'ACTIVE',
      },
      include: {
        professor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        laboratory: true,
        timeSlot: true,
      },
    });
    
    return NextResponse.json(newReservation, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar reserva:', error);
    return NextResponse.json(
      { message: 'Erro ao criar reserva' },
      { status: 500 }
    );
  }
}
