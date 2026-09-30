import { fromNodeHeaders } from "better-auth/node";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";

import { auth } from "@/lib/auth";
import { DashboardMetricsSchema, ErrorSchema } from "@/schemas";
import { GetMetricsUseCase } from "@/usecases/GetMetrics";
import { GetRevenueMonthlyUseCase } from "@/usecases/GetRevenueMonthly";

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
};
