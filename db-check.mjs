// db-check.mjs (temporal) - conteo de filas en la DB de produccion
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const [u, sc, cr, ig, cv] = await prisma.$transaction([
  prisma.user.count(),
  prisma.setterConfig.count(),
  prisma.contactRequest.count(),
  prisma.igAccount.count(),
  prisma.conversation.count(),
]);
console.log("User:", u, "| SetterConfig:", sc, "| ContactRequest:", cr, "| IgAccount:", ig, "| Conversation:", cv);

if (cr > 0) {
  const leads = await prisma.contactRequest.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
    select: { id: true, name: true, email: true, status: true, createdAt: true },
  });
  console.log("\nUltimas solicitudes (ContactRequest):");
  for (const l of leads) {
    console.log(` - #${l.id} | ${l.name} | ${l.email} | ${l.status} | ${l.createdAt.toISOString()}`);
  }
}

await prisma.$disconnect();
