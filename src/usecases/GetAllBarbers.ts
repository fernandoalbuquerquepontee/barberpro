import { prisma } from "@/lib/db";

interface OutputDto {
  id: string;
  name: string;
  specialty: string;
  avatarUrl: string | null;
}

export class GetAllBarbersUseCase {
  async execute(): Promise<OutputDto[]> {
    const result = await prisma.barber.findMany();

    return result;
  }
}
