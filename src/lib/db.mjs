import { PrismaClient } from "@prisma/client";
export const db = global.prisma || new PrismaClient({log: ['query', 'info', 'warn', 'error'], errorFormat: 'pretty'});
if (process.env.NODE_ENV !== "production") {
    global.prisma = db;
}
