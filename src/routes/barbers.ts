import { fromNodeHeaders } from "better-auth/node";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";

import { auth } from "@/lib/auth";
import {
  ErrorSchema,
  GetBarberServicesSchema,
  GetBarbersSchema,
} from "@/schemas";
import { CreateBarberUseCase } from "@/usecases/CreateBarber";
import { DeleteBarber } from "@/usecases/DeleteBarber";
import { GetAllBarbersUseCase } from "@/usecases/GetAllBarbers";
import { GetServicesData } from "@/usecases/GetServices";

export const barberRoutes = (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/services",
    schema: {
      tags: ["Barbers"],
      summary: "Get all services",
      response: {
        200: z.array(GetBarberServicesSchema),
        401: ErrorSchema,
        404: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      try {
        const getServicesData = new GetServicesData();
        const result = await getServicesData.execute();

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
    url: "/",
    schema: {
      tags: ["Barbers"],
      summary: "Get all barbers",
      response: {
        200: z.array(GetBarbersSchema),
        401: ErrorSchema,
        404: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (_request, reply) => {
      try {
        const getAllBarbers = new GetAllBarbersUseCase();

        const result = await getAllBarbers.execute();

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
    method: "DELETE",
    url: "/:userId",
    schema: {
      tags: ["Barbers"],
      summary: "Delete barber",
      params: z.object({
        userId: z.string(),
      }),
      response: {
        200: GetBarbersSchema,
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

        const { userId } = request.params as { userId: string };

        const deleteBarber = new DeleteBarber();

        const result = await deleteBarber.execute({
          userId: userId,
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
    method: "POST",
    url: "/",
    schema: {
      tags: ["Barbers"],
      summary: "Create barber",
      body: z.object({
        name: z.string(),
        specialty: z.string(),
        avatarUrl: z.url(),
      }),
      response: {
        200: GetBarbersSchema,
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

        const { name, specialty, avatarUrl } = request.body;

        const createBarber = new CreateBarberUseCase();

        const result = await createBarber.execute({
          name,
          specialty,
          avatarUrl,
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
