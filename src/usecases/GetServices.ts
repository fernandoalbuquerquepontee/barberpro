import { prisma } from "@/lib/db";

interface OutputDto {
  id: string;
  name: string;
  price: number;
}

export class GetServicesData {
  async execute(): Promise<OutputDto[]> {
    return await prisma.service.findMany({
      select: {
        id: true,
        name: true,
        price: true,
      },
    });
  }
}
