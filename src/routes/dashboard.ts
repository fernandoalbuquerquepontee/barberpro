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
  CreateServiceBodySchema,
  DashboardMetricsSchema,
  ErrorSchema,
  GetAllAppointmentsSchema,
  GetBarberServicesSchema,
  GetUserAppointmentsSchema,
  UpdateAppointmentBodySchema,
  UpdateScheduleBodySchema,
} from "@/schemas";
import { CreateServiceUseCase } from "@/usecases/CreateService";
import { DeleteAppointmentUseCase } from "@/usecases/DeleteAppointment";
import { GetAllAppointmentsUseCase } from "@/usecases/GetAllAppointments";
import { GetAllServicesUseCase } from "@/usecases/GetAllServices";
import { GetMetricsUseCase } from "@/usecases/GetMetrics";
import { GetRevenueAnnualUseCase } from "@/usecases/GetRevenueAnnual";
import { GetRevenueMonthlyUseCase } from "@/usecases/GetRevenueMonthly";
import { GetRevenuePerDayUseCase } from "@/usecases/GetRevenuePerDay";
import { GetScheduleUseCase } from "@/usecases/GetSchedule";
import { GetTeamPerformanceUseCase } from "@/usecases/GetTeamPerformance";
import { UpdateAppointmentUseCase } from "@/usecases/UpdateAppointment";
import { UpdateScheduleUseCase } from "@/usecases/UpdateSchedule";

export const dashboardRoutes = (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/metrics",
    schema: {
      tags: ["Dashboard"],
      summary: "Get metrics",
      response: {
        200: DashboardMetricsSchema,
        401: ErrorSchema,
        403: ErrorSchema,
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

        const getMetrics = new GetMetricsUseCase();

        const result = await getMetrics.execute({
          role: session.user.role,
        });

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
    url: "/revenue/monthly",
    schema: {
      tags: ["Dashboard"],
      summary: "Get revenue monthly",
      response: {
        200: z.array(
          z.object({
            month: z.string(),
            revenue: z.number(),
          }),
        ),
        401: ErrorSchema,
        403: ErrorSchema,
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

        const getRevenueMonthly = new GetRevenueMonthlyUseCase();

        const result = await getRevenueMonthly.execute({
          role: session.user.role,
        });

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
    url: "/revenue/annual",
    schema: {
      tags: ["Dashboard"],
      summary: "Get revenue annual",
      response: {
        200: z.array(
          z.object({
            year: z.string(),
            revenue: z.number(),
          }),
        ),
        401: ErrorSchema,
        403: ErrorSchema,
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

        const getRevenueAnnual = new GetRevenueAnnualUseCase();

        const result = await getRevenueAnnual.execute({
          role: session.user.role,
        });

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
    url: "/team-performance",
    schema: {
      tags: ["Dashboard"],
      summary: "Get team performance",
      response: {
        200: z.array(
          z.object({
            id: z.string(),
            name: z.string(),
            avatarUrl: z.string().nullable(),
            totalAppointments: z.number(),
            revenue: z.number(),
          }),
        ),
        401: z.object({
          error: z.string(),
          code: z.string(),
        }),
        500: z.object({
          error: z.string(),
          code: z.string(),
        }),
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

        const getTeamPerformance = new GetTeamPerformanceUseCase();

        const result = await getTeamPerformance.execute({
          role: session.user.role,
        });

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
    url: "/revenue/perDay",
    schema: {
      tags: ["Dashboard"],
      summary: "Get revenue per day",
      querystring: z.object({
        range: z.enum(["7d", "30d", "90d"]).default("30d"),
      }),
      response: {
        200: z.array(
          z.object({
            date: z.string(),
            revenue: z.number(),
          }),
        ),
        401: ErrorSchema,
        403: ErrorSchema,
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

        const { range } = request.query;

        const getRevenuePerDay = new GetRevenuePerDayUseCase();

        const result = await getRevenuePerDay.execute({
          role: session.user.role,
          range,
        });

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
    method: "PUT",
    url: "/schedule",
    schema: {
      tags: ["Dashboard"],
      summary: "Update shop schedule",
      body: UpdateScheduleBodySchema,
      response: {
        200: z.object({ message: z.string() }),
        401: ErrorSchema,
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

        const updateSchedule = new UpdateScheduleUseCase();

        await updateSchedule.execute({
          schedules: request.body.schedules,
        });

        return reply
          .status(200)
          .send({ message: "Escala atualizada com sucesso" });
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
    url: "/schedule",
    schema: {
      tags: ["Dashboard"],
      summary: "Get shop schedule",
      response: {
        200: z.array(
          z.object({
            dayOfWeek: z.number(),
            startTime: z.string().nullable(),
            endTime: z.string().nullable(),
            isClosed: z.boolean(),
          }),
        ),
        401: ErrorSchema,
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

        const getSchedule = new GetScheduleUseCase();
        const result = await getSchedule.execute();

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
    url: "/appointments",
    schema: {
      tags: ["Dashboard"],
      summary: "Get all appointments (dashboard)",
      response: {
        200: z.array(GetAllAppointmentsSchema),
        401: ErrorSchema,
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

        const getAllAppointments = new GetAllAppointmentsUseCase();

        const result = await getAllAppointments.execute({
          role: session.user.role,
        });

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
    url: "/services",
    schema: {
      tags: ["Dashboard"],
      summary: "Get all services (dashboard)",
      response: {
        200: z.array(GetBarberServicesSchema),
        401: ErrorSchema,
        403: ErrorSchema,
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

        const getAllServices = new GetAllServicesUseCase();

        const result = await getAllServices.execute({
          role: session.user.role,
        });

        return reply.status(200).send(result);
      } catch (error) {
        if (
          error instanceof Error &&
          error.message.includes("administradores")
        ) {
          return reply.status(403).send({
            error: error.message,
            code: "FORBIDDEN",
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
    method: "POST",
    url: "/services",
    schema: {
      tags: ["Dashboard"],
      summary: "Create a service (dashboard)",
      body: CreateServiceBodySchema,
      response: {
        201: GetBarberServicesSchema,
        401: ErrorSchema,
        403: ErrorSchema,
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

        const { name, price } = request.body;

        const createService = new CreateServiceUseCase();

        const result = await createService.execute({
          name,
          price,
          role: session.user.role,
        });

        return reply.status(201).send(result);
      } catch (error) {
        if (
          error instanceof Error &&
          error.message.includes("administradores")
        ) {
          return reply.status(403).send({
            error: error.message,
            code: "FORBIDDEN",
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
    method: "PATCH",
    url: "/appointments/:appointmentId",
    schema: {
      tags: ["Dashboard"],
      summary: "Update an appointment (dashboard)",
      params: z.object({
        appointmentId: z.uuid(),
      }),
      body: UpdateAppointmentBodySchema,
      response: {
        200: GetUserAppointmentsSchema,
        400: ErrorSchema,
        401: ErrorSchema,
        403: ErrorSchema,
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

        const { appointmentId } = request.params;
        const { serviceId, barberId, date, hour, status } = request.body;

        const updateAppointment = new UpdateAppointmentUseCase();

        const result = await updateAppointment.execute({
          appointmentId,
          role: session.user.role,
          serviceId,
          barberId,
          date,
          hour,
          status,
        });

        return reply.status(200).send(result);
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

        if (
          error instanceof Error &&
          error.message.includes("administradores")
        ) {
          return reply.status(403).send({
            error: error.message,
            code: "FORBIDDEN",
          });
        }

        if (
          error instanceof Error &&
          error.message.includes("não encontrada")
        ) {
          return reply.status(404).send({
            error: error.message,
            code: "NOT_FOUND",
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
    method: "DELETE",
    url: "/appointments/:appointmentId",
    schema: {
      tags: ["Dashboard"],
      summary: "Delete an appointment (dashboard)",
      params: z.object({
        appointmentId: z.uuid(),
      }),
      response: {
        200: z.object({ message: z.string() }),
        401: ErrorSchema,
        403: ErrorSchema,
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

        const { appointmentId } = request.params;

        const deleteAppointment = new DeleteAppointmentUseCase();

        const result = await deleteAppointment.execute({
          appointmentId,
          role: session.user.role,
        });

        return reply.status(200).send(result);
      } catch (error) {
        if (
          error instanceof Error &&
          error.message.includes("administradores")
        ) {
          return reply.status(403).send({
            error: error.message,
            code: "FORBIDDEN",
          });
        }

        if (
          error instanceof Error &&
          error.message.includes("não encontrada")
        ) {
          return reply.status(404).send({
            error: error.message,
            code: "NOT_FOUND",
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
};
