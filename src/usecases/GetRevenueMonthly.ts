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

    const monthlyRevenue: Record<string, number> = {
      January: 0,
      February: 0,
      March: 0,
      April: 0,
      May: 0,
      June: 0,
      July: 0,
      August: 0,
      September: 0,
      October: 0,
      November: 0,
      December: 0,
    };

    for (const appointment of appointments) {
      const monthName = appointment.date.toLocaleString("en-US", {
        month: "long",
      });

      if (monthlyRevenue[monthName] !== undefined && appointment.service) {
        monthlyRevenue[monthName] += Number(appointment.service.price);
      }
    }

    return Object.entries(monthlyRevenue)
      .map(([month, revenue]) => ({
        month,
        revenue,
      }))
      .filter((item) => item.revenue > 0);
  }
}
