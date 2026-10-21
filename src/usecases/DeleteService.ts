import { prisma } from "@/lib/db";

interface OutputDto {
  message: string;
}

interface InputDto {
  serviceId: string;
  role: string | null | undefined;
}

export class DeleteServiceUseCase {
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

    await prisma.service.delete({
      where: { id: input.serviceId },
    });

    return {
      message: "Serviço excluído com sucesso",
    };
  }
}
