import {
  AppointmentNotBelongsToUserError,
  AppointmentNotFoundError,
} from "@/errors/appointment";
import { prisma } from "@/lib/db";

interface OutputDto {
  message: string;
}

interface InputDto {
  appointmentId: string;
  userId: string;
}

export class CancelAppointmentUseCase {
  async execute(input: InputDto): Promise<OutputDto> {
    const appointment = await prisma.appointment.findUnique({
      where: {
        id: input.appointmentId,
      },
    });

    if (!appointment) {
      throw new AppointmentNotFoundError();
    }

    if (appointment.userId !== input.userId) {
      throw new AppointmentNotBelongsToUserError(
        input.userId,
        appointment.userId,
      );
    }

    await prisma.appointment.update({
      where: {
        id: input.appointmentId,
      },
      data: {
        status: "CANCELLED",
      },
    });

    return {
      message: "Reserva cancelada com sucesso",
    };
  }
}
