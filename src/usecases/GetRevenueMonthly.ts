import { monthlyRevenue } from "@/constants";
import { prisma } from "@/lib/db";

export interface OutputDto {
  month: string;
  revenue: number;
}

interface InputDto {
  role: string | null | undefined;
}

export class GetRevenueMonthlyUseCase {
  async execute(input: InputDto) {
    if (input.role !== "admin") {
      throw new Error("Apenas administradores podem fazer essa query");
    }

    const appointments = await prisma.appointment.findMany({
      select: {
        date: true,
        service: {
          select: {
            price: true,
          },
        },
      },
    });

    for (const appointment of appointments) {
      const monthName = appointment.date.toLocaleString("en-US", {
        month: "long",
      });

      if (monthlyRevenue[monthName] !== undefined && appointment.service) {
        monthlyRevenue[monthName] += Number(appointment.service.price);
      }
    }

    return Object.entries(monthlyRevenue).map(([month, revenue]) => ({
      month,
      revenue,
    }));
  }
}
