import type { Status } from "@/generated/prisma";
import { prisma } from "@/lib/db";

interface OutputDto {
  id: string;
  serviceId: string;
  userId: string;
  barberId: string;
  date: Date;
  status: Status;
  service: {
    name: string;
  };
  barber: {
    name: string;
  };
}

interface InputDto {
  userId: string;
}

export class GetAppointmentsHistory {
  async execute({ userId }: InputDto): Promise<OutputDto[]> {
    return await prisma.appointment.findMany({
      where: {
        userId: userId,
      },
      select: {
        id: true,
        serviceId: true,
        userId: true,
        barberId: true,
        date: true,
        status: true,
        service: {
          select: {
            name: true,
          },
        },
        barber: {
          select: {
            name: true,
          },
        },
      },
    });
  }
}
