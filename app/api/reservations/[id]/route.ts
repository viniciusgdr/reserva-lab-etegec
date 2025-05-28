import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getSession } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json({ message: 'ID inválido' }, { status: 400 });
    }
    
    // Verificar autenticação
    const session = await getSession(request);
    
    if (!session) {
      return NextResponse.json({ message: 'Não autenticado' }, { status: 401 });
    }
    
    const reservation = await prisma.reservation.findUnique({
      where: { id },
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
    
    if (!reservation) {
      return NextResponse.json({ message: 'Reserva não encontrada' }, { status: 404 });
    }
    
    // Verificar permissões (apenas admin ou o próprio professor podem visualizar)
    if (session.role !== 'ADMIN' && session.userId !== reservation.professorId) {
      return NextResponse.json({ message: 'Acesso negado' }, { status: 403 });
    }
    
    return NextResponse.json(reservation);
  } catch (error) {
    console.error('Erro ao buscar reserva:', error);
    return NextResponse.json(
      { message: 'Erro ao buscar reserva' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json({ message: 'ID inválido' }, { status: 400 });
    }
    
    // Verificar autenticação
    const session = await getSession(request);
    
    if (!session) {
      return NextResponse.json({ message: 'Não autenticado' }, { status: 401 });
    }
    
    const { status } = await request.json();
    
    if (!status || !['ACTIVE', 'CANCELLED'].includes(status)) {
      return NextResponse.json({ message: 'Status inválido' }, { status: 400 });
    }
    
    // Buscar a reserva para verificar permissões
    const reservation = await prisma.reservation.findUnique({
      where: { id },
    });
    
    if (!reservation) {
      return NextResponse.json({ message: 'Reserva não encontrada' }, { status: 404 });
    }
    
    // Verificar permissões (apenas admin ou o próprio professor podem atualizar)
    if (session.role !== 'ADMIN' && session.userId !== reservation.professorId) {
      return NextResponse.json({ message: 'Acesso negado' }, { status: 403 });
    }
    
    // Atualizar o status da reserva
    const updatedReservation = await prisma.reservation.update({
      where: { id },
      data: { status: status as 'ACTIVE' | 'CANCELLED' },
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
    
    return NextResponse.json(updatedReservation);
  } catch (error) {
    console.error('Erro ao atualizar reserva:', error);
    return NextResponse.json(
      { message: 'Erro ao atualizar reserva' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json({ message: 'ID inválido' }, { status: 400 });
    }
    
    // Verificar autenticação
    const session = await getSession(request);
    
    if (!session) {
      return NextResponse.json({ message: 'Não autenticado' }, { status: 401 });
    }
    
    // Somente admin pode remover reservas
    if (session.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Acesso negado' }, { status: 403 });
    }
    
    await prisma.reservation.delete({
      where: { id },
    });
    
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Erro ao remover reserva:', error);
    return NextResponse.json(
      { message: 'Erro ao remover reserva' },
      { status: 500 }
    );
  }
}
