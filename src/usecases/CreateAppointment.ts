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
  date: string;
  hour: string;
  status: Status;
}

export class CreateAppointment {
  async execute(input: InputDto): Promise<OutputDto> {
    const dateTimeString = `${input.date}T${input.hour}:00-03:00`;
    const appointmentDate = new Date(dateTimeString);
    const now = new Date();

    if (appointmentDate < now) {
      throw new CannotCreateAppointmentInThePastError();
    }

    const hasAppointmentInTheSameTime = await prisma.appointment.findFirst({
      where: {
        date: {
          equals: appointmentDate,
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
        date: appointmentDate,
        status: input.status,
      },
    });

    return appointment;
  }
}
