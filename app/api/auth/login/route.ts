import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'sua-chave-secreta';
const SESSION_DURATION_DAYS = 1;

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validar dados recebidos
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    // Busca o usuário pelo email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Verifica se o usuário existe e se a senha está correta
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return NextResponse.json(
        { message: 'Credenciais inválidas' },
        { status: 401 }
      );
    }

    // Cria uma nova sessão no banco de dados
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + SESSION_DURATION_DAYS);

    const userAgent = request.headers.get('user-agent') || '';
    const ipAddress = request.headers.get('x-forwarded-for') || '';

    const generatedSessionId = crypto.randomUUID(); // Gera um ID único para a sessão

    // Gera o token JWT com o ID da sessão
    const token = jwt.sign(
      { 
        id: user.id,
        email: user.email,
        role: user.role,
        sessionId: generatedSessionId
      },
      JWT_SECRET,
      { expiresIn: `${SESSION_DURATION_DAYS}d` }
    );

    const session = await prisma.session.create({
      data: {
        id: generatedSessionId,
        userId: user.id,
        userAgent: userAgent.toString(),
        ipAddress: ipAddress.toString(),
        expiresAt,
        token,
        isActive: true
      }
    });

    // Armazena o token na sessão
    await prisma.session.update({
      where: { id: session.id },
      data: { token }
    });

    // Define o cookie com o token
    (await cookies()).set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      maxAge: SESSION_DURATION_DAYS * 24 * 60 * 60, // em segundos
      sameSite: 'strict',
      path: '/',
    });

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      firstAccess: user.firstAccess,
    });
  } catch (error) {
    console.error('Erro no login:', error);
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
