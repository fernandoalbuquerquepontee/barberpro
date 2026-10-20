import { prisma } from "@/lib/db";

interface OutputDto {
  message: string;
}

interface InputDto {
  appointmentId: string;
  role: string | null | undefined;
}

export class DeleteAppointmentUseCase {
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

    await prisma.appointment.delete({
      where: { id: input.appointmentId },
    });

    return {
      message: "Reserva excluída com sucesso",
    };
  }
}
