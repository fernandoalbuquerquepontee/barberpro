import { format, subDays } from "date-fns";

import { prisma } from "@/lib/db";

export interface OutputDto {
  date: string;
  revenue: number;
}

interface InputDto {
  role: string | null | undefined;
  range?: string;
}

export class GetRevenuePerDayUseCase {
  async execute(input: InputDto) {
    if (input.role !== "admin") {
      throw new Error("Apenas administradores podem fazer essa query");
    }

    const rangeDays =
      input.range === "7d" ? 7 : input.range === "90d" ? 90 : 30;

    const startDate = subDays(new Date(), rangeDays - 1);
    startDate.setHours(0, 0, 0, 0);

    const appointments = await prisma.appointment.findMany({
      where: {
        date: {
          gte: startDate,
        },
        NOT: {
          status: "CANCELLED",
        },
      },
      include: {
        service: true,
      },
      orderBy: {
        date: "asc",
      },
    });

    const revenueMap: Record<string, number> = {};

    for (let i = 0; i < rangeDays; i++) {
      const d = subDays(new Date(), rangeDays - 1 - i);
      const dateString = format(d, "yyyy-MM-dd");
      revenueMap[dateString] = 0;
    }

    for (const appointment of appointments) {
      const dateString = format(appointment.date, "yyyy-MM-dd");
      const price = appointment.service?.price
        ? Number(appointment.service.price)
        : 0;

      if (revenueMap[dateString] !== undefined) {
        revenueMap[dateString] += price;
      }
    }

    const formattedData = Object.entries(revenueMap).map(([date, revenue]) => ({
      date,
      revenue,
    }));

    return formattedData;
  }
}
