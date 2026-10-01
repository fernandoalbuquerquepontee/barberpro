import { prisma } from "@/lib/db";

export type OutputDto = {
  id: string;
  name: string;
  avatarUrl: string | null;
  totalAppointments: number;
  revenue: number;
}[];

interface InputDto {
  role: string | null | undefined;
}

export class GetTeamPerformanceUseCase {
  async execute(input: InputDto): Promise<OutputDto> {
    if (input.role !== "admin") {
      throw new Error("Apenas administradores podem fazer essa query");
    }

    const barbersFromDb = await prisma.barber.findMany({
      include: {
        appointments: {
          include: {
            service: true,
          },
        },
      },
    });

    const barbersWithPerformance = barbersFromDb.map((barber) => {
      const totalAppointments = barber.appointments.length;

      const revenue = barber.appointments.reduce((acc, appointment) => {
        const price = appointment.service?.price
          ? Number(appointment.service.price)
          : 0;
        return acc + price;
      }, 0);

      return {
        id: barber.id,
        name: barber.name,
        avatarUrl: barber.avatarUrl,
        totalAppointments,
        revenue,
      };
    });

    barbersWithPerformance.sort((a, b) => b.revenue - a.revenue);

    return barbersWithPerformance;
  }
}
