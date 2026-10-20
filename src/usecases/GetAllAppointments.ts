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
  role: string | null | undefined;
}

export class GetAllAppointmentsUseCase {
  async execute(input: InputDto): Promise<OutputDto[]> {
    if (input.role !== "admin") {
      throw new Error("Apenas administradores podem fazer essa query");
    }

    return await prisma.appointment.findMany({
      include: {
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
