import { prisma } from "@/lib/db";

interface UpdateScheduleRequest {
  schedules: {
    dayOfWeek: number;
    startTime: string | null;
    endTime: string | null;
    isClosed: boolean;
  }[];
}

export class UpdateScheduleUseCase {
  async execute({ schedules }: UpdateScheduleRequest) {
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
