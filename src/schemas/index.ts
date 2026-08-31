import z from "zod";

import { Status } from "@/generated/prisma";

export const ErrorSchema = z.object({
  error: z.string(),
  code: z.string(),
});

export const AppointmentSchema = z.object({
  id: z.uuid(),
  serviceId: z.uuid(),
  userId: z.string(),
  barberId: z.uuid(),
  date: z.coerce.date(),
  status: z.enum(Status),
});

export const CreateAppointmentBodySchema = z.object({
  serviceId: z.uuid(),
  userId: z.string(),
  barberId: z.uuid(),
  date: z.string().transform((val) => {
    const hasTimezone = /(Z|[+-]\d{2}:\d{2})$/.test(val);
    const dateStringWithTimezone = hasTimezone ? val : `${val}-03:00`;

    return new Date(dateStringWithTimezone);
  }),
  status: z.enum(Status),
});

export const GetBarberServicesSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  price: z.number(),
});

export const GetBarbersSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  specialty: z.string(),
  avatarUrl: z.string().nullable(),
});
