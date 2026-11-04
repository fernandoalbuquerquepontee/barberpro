import { prisma } from "@/lib/db";

interface InputDto {
  schedules: {
    dayOfWeek: number;
    startTime: string | null;
    endTime: string | null;
    isClosed: boolean;
  }[];
  role: string | null | undefined;
}

export class UpdateScheduleUseCase {
  async execute({ schedules, role }: InputDto) {
    if (role !== "admin") {
      throw new Error("Apenas administradores podem fazer essa query");
    }

    const transactions = schedules.map((schedule) =>
      prisma.shopSchedule.upsert({
        where: { dayOfWeek: schedule.dayOfWeek },
        update: {
          startTime: schedule.isClosed ? null : schedule.startTime,
          endTime: schedule.isClosed ? null : schedule.endTime,
          isClosed: schedule.isClosed,
        },
        create: {
          dayOfWeek: schedule.dayOfWeek,
          startTime: schedule.isClosed ? null : schedule.startTime,
          endTime: schedule.isClosed ? null : schedule.endTime,
          isClosed: schedule.isClosed,
        },
      }),
    );

    await prisma.$transaction(transactions);
  }
}
