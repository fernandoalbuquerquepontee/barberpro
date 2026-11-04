import { fromNodeHeaders } from "better-auth/node";
import type { FastifyReply, FastifyRequest } from "fastify";

import { auth } from "@/lib/auth";

type SessionData = typeof auth.$Infer.Session;

declare module "fastify" {
  interface FastifyRequest {
    session: SessionData["session"];
    user: SessionData["user"];
  }
}

export async function verifyAuth(request: FastifyRequest, reply: FastifyReply) {
  const sessionData = await auth.api.getSession({
    headers: fromNodeHeaders(request.headers),
  });

  if (!sessionData) {
    return reply.status(401).send({
      error: "Unauthorized",
      code: "UNAUTHORIZED",
    });
  }

  request.session = sessionData.session;
  request.user = sessionData.user;
}

export async function verifyAdmin(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  if (request.user.role !== "admin") {
    return reply.status(403).send({
      error: "Apenas administradores podem realizar esta ação",
      code: "FORBIDDEN",
    });
  }
}
