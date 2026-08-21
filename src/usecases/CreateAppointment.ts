import { CannotCreateAppointmentInThePastError } from "@/errors/appointment";
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
  serviceId: string;
  userId: string;
  barberId: string;
  date: Date;
  status: Status;
}

export class CreateAppointment {
  async execute(input: InputDto): Promise<OutputDto> {
    const now = new Date();

    if (input.date < now) {
      throw new CannotCreateAppointmentInThePastError();
    }

    const appointment = await prisma.appointment.create({
      data: {
        serviceId: input.serviceId,
        userId: input.userId,
        barberId: input.barberId,
        date: input.date,
        status: input.status,
      },
    });

    return appointment;
  }
}
