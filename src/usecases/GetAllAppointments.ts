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
  user: {
    name: string;
    phoneNumber: string | null;
    image: string | null;
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
        user: {
          select: {
            name: true,
            phoneNumber: true,
            image: true,
          },
        },
      },
    });
  }
}
