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

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - rangeDays);
    startDate.setHours(0, 0, 0, 0);

    const appointments = await prisma.appointment.findMany({
      where: {
        date: {
          gte: startDate,
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

    for (let i = 0; i <= rangeDays; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (rangeDays - i));
      const dateString = d.toISOString().split("T")[0];
      revenueMap[dateString] = 0;
    }

    for (const appointment of appointments) {
      const dateString = appointment.date.toISOString().split("T")[0];
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
