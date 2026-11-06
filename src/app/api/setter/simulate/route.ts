// web/src/app/api/setter/simulate/route.ts
import { NextResponse } from "next/server";
import { generateSetterReply, ConversationHistoryItem } from "@/lib/setter-ai";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { config, messages, userMessage } = body;

    if (!userMessage || typeof userMessage !== "string" || !userMessage.trim()) {
      return NextResponse.json(
        { error: "El mensaje del usuario no puede estar vacío." },
        { status: 400 }
      );
    }

    const history: ConversationHistoryItem[] = Array.isArray(messages)
      ? messages.map((m: any) => ({
          role: m.role === "assistant" ? "assistant" : "user",
          content: String(m.content || ""),
        }))
      : [];

    // Generar respuesta en tiempo real con DeepSeek
    const reply = await generateSetterReply(
      config || {},
      history,
      userMessage.trim()
    );

    return NextResponse.json({
      success: true,
      reply,
    });
  } catch (error) {
    console.error("Error en /api/setter/simulate:", error);
    return NextResponse.json(
      { error: "Error al generar la simulación con IA." },
      { status: 500 }
    );
  }
}

