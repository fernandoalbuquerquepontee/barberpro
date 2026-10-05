import { prisma } from "@/lib/db";

export interface OutputDto {
  year: string;
  revenue: number;
}

interface InputDto {
  role: string | null | undefined;
}

export class GetRevenueAnnualUseCase {
  async execute(input: InputDto) {
    if (input.role !== "admin") {
      throw new Error("Apenas administradores podem fazer essa query");
    }

    const appointments = await prisma.appointment.findMany({
      where: {
        NOT: {
          status: "CANCELLED",
        },
      },
      select: {
        date: true,
        service: {
          select: {
            price: true,
          },
        },
      },
    });

    const annualRevenue: Record<string, number> = {};

    for (const appointment of appointments) {
      const yearName = appointment.date.getFullYear().toString();

      if (!annualRevenue[yearName]) {
        annualRevenue[yearName] = 0;
      }

      if (appointment.service) {
        annualRevenue[yearName] += Number(appointment.service.price);
      }
    }

    return Object.entries(annualRevenue)
      .map(([year, revenue]) => ({
        year,
        revenue,
      }))
      .sort((a, b) => a.year.localeCompare(b.year));
  }
}
