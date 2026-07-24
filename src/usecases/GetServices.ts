import { prisma } from "@/lib/db";

interface OutputDto {
  id: string;
  name: string;
  price: number;
}

export class GetServicesData {
  async execute(): Promise<OutputDto[]> {
    const services = await prisma.service.findMany();

    return services.map((service) => ({
      id: service.id,
      name: service.name,
      price: service.price,
    }));
  }
}
