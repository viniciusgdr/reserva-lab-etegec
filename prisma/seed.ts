import { PrismaClient, Role } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting seeding...')
  // Criar usuário admin padrão
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@etegec.com' },
    update: {},
    create: {
      email: 'admin@etegec.com',
      name: 'Administrador',
      role: Role.ADMIN,
      password: adminPassword,
      firstAccess: false
    }
  })
  console.log('Admin user created:', admin.email)

  // Criar professores de exemplo
  const professorPassword = await bcrypt.hash('12345678', 10)
  
  const joao = await prisma.user.upsert({
    where: { email: 'joao@etegec.com' },
    update: {},
    create: {
      email: 'joao@etegec.com',
      name: 'Prof. João Silva',
      role: Role.PROFESSOR,
      password: professorPassword,
      firstAccess: true
    }
  })
  
  const maria = await prisma.user.upsert({
    where: { email: 'maria@etegec.com' },
    update: {},
    create: {
      email: 'maria@etegec.com',
      name: 'Prof. Maria Santos',
      role: Role.PROFESSOR,
      password: professorPassword,
      firstAccess: true
    }
  })
  
  console.log('Professors created:', joao.email, maria.email)

  // Criar laboratórios
  const lab1 = await prisma.laboratory.create({
    data: {
      name: 'Laboratório de Informática 1'
    }
  })
  
  const lab2 = await prisma.laboratory.create({
    data: {
      name: 'Laboratório de Química'
    }
  })
  
  const lab3 = await prisma.laboratory.create({
    data: {
      name: 'Laboratório de Física'
    }
  })
  
  console.log('Laboratories created:', lab1.name, lab2.name, lab3.name)

  // Criar horários
  const timeSlots = await Promise.all([
    prisma.timeSlot.create({
      data: { start: '08:00', end: '10:00' }
    }),
    prisma.timeSlot.create({
      data: { start: '10:00', end: '12:00' }
    }),
    prisma.timeSlot.create({
      data: { start: '14:00', end: '16:00' }
    }),
    prisma.timeSlot.create({
      data: { start: '16:00', end: '18:00' }
    }),
    prisma.timeSlot.create({
      data: { start: '19:00', end: '21:00' }
    }),
    prisma.timeSlot.create({
      data: { start: '21:00', end: '23:00' }
    })
  ])
  
  console.log('Time slots created:', timeSlots.length)

  // Criar algumas reservas de exemplo
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)
  
  const todayStr = today.toISOString().split('T')[0]
  const tomorrowStr = tomorrow.toISOString().split('T')[0]
  
  const reservation1 = await prisma.reservation.create({
    data: {
      date: todayStr,
      professorId: joao.id,
      laboratoryId: lab1.id,
      timeSlotId: timeSlots[0].id
    }
  })
  
  const reservation2 = await prisma.reservation.create({
    data: {
      date: tomorrowStr,
      professorId: maria.id,
      laboratoryId: lab2.id,
      timeSlotId: timeSlots[2].id
    }
  })
  
  console.log('Example reservations created:', reservation1.id, reservation2.id)

  console.log('Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
