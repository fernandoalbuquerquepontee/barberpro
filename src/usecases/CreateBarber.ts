import { prisma } from "@/lib/db";

interface OutputDto {
  id: string;
  name: string;
  specialty: string;
  avatarUrl: string;
}

interface InputDto {
  name: string;
  specialty: string;
  avatarUrl: string | null;
  role: string | null | undefined;
}

export class CreateBarberUseCase {
  async execute(input: InputDto): Promise<OutputDto> {
    if (input.role !== "admin") {
      throw new Error("Apenas administradores podem criar barbeiros.");
    }

    const createdBarber = await prisma.barber.create({
      data: {
        name: input.name,
        specialty: input.specialty,
        avatarUrl: input.avatarUrl,
      },
    });

    return {
      id: createdBarber.id,
      name: createdBarber.name,
      specialty: createdBarber.specialty,
      avatarUrl: createdBarber.avatarUrl ?? "",
    };
  }
}
