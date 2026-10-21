import z from "zod";

import { Status } from "@/generated/prisma";

export const ErrorSchema = z.object({
  error: z.string(),
  code: z.string(),
});

export const CreateAppointmentSchema = z.object({
  id: z.uuid(),
  serviceId: z.uuid(),
  userId: z.string(),
  barberId: z.uuid(),
  date: z.date(),
  status: z.enum(Status),
});

export const GetUserAppointmentsSchema = z.object({
  id: z.uuid(),
  serviceId: z.uuid(),
  userId: z.string(),
  barberId: z.uuid(),
  date: z.date(),
  status: z.enum(Status),
  service: z.object({
    name: z.string(),
  }),
  barber: z.object({
    name: z.string(),
  }),
});

export const GetAllAppointmentsSchema = z.object({
  id: z.uuid(),
  serviceId: z.uuid(),
  userId: z.string(),
  barberId: z.uuid(),
  date: z.date(),
  status: z.enum(Status),
  service: z.object({
    name: z.string(),
  }),
  barber: z.object({
    name: z.string(),
  }),
  user: z.object({
    name: z.string(),
    phoneNumber: z.string().nullable(),
    image: z.string().nullable().optional(),
  }),
});

export const CreateAppointmentBodySchema = z.object({
  serviceId: z.uuid(),
  userId: z.string(),
  barberId: z.uuid(),
  date: z.string(),
  hour: z.string(),
  status: z.enum(Status),
});

export const UpdateAppointmentBodySchema = z.object({
  serviceId: z.uuid().optional(),
  barberId: z.uuid().optional(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Formato deve ser YYYY-MM-DD")
    .optional(),
  hour: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Formato deve ser HH:mm")
    .optional(),
  status: z.enum(Status).optional(),
});

export const GetBarberServicesSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  price: z.number(),
});

export const CreateServiceBodySchema = z.object({
  name: z.string(),
  price: z.number(),
});

export const UpdateServiceBodySchema = z.object({
  name: z.string().optional(),
  price: z.number().optional(),
});

export const GetBarbersSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  specialty: z.string(),
  avatarUrl: z.string().nullable(),
});

export const DashboardMetricsSchema = z.object({
  revenueToday: z.number(),
  totalReservations: z.number(),
  attendedClients: z.number(),
});

export const ScheduleDaySchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().nullable(),
  endTime: z.string().nullable(),
  isClosed: z.boolean(),
});

export const UpdateScheduleBodySchema = z.object({
  schedules: z.array(ScheduleDaySchema),
});
