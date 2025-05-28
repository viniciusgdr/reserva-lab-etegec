import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getSession } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id;
    
    if (!id) {
      return NextResponse.json({ message: 'ID inválido' }, { status: 400 });
    }
    
    const laboratory = await prisma.laboratory.findUnique({
      where: { id },
    });
    
    if (!laboratory) {
      return NextResponse.json({ message: 'Laboratório não encontrado' }, { status: 404 });
    }
    
    return NextResponse.json(laboratory);
  } catch (error) {
    console.error('Erro ao buscar laboratório:', error);
    return NextResponse.json(
      { message: 'Erro ao buscar laboratório' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id;
    
    if (!id) {
      return NextResponse.json({ message: 'ID inválido' }, { status: 400 });
    }
    
    // Verificar autenticação
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
    
    const updatedLaboratory = await prisma.laboratory.update({
      where: { id },
      data: { name },
    });
    
    return NextResponse.json(updatedLaboratory);
  } catch (error) {
    console.error('Erro ao atualizar laboratório:', error);
    return NextResponse.json(
      { message: 'Erro ao atualizar laboratório' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id;
    
    if (!id) {
      return NextResponse.json({ message: 'ID inválido' }, { status: 400 });
    }
    
    // Verificar autenticação
    const session = await getSession(request);
    
    if (!session) {
      return NextResponse.json({ message: 'Não autenticado' }, { status: 401 });
    }
    
    // Verificar permissão (apenas admin)
    if (session.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Acesso negado' }, { status: 403 });
    }
    
    // Verificar reservas associadas
    const reservations = await prisma.reservation.findMany({
      where: { laboratoryId: id },
    });
    
    if (reservations.length > 0) {
      // Cancelar reservas associadas
      await prisma.reservation.updateMany({
        where: { laboratoryId: id },
        data: { status: 'CANCELLED' },
      });
    }
    
    // Remover o laboratório
    await prisma.laboratory.delete({
      where: { id },
    });
    
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Erro ao remover laboratório:', error);
    return NextResponse.json(
      { message: 'Erro ao remover laboratório' },
      { status: 500 }
    );
  }
}
