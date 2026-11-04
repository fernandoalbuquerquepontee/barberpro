import { fromNodeHeaders } from "better-auth/node";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";

import {
  AppointmentNotFoundError,
  CannotCreateAppointmentInThePastError,
  CannotCreateAppointmentInTheSameTimeError,
  ServiceNotFoundError,
} from "@/errors/appointment";
import { auth } from "@/lib/auth";
import { verifyAuth } from "@/middlewares/verify-auth";
import {
  CreateServiceBodySchema,
  DashboardMetricsSchema,
  ErrorSchema,
  GetAllAppointmentsSchema,
  GetBarberServicesSchema,
  GetRevenueAnnualResponseSchema,
  GetRevenueMonthlyResponseSchema,
  GetRevenuePerDayResponseSchema,
  GetUserAppointmentsSchema,
  ScheduleDaySchema,
  TeamPerformanceResponseSchema,
  UpdateAppointmentBodySchema,
  UpdateScheduleBodySchema,
  UpdateServiceBodySchema,
} from "@/schemas";
import { CreateServiceUseCase } from "@/usecases/CreateService";
import { DeleteAppointmentUseCase } from "@/usecases/DeleteAppointment";
import { DeleteServiceUseCase } from "@/usecases/DeleteService";
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
import { UpdateServiceUseCase } from "@/usecases/UpdateService";

export const dashboardRoutes = (app: FastifyInstance) => {
  app.addHook("preHandler", verifyAuth);

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
        const getMetrics = new GetMetricsUseCase();

        const result = await getMetrics.execute({
          role: request.user.role,
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
        200: GetRevenueMonthlyResponseSchema,
        401: ErrorSchema,
        403: ErrorSchema,
        404: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      try {
        const getRevenueMonthly = new GetRevenueMonthlyUseCase();

        const result = await getRevenueMonthly.execute({
          role: request.user.role,
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
        200: GetRevenueAnnualResponseSchema,
        401: ErrorSchema,
        403: ErrorSchema,
        404: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      try {
        const getRevenueAnnual = new GetRevenueAnnualUseCase();

        const result = await getRevenueAnnual.execute({
          role: request.user.role,
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
        200: TeamPerformanceResponseSchema,
        401: ErrorSchema,
        403: ErrorSchema,
        404: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      try {
        const getTeamPerformance = new GetTeamPerformanceUseCase();

        const result = await getTeamPerformance.execute({
          role: request.user.role,
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
        200: GetRevenuePerDayResponseSchema,
        401: ErrorSchema,
        403: ErrorSchema,
        404: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      try {
        const { range } = request.query;

        const getRevenuePerDay = new GetRevenuePerDayUseCase();

        const result = await getRevenuePerDay.execute({
          role: request.user.role,
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
        const updateSchedule = new UpdateScheduleUseCase();

        await updateSchedule.execute({
          schedules: request.body.schedules,
          role: request.user.role,
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
        200: z.array(ScheduleDaySchema),
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
        const result = await getSchedule.execute({
          role: request.user.role,
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
        const getAllAppointments = new GetAllAppointmentsUseCase();

        const result = await getAllAppointments.execute({
          role: request.user.role,
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
        const getAllServices = new GetAllServicesUseCase();

        const result = await getAllServices.execute({
          role: request.user.role,
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
        const { name, price } = request.body;

        const createService = new CreateServiceUseCase();

        const result = await createService.execute({
          name,
          price,
          role: request.user.role,
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
    url: "/services/:serviceId",
    schema: {
      tags: ["Dashboard"],
      summary: "Update a service (dashboard)",
      params: z.object({
        serviceId: z.uuid(),
      }),
      body: UpdateServiceBodySchema,
      response: {
        200: GetBarberServicesSchema,
        401: ErrorSchema,
        403: ErrorSchema,
        404: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      try {
        const { serviceId } = request.params;
        const { name, price } = request.body;

        const updateService = new UpdateServiceUseCase();

        const result = await updateService.execute({
          serviceId,
          role: request.user.role,
          name,
          price,
        });

        return reply.status(200).send(result);
      } catch (error) {
        if (error instanceof ServiceNotFoundError) {
          return reply.status(404).send({
            error: error.message,
            code: "SERVICE_NOT_FOUND",
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
    url: "/services/:serviceId",
    schema: {
      tags: ["Dashboard"],
      summary: "Delete a service (dashboard)",
      params: z.object({
        serviceId: z.uuid(),
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
        const { serviceId } = request.params;

        const deleteService = new DeleteServiceUseCase();

        const result = await deleteService.execute({
          serviceId,
          role: request.user.role,
        });

        return reply.status(200).send(result);
      } catch (error) {
        if (error instanceof ServiceNotFoundError) {
          return reply.status(404).send({
            error: error.message,
            code: "SERVICE_NOT_FOUND",
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
        const { appointmentId } = request.params;
        const { serviceId, barberId, date, hour, status } = request.body;

        const updateAppointment = new UpdateAppointmentUseCase();

        const result = await updateAppointment.execute({
          appointmentId,
          role: request.user.role,
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

        if (error instanceof AppointmentNotFoundError) {
          return reply.status(409).send({
            error: error.message,
            code: "APPOINTMENT_NOT_FOUND",
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
        const { appointmentId } = request.params;

        const deleteAppointment = new DeleteAppointmentUseCase();

        const result = await deleteAppointment.execute({
          appointmentId,
          role: request.user.role,
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

        if (error instanceof AppointmentNotFoundError) {
          return reply.status(404).send({
            error: error.message,
            code: "APPOINTMENT_NOT_FOUND",
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
