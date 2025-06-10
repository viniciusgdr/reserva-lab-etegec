import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getSession } from '@/lib/auth';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const session = await getSession(request);
    
    if (!session) {
      return NextResponse.json({ message: 'Não autenticado' }, { status: 401 });
    }
    
    const professors = await prisma.user.findMany({
      where: { role: 'PROFESSOR' },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
    
    return NextResponse.json(professors);
  } catch (error) {
    console.error('Erro ao listar professores:', error);
    return NextResponse.json(
      { message: 'Erro ao buscar professores' },
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
    
    // Verificar se o usuário é admin
    if (session.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Acesso negado' }, { status: 403 });
    }
    
    const { name, email } = await request.json();
    
    if (!name || !email) {
      return NextResponse.json({ message: 'Dados incompletos' }, { status: 400 });
    }
    
    // Verificar se já existe um usuário com este email
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    
    if (existingUser) {
      return NextResponse.json({ message: 'Email já cadastrado' }, { status: 400 });
    }
    
    // Criar o novo professor
    const hashedPassword = await bcrypt.hash('12345678', 12);
    
    const newProfessor = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'PROFESSOR',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });
    
    return NextResponse.json(newProfessor, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar professor:', error);
    return NextResponse.json(
      { message: 'Erro ao criar professor' },
      { status: 500 }
    );
  }
}
