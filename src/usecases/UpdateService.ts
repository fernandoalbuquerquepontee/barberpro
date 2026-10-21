import { prisma } from "@/lib/db";

interface OutputDto {
  id: string;
  name: string;
  price: number;
}

interface InputDto {
  serviceId: string;
  role: string | null | undefined;
  name?: string;
  price?: number;
}

export class UpdateServiceUseCase {
  async execute(input: InputDto): Promise<OutputDto> {
    if (input.role !== "admin") {
      throw new Error("Apenas administradores podem fazer essa query");
    }

    const service = await prisma.service.findUnique({
      where: { id: input.serviceId },
    });

    if (!service) {
      throw new Error("Serviço não encontrado.");
    }

    return await prisma.service.update({
      where: { id: input.serviceId },
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
