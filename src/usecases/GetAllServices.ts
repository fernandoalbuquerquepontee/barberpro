import { prisma } from "@/lib/db";

interface OutputDto {
  id: string;
  name: string;
  price: number;
}

interface InputDto {
  role: string | null | undefined;
}

export class GetAllServicesUseCase {
  async execute(input: InputDto): Promise<OutputDto[]> {
    if (input.role !== "admin") {
      throw new Error("Apenas administradores podem fazer essa query");
    }

    return await prisma.service.findMany({
      select: {
        id: true,
        name: true,
        price: true,
      },
    });
  }
}
