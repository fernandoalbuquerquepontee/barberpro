import { prisma } from "@/lib/db";

export class GetScheduleUseCase {
  async execute() {
    const schedules = await prisma.shopSchedule.findMany({
      orderBy: { dayOfWeek: "asc" },
    });

    return schedules;
  }
}
