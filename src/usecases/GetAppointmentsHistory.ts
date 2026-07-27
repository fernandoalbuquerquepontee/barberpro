import type { Status } from "@/generated/prisma";
import { prisma } from "@/lib/db";

interface OutputDto {
  id: string;
  serviceId: string;
  userId: string;
  barberId: string;
  date: Date;
  status: Status;
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
      },
    });
  }
}
