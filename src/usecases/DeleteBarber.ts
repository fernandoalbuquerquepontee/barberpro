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
}

export class DeleteBarber {
  async execute(input: InputDto): Promise<OutputDto> {
    if (input.role !== "admin") {
      throw new Error();
    }

    const deletedBarber = await prisma.barber.delete({
      where: {
        id: input.userId,
      },
    });

    return deletedBarber;
  }
}
