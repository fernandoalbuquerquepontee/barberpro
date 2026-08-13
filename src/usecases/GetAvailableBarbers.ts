import type { Barber } from "@/generated/prisma";
import { prisma } from "@/lib/db";

interface OutputDto {
  barbers: Barber[];
}

interface InputDto {
  date: string | Date;
  time: string;
}

export class GetAvailableBarbers {
  async execute(input: InputDto): Promise<OutputDto> {
    const date = input.date;
    const time = input.time;

    const allBarbers = await prisma.barber.findMany();

    const appointments = await prisma.appointment.findMany({
      where: {
        date: {
          gte: new Date(`${date}T${time}:00.000-03:00`),
          lte: new Date(`${date}T${time}:59.999-03:00`),
        },
      },
    });

    const bookedBarbers = appointments.map(
      (appointment) => appointment.barberId,
    );

    const availableBarbers = allBarbers.filter(
      (barber) => !bookedBarbers.includes(barber.id),
    );

    return { barbers: availableBarbers };
  }
}
