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
      throw new Error("Reserva não encontrada.");
    }

    if (appointment.userId !== input.userId) {
      throw new Error("Você não tem permissão para cancelar esta reserva.");
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
