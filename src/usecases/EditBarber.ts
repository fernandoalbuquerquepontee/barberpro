import { prisma } from "@/lib/db";

interface OutputDto {
  id: string;
  name: string;
  specialty: string;
  avatarUrl: string | null;
}

interface InputDto {
  userId: string;
  role: string | null | undefined;
  name?: string;
  specialty?: string;
  avatarUrl?: string | null;
}

export class EditBarberUseCase {
  async execute(input: InputDto): Promise<OutputDto> {
    if (input.role !== "admin") {
      throw new Error("Apenas administradores podem editar barbeiros.");
    }

    const updatedBarber = await prisma.barber.update({
      where: {
        id: input.userId,
      },
      data: {
        name: input.name,
        specialty: input.specialty,
        avatarUrl: input.avatarUrl,
      },
    });

    return updatedBarber;
  }
}
