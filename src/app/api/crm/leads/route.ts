// web/src/app/api/crm/leads/route.ts
// Solicitudes del formulario de contacto para el CRM interno (/crm).
// GET   -> lista todas las solicitudes, más recientes primero
// PATCH -> actualiza status y/o adminNote de una solicitud
// Requiere sesión de CRM (cookie firmada por /api/crm/session).

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { CRM_STATUSES, CRM_STATUS_LABELS, getCrmSession, type CrmStatus } from "@/lib/crm";

// GET /api/crm/leads
export async function GET() {
  const session = await getCrmSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  try {
    const leads = await prisma.contactRequest.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      leads: leads.map((lead) => ({
        ...lead,
        statusLabel: CRM_STATUS_LABELS[lead.status as CrmStatus] ?? lead.status,
      })),
    });
  } catch (error) {
    console.error("Error al listar solicitudes en /api/crm/leads:", error);
    return NextResponse.json(
      { error: "Error interno al leer las solicitudes." },
      { status: 500 }
    );
  }
}

// PATCH /api/crm/leads  body: { id, status?, adminNote? }
export async function PATCH(request: Request) {
  const session = await getCrmSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const id = Number(body?.id);
    const status = body?.status === undefined ? undefined : String(body.status);
    const adminNote = body?.adminNote === undefined ? undefined : String(body.adminNote);

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ error: "ID inválido." }, { status: 400 });
    }
    if (status !== undefined && !(CRM_STATUSES as readonly string[]).includes(status)) {
      return NextResponse.json({ error: "Estado inválido." }, { status: 400 });
    }
    if (status === undefined && adminNote === undefined) {
      return NextResponse.json({ error: "No hay nada que actualizar." }, { status: 400 });
    }

    const lead = await prisma.contactRequest.update({
      where: { id },
      data: {
        ...(status !== undefined ? { status } : {}),
        ...(adminNote !== undefined ? { adminNote } : {}),
      },
    });

    return NextResponse.json({
      success: true,
      lead: { ...lead, statusLabel: CRM_STATUS_LABELS[lead.status as CrmStatus] ?? lead.status },
    });
  } catch (error) {
    console.error("Error al actualizar solicitud en /api/crm/leads:", error);
    return NextResponse.json(
      { error: "Error interno al actualizar la solicitud." },
      { status: 500 }
    );
  }
}
