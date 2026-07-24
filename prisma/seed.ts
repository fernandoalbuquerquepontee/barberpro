import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

import { PrismaClient, Role, Status } from "../src/generated/prisma";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Iniciando o seed do banco de dados...");

  // Limpa o banco de dados antes de popular
  await prisma.appointment.deleteMany();
  await prisma.service.deleteMany();
  await prisma.barber.deleteMany();
  await prisma.user.deleteMany();

  // 1. Criar Usuários
  await prisma.user.create({
    data: {
      name: "Fernando Albuquerque",
      email: "fernando@exemplo.com",
      emailVerified: true,
      role: Role.ADMIN,
    },
  });

  const user = await prisma.user.create({
    data: {
      name: "Carlos Eduardo",
      email: "carlos@exemplo.com",
      emailVerified: true,
      role: Role.USER,
    },
  });

  console.log("✅ Usuários criados com sucesso.");

  // 2. Criar Barbeiros
  const barber = await prisma.barber.create({
    data: {
      name: "Navalha de Ouro (Mestre João)",
      specialty: "Cortes Clássicos e Barba na Toalha Quente",
      avatarUrl: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1",
    },
  });

  await prisma.barber.create({
    data: {
      name: "Lucas Fade",
      specialty: "Degradê Moderno e Pigmentação",
      avatarUrl: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c",
    },
  });

  console.log("✅ Barbeiros criados com sucesso.");

  // 3. Criar Serviços
  await prisma.service.create({
    data: {
      name: "Corte de Cabelo Masculino",
      price: 45.0,
    },
  });

  await prisma.service.create({
    data: {
      name: "Barba Completa",
      price: 35.0,
    },
  });

  const service = await prisma.service.create({
    data: {
      name: "Combo: Cabelo + Barba",
      price: 70.0,
    },
  });

  console.log("✅ Serviços criados com sucesso.");

  // 4. Criar Agendamento de Exemplo
  await prisma.appointment.create({
    data: {
      userId: user.id,
      barberId: barber.id,
      serviceId: service.id,
      date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Amanhã
      status: Status.CONFIRMED,
    },
  });

  console.log("✅ Agendamento de teste criado.");
  console.log("🚀 Seed concluído com sucesso!");
}

main()
  .catch((e) => {
    console.error("❌ Erro ao executar o seed:", e);
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
