import { prisma } from "@/lib/db";

interface OutputDto {
  revenueToday: number;
  totalReservations: number;
  attendedClients: number;
}

interface InputDto {
  role: string | null | undefined;
}

export class GetMetricsUseCase {
  async execute(input: InputDto): Promise<OutputDto> {
    if (input.role !== "admin") {
      throw new Error("Apenas administradores podem fazer essa query");
    }

    const startOfDay = new Date();
    startOfDay.setHours(7, 30, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(19, 30, 0, 0);

    const todayAppointments = await prisma.appointment.findMany({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: {
          not: "CANCELLED",
        },
      },
      include: {
        service: true,
      },
    });

    const revenueToday = todayAppointments.reduce((acc, appointment) => {
      return acc + Number(appointment.service?.price ?? 0);
    }, 0);

    const totalReservations = await prisma.appointment.count({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    const attendedClients = await prisma.appointment.count({
      where: {
        status: "CONFIRMED",
      },
    });

    return {
      revenueToday,
      totalReservations,
      attendedClients,
    };
  }
}
