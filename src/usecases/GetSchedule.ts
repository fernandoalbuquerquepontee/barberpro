import { prisma } from "@/lib/db";

interface InputDto {
  role: string | null | undefined;
}

export class GetScheduleUseCase {
  async execute({ role }: InputDto) {
    if (role !== "admin") {
      throw new Error("Apenas administradores podem fazer essa query");
    }

    const schedules = await prisma.shopSchedule.findMany({
      orderBy: { dayOfWeek: "asc" },
    });

    return schedules;
  }
}
