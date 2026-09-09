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
  date: z.date(),
  status: z.enum(Status),
});

export const CreateAppointmentBodySchema = z.object({
  serviceId: z.uuid(),
  userId: z.string(),
  barberId: z.uuid(),
  date: z.string(),
  hour: z.string(),
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
