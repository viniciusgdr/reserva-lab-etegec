import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'sua-chave-secreta';

export interface AuthRequest extends NextApiRequest {
  user?: {
    id: string;
    email: string;
    role: string;
    sessionId: string;
  };
}

type NextApiHandler = (req: AuthRequest, res: NextApiResponse) => Promise<void> | void;

export function withAuth(handler: NextApiHandler, roles: string[] = []): NextApiHandler {
  return async (req: AuthRequest, res: NextApiResponse) => {
    try {
      // Extrai o token do cookie
      const token = req.cookies.auth_token;
      
      if (!token) {
        return res.status(401).json({ message: 'Não autenticado' });
      }

      // Verifica e decodifica o token
      const decoded = jwt.verify(token, JWT_SECRET) as {
        id: string;
        email: string;
        role: string;
        sessionId: string;
      };

      // Verifica se a sessão está ativa no banco de dados
      const session = await prisma.session.findUnique({
        where: { 
          id: decoded.sessionId,
          isActive: true
        },
        include: { user: true }
      });

      if (!session || session.expiresAt < new Date()) {
        return res.status(401).json({ message: 'Sessão inválida ou expirada' });
      }

      // Atualiza o último acesso da sessão
      await prisma.session.update({
        where: { id: session.id },
        data: { lastActiveAt: new Date() }
      });

      // Verifica se o usuário tem a role necessária
      if (roles.length > 0 && !roles.includes(session.user.role)) {
        return res.status(403).json({ message: 'Acesso negado' });
      }

      // Adiciona o usuário decodificado à requisição
      req.user = {
        id: session.user.id,
        email: session.user.email,
        role: session.user.role,
        sessionId: session.id
      };
      
      // Continua para o handler original
      return handler(req, res);
    } catch (error) {
      console.error('Erro de autenticação:', error);
      return res.status(401).json({ message: 'Token inválido ou expirado' });
    }
  };
}
