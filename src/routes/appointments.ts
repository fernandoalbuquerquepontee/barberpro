import { fromNodeHeaders } from "better-auth/node";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";

import {
  CannotCreateAppointmentInThePastError,
  CannotCreateAppointmentInTheSameTimeError,
} from "@/errors/appointment";
import { auth } from "@/lib/auth";
import {
  AppointmentSchema,
  CreateAppointmentBodySchema,
  ErrorSchema,
} from "@/schemas";
import { CreateAppointment } from "@/usecases/CreateAppointment";
import { GetAppointmentsHistory } from "@/usecases/GetAppointmentsHistory";
import { GetAvailableBarbers } from "@/usecases/GetAvailableBarbers";
import { GetAvailableHours } from "@/usecases/GetAvailableHours";

export const appointmentRoutes = (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/",
    schema: {
      tags: ["Appointments"],
      summary: "Create a new appointment",
      body: CreateAppointmentBodySchema,
      response: {
        201: AppointmentSchema,
        400: ErrorSchema,
        401: ErrorSchema,
        404: ErrorSchema,
        409: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      try {
        const session = await auth.api.getSession({
          headers: fromNodeHeaders(request.headers),
        });

        if (!session) {
          return reply.status(401).send({
            error: "Unauthorized",
            code: "UNAUTHORIZED",
          });
        }

        const createAppointment = new CreateAppointment();

        const result = await createAppointment.execute(request.body);

        return reply.status(201).send(result);
      } catch (error) {
        if (error instanceof CannotCreateAppointmentInThePastError) {
          return reply.status(400).send({
            error: error.message,
            code: "PAST_DATE_ERROR",
          });
        }

        if (error instanceof CannotCreateAppointmentInTheSameTimeError) {
          return reply.status(409).send({
            error: error.message,
            code: "TIME_CONFLICT_ERROR",
          });
        }

        app.log.error(error);
        return reply.status(500).send({
          error: "Internal Server Error",
          code: "INTERNAL_SERVER_ERROR",
        });
      }
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/:userId",
    schema: {
      tags: ["Appointments"],
      summary: "Get all appointments for a user",
      params: z.object({
        userId: z.string(),
      }),
      response: {
        200: z.array(AppointmentSchema),
        401: ErrorSchema,
        404: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      try {
        const session = await auth.api.getSession({
          headers: fromNodeHeaders(request.headers),
        });

        if (!session) {
          return reply.status(401).send({
            error: "Unauthorized",
            code: "UNAUTHORIZED",
          });
        }

        const { userId } = request.params as { userId: string };

        const getAppointmentsHistory = new GetAppointmentsHistory();

        const result = await getAppointmentsHistory.execute({ userId });

        return reply.status(200).send(result);
      } catch (error) {
        app.log.error(error);
        return reply.status(500).send({
          error: "Internal Server Error",
          code: "INTERNAL_SERVER_ERROR",
        });
      }
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/hours",
    schema: {
      tags: ["Appointments"],
      summary: "Get available hours for appointments",
      querystring: z.object({
        date: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/, "Formato deve ser YYYY-MM-DD"),
      }),
      response: {
        200: z.array(z.string()),
        401: ErrorSchema,
        404: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      try {
        const session = await auth.api.getSession({
          headers: fromNodeHeaders(request.headers),
        });

        if (!session) {
          return reply.status(401).send({
            error: "Unauthorized",
            code: "UNAUTHORIZED",
          });
        }

        const { date } = request.query;

        const getAvailableHours = new GetAvailableHours();

        const result = await getAvailableHours.execute({ date });
        return reply.status(200).send(result.hours);
      } catch (error) {
        app.log.error(error);
        return reply.status(500).send({
          error: "Internal Server Error",
          code: "INTERNAL_SERVER_ERROR",
        });
      }
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/available-barbers",
    schema: {
      tags: ["Appointments"],
      sumary: "Get available barbers for a specific date and time",
      querystring: z.object({
        date: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/, "Formato deve ser YYYY-MM-DD"),
        time: z.string().regex(/^\d{2}:\d{2}$/, "Formato deve ser HH:mm"),
      }),
      response: {
        200: z.array(
          z.object({
            id: z.uuid(),
            name: z.string(),
            specialty: z.string(),
            avatarUrl: z.string().nullable(),
            createdAt: z.coerce.date(),
            updatedAt: z.coerce.date(),
          }),
        ),
        401: ErrorSchema,
        404: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      try {
        const session = await auth.api.getSession({
          headers: fromNodeHeaders(request.headers),
        });

        if (!session) {
          return reply.status(401).send({
            error: "Unauthorized",
            code: "UNAUTHORIZED",
          });
        }

        const { date, time } = request.query;

        const getAvailableBarbers = new GetAvailableBarbers();

        const result = await getAvailableBarbers.execute({ date, time });

        return reply.status(200).send(result.barbers);
      } catch (error) {
        app.log.error(error);
        return reply.status(500).send({
          error: "Internal Server Error",
          code: "INTERNAL_SERVER_ERROR",
        });
      }
    },
  });
};
