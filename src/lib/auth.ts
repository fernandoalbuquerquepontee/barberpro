import { PrismaPg } from "@prisma/adapter-pg";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin, openAPI, phoneNumber } from "better-auth/plugins"; // 1. Importe o phoneNumber

import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:8080",
  trustedOrigins: [
    "http://localhost:3000",
    "http://localhost:8080",
    "http://127.0.0.1:8080",
    "http://localhost:5173",
    "http://localhost:5174",
    "https://barber-pro-umber.vercel.app",
  ],
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  emailAndPassword: {
    enabled: true,
  },
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  logger: {
    level: "error",
  },
  plugins: [
    openAPI(),
    admin(),
    phoneNumber({
      sendOTP: async ({ phoneNumber, code }) => {
        console.log(
          `\n[BETTER AUTH] -> Enviar WhatsApp para ${phoneNumber} com o código: ${code}\n`,
        );
      },
      signUpOnVerification: {
        getTempEmail: (phoneNumber) => {
          return `${phoneNumber.replace("+", "")}@barberpro.com`;
        },
        getTempName: () => {
          return "Cliente";
        },
      },
    }),
  ],
  advanced: {
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
    },
  },
});
