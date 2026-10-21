import { prisma } from "@/lib/db";

interface OutputDto {
  id: string;
  name: string;
  price: number;
}

interface InputDto {
  name: string;
  price: number;
  role: string | null | undefined;
}

export class CreateServiceUseCase {
  async execute(input: InputDto): Promise<OutputDto> {
    if (input.role !== "admin") {
      throw new Error("Apenas administradores podem fazer essa query");
    }

    return await prisma.service.create({
      data: {
        name: input.name,
        price: input.price,
      },
      select: {
        id: true,
        name: true,
        price: true,
      },
    });
  }
}
