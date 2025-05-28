/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getSession } from '@/lib/auth';
import bcrypt from 'bcryptjs';

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
    
    // Verificar autenticação
    const session = await getSession(request);
    
    if (!session) {
      return NextResponse.json({ message: 'Não autenticado' }, { status: 401 });
    }
    
    const professor = await prisma.user.findUnique({
      where: { 
        id,
        role: 'PROFESSOR'
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });
    
    if (!professor) {
      return NextResponse.json({ message: 'Professor não encontrado' }, { status: 404 });
    }
    
    return NextResponse.json(professor);
  } catch (error) {
    console.error('Erro ao buscar professor:', error);
    return NextResponse.json(
      { message: 'Erro ao buscar professor' },
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
    
    // Verificar se é admin ou o próprio usuário
    if (session.role !== 'ADMIN' && session.userId !== id) {
      return NextResponse.json({ message: 'Acesso negado' }, { status: 403 });
    }
    
    const { name, email, password } = await request.json();
    
    // Verificar se o professor existe
    const professor = await prisma.user.findUnique({
      where: { id },
    });
    
    if (!professor || professor.role !== 'PROFESSOR') {
      return NextResponse.json({ message: 'Professor não encontrado' }, { status: 404 });
    }
    
    // Preparar dados para atualização
    const updateData: any = {};
    
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (password) updateData.password = await bcrypt.hash(password, 10);
    
    // Atualizar o professor
    const updatedProfessor = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });
    
    return NextResponse.json(updatedProfessor);
  } catch (error) {
    console.error('Erro ao atualizar professor:', error);
    return NextResponse.json(
      { message: 'Erro ao atualizar professor' },
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
    
    const session = await getSession(request);
    
    if (!session) {
      return NextResponse.json({ message: 'Não autenticado' }, { status: 401 });
    }
    
    if (session.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Acesso negado' }, { status: 403 });
    }
    
    const professor = await prisma.user.findUnique({
      where: { id },
    });
    
    if (!professor || professor.role !== 'PROFESSOR') {
      return NextResponse.json({ message: 'Professor não encontrado' }, { status: 404 });
    }
    
    const reservations = await prisma.reservation.findMany({
      where: { professorId: id },
    });
    
    if (reservations.length > 0) {
      await prisma.reservation.deleteMany({
        where: { professorId: id }
      });
    }
    
    // Remover o professor
    await prisma.user.delete({
      where: { id },
    });
    
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Erro ao remover professor:', error);
    return NextResponse.json(
      { message: 'Erro ao remover professor' },
      { status: 500 }
    );
  }
}
