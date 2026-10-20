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
  service: { name: string };
  barber: { name: string };
}

interface InputDto {
  appointmentId: string;
  role: string | null | undefined;
  serviceId?: string;
  barberId?: string;
  date?: string;
  hour?: string;
  status?: Status;
}

export class UpdateAppointmentUseCase {
  async execute(input: InputDto): Promise<OutputDto> {
    if (input.role !== "admin") {
      throw new Error("Apenas administradores podem fazer essa query");
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: input.appointmentId },
    });

    if (!appointment) {
      throw new Error("Reserva não encontrada.");
    }

    const isRescheduling =
      input.date ||
      input.hour ||
      (input.barberId && input.barberId !== appointment.barberId);
    let nextDate = appointment.date;

    if (isRescheduling) {
      const dateStr =
        input.date ??
        formatInTimeZone(appointment.date, "America/Sao_Paulo", "yyyy-MM-dd");
      const hourStr =
        input.hour ??
        formatInTimeZone(appointment.date, "America/Sao_Paulo", "HH:mm");
      nextDate = new Date(`${dateStr}T${hourStr}:00-03:00`);

      if (nextDate < new Date()) {
        throw new CannotCreateAppointmentInThePastError();
      }

      const conflict = await prisma.appointment.findFirst({
        where: {
          id: { not: input.appointmentId },
          date: nextDate,
          barberId: input.barberId ?? appointment.barberId,
        },
      });

      if (conflict) {
        throw new CannotCreateAppointmentInTheSameTimeError(
          formatInTimeZone(nextDate, "America/Sao_Paulo", "HH:mm"),
        );
      }
    }

    return await prisma.appointment.update({
      where: { id: input.appointmentId },
      data: {
        serviceId: input.serviceId,
        barberId: input.barberId,
        date: isRescheduling ? nextDate : undefined,
        status: input.status,
      },
      include: {
        service: { select: { name: true } },
        barber: { select: { name: true } },
      },
    });
  }
}
