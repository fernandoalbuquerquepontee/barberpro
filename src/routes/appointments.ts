import { fromNodeHeaders } from "better-auth/node";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";

import { Status } from "@/generated/prisma";
import { auth } from "@/lib/auth";
import { ErrorSchema } from "@/schemas";
import { CreateAppointment } from "@/usecases/CreateAppointment";
import { GetAppointmentsHistory } from "@/usecases/GetAppointmentsHistory";

export const appointmentRoutes = (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/appointments",
    schema: {
      tags: ["Appointments"],
      summary: "Create a new appointment",
      body: z.object({
        serviceId: z.uuid(),
        userId: z.string(),
        barberId: z.uuid(),
        date: z.coerce.date(),
        status: z.enum(Status),
      }),
      response: {
        201: z.object({
          id: z.uuid(),
          serviceId: z.uuid(),
          userId: z.string(),
          barberId: z.uuid(),
          date: z.coerce.date(),
          status: z.enum(Status),
        }),
        400: ErrorSchema,
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

        const createAppointment = new CreateAppointment();

        const result = await createAppointment.execute(request.body);

        return reply.status(201).send(result);
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
    url: "/appointments/:userId",
    schema: {
      tags: ["Appointments"],
      summary: "Get all appointments for a user",
      params: z.object({
        userId: z.string(),
      }),
      response: {
        200: z.array(
          z.object({
            id: z.uuid(),
            serviceId: z.uuid(),
            userId: z.string(),
            barberId: z.uuid(),
            date: z.coerce.date(),
            status: z.enum(Status),
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
};
