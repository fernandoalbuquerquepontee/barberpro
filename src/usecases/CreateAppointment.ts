import { formatInTimeZone } from "date-fns-tz";

import {
  CannotCreateAppointmentInThePastError,
  CannotCreateAppointmentInTheSameTimeError,
} from "@/errors/appointment";
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

    const hasAppointmentInTheSameTime = await prisma.appointment.findFirst({
      where: {
        date: {
          equals: input.date,
        },
        barberId: input.barberId,
      },
    });

    if (hasAppointmentInTheSameTime) {
      throw new CannotCreateAppointmentInTheSameTimeError(
        formatInTimeZone(input.date, "America/Sao_Paulo", "HH:mm"),
      );
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
