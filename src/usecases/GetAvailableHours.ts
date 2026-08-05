import { parseISO } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";

import { TIME_SLOTS } from "@/constants";
import { prisma } from "@/lib/db";

interface OutputDto {
  hours: string[];
}

interface InputDto {
  date: string;
}

export class GetAvailableHours {
  async execute({ date }: InputDto): Promise<OutputDto> {
    const barbersCount = await prisma.barber.count();
    if (barbersCount === 0) return { hours: [] };

    const appointments = await prisma.appointment.findMany({
      where: {
        date: {
          gte: parseISO(`${date}T00:00:00.000-03:00`),
          lte: parseISO(`${date}T23:59:59.999-03:00`),
        },
        status: {
          not: "CANCELLED",
        },
      },
      select: {
        date: true,
      },
    });

    const bookedHours = appointments.map((app) =>
      formatInTimeZone(app.date, "America/Sao_Paulo", "HH:mm"),
    );

    const availableHours = TIME_SLOTS.filter((slot) => {
      const count = bookedHours.filter((hour) => hour === slot).length;
      return count < barbersCount;
    });

    return { hours: availableHours };
  }
}
