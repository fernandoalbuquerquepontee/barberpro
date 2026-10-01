import { fromNodeHeaders } from "better-auth/node";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";

import { auth } from "@/lib/auth";
import { DashboardMetricsSchema, ErrorSchema } from "@/schemas";
import { GetMetricsUseCase } from "@/usecases/GetMetrics";
import { GetRevenueAnnualUseCase } from "@/usecases/GetRevenueAnnual";
import { GetRevenueMonthlyUseCase } from "@/usecases/GetRevenueMonthly";
import { GetTeamPerformanceUseCase } from "@/usecases/GetTeamPerformance";

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
};
