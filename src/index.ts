import "dotenv/config";

import fastifyCors from "@fastify/cors";
import fastifySwagger from "@fastify/swagger";
import fastifyApiReference from "@scalar/fastify-api-reference";
import Fastify from "fastify";
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from "fastify-type-provider-zod";

import { auth } from "./lib/auth";
import { appointmentRoutes } from "./routes/appointments";
import { barberRoutes } from "./routes/barbers";

const app = Fastify({
  logger: true,
  trustProxy: true,
});

await app.register(fastifyCors, {
  origin: [
    "http://localhost:3000",
    "http://localhost:8080",
    "http://localhost:5174",
    "http://127.0.0.1:8080",
    "https://barberpro-ap33.onrender.com",
    "https://barber-pro-umber.vercel.app",
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
});

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

await app.register(fastifySwagger, {
  openapi: {
    info: {
      title: "BarberPRO API",
      description:
        "API para o gerenciamento de agendamentos e serviços de barbearia",
      version: "1.0.0",
    },
    servers: [
      {
        description: "Production",
        url: "https://barberpro-ap33.onrender.com",
      },
      {
        description: "Localhost",
        url: "http://localhost:8080",
      },
    ],
  },
  transform: jsonSchemaTransform,
});

await app.register(fastifyApiReference, {
  routePrefix: "/docs",
  configuration: {
    sources: [
      {
        title: "BarberPRO API",
        slug: "barberpro-api",
        url: "/swagger.json",
      },
      {
        title: "Auth API",
        slug: "auth-api",
        url: "/api/auth/open-api/generate-schema",
      },
    ],
  },
});

app.withTypeProvider<ZodTypeProvider>().route({
  method: "GET",
  url: "/swagger.json",
  schema: {
    hide: true,
  },
  handler: async () => {
    return app.swagger();
  },
});

await app.register(barberRoutes, { prefix: "/barbers" });
await app.register(appointmentRoutes, { prefix: "/appointments" });

app.route({
  method: ["GET", "POST"],
  url: "/api/auth/*",
  async handler(request, reply) {
    try {
      const protocol =
        (request.headers["x-forwarded-proto"] as string) || "http";
      const url = new URL(request.url, `${protocol}://${request.headers.host}`);

      const headers = new Headers();
      Object.entries(request.headers).forEach(([key, value]) => {
        if (value) headers.append(key, value.toString());
      });

      const req = new Request(url.toString(), {
        method: request.method,
        headers,
        ...(request.body ? { body: JSON.stringify(request.body) } : {}),
      });

      const response = await auth.handler(req);
      reply.status(response.status);

      const setCookies = response.headers.getSetCookie();
      if (setCookies && setCookies.length > 0) {
        reply.raw.setHeader("set-cookie", setCookies);
      }

      response.headers.forEach((value, key) => {
        if (key.toLowerCase() !== "set-cookie") {
          reply.header(key, value);
        }
      });

      reply.send(response.body ? await response.text() : null);
    } catch (error) {
      app.log.error(error);
      reply.status(500).send({
        error: "Internal authentication error",
        code: "AUTH_FAILURE",
      });
    }
  },
});

try {
  await app.listen({
    port: Number(process.env.PORT) || 8080,
    host: "0.0.0.0",
  });
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
