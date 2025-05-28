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
    
    const timeSlot = await prisma.timeSlot.findUnique({
      where: { id },
    });
    
    if (!timeSlot) {
      return NextResponse.json({ message: 'Horário não encontrado' }, { status: 404 });
    }
    
    return NextResponse.json(timeSlot);
  } catch (error) {
    console.error('Erro ao buscar horário:', error);
    return NextResponse.json(
      { message: 'Erro ao buscar horário' },
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
    
    // Somente admin pode atualizar horários
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
    
    const updatedTimeSlot = await prisma.timeSlot.update({
      where: { id },
      data: { 
        start,
        end
      },
    });
    
    return NextResponse.json(updatedTimeSlot);
  } catch (error) {
    console.error('Erro ao atualizar horário:', error);
    return NextResponse.json(
      { message: 'Erro ao atualizar horário' },
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
    
    // Somente admin pode remover horários
    if (session.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Acesso negado' }, { status: 403 });
    }
    
    // Verificar reservas associadas
    const reservations = await prisma.reservation.findMany({
      where: { timeSlotId: id },
    });
    
    if (reservations.length > 0) {
      // Cancelar reservas associadas
      await prisma.reservation.updateMany({
        where: { timeSlotId: id },
        data: { status: 'CANCELLED' },
      });
    }
    
    // Remover o horário
    await prisma.timeSlot.delete({
      where: { id },
    });
    
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Erro ao remover horário:', error);
    return NextResponse.json(
      { message: 'Erro ao remover horário' },
      { status: 500 }
    );
  }
}
