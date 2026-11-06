/**
 * Motor de AutoSetter IA — Settingfly
 * Integrado con DeepSeek API y alineado con la metodología sSetter-nacho
 */

export interface ConversationHistoryItem {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
}

/**
 * Genera el System Prompt dinámico a partir de la configuración del usuario en MySQL
 */
export function buildDynamicSetterPrompt(config: any): string {
  const businessName = config?.businessName || "Settingfly";
  const offerDescription = config?.offerDescription || "Automatización y calificación de prospectos con IA para Instagram";
  const targetAudience = config?.targetAudience || "Dueños de negocios, agencias y creadores B2B";
  const priceRange = config?.priceRange || "$500 - $1,500 USD";
  const setterName = config?.setterName || "Asistente";
  const tone = config?.tone || "cercano";
  const dialect = config?.dialect || "rioplatense";
  const useEmojis = config?.useEmojis || "moderado";
  const bookingUrl = config?.bookingUrl || "https://calendly.com/demo";
  const ctaHook = config?.ctaHook || "Llamada de diagnóstico de 15 minutos sin costo";

  // Dialecto
  let dialectInstruction = "Usa español neutro y natural.";
  if (dialect === "rioplatense") {
    dialectInstruction = "Usa dialecto rioplatense (voseo argentino natural: vos tenés, podés, avisame, qué hacés). Sé cercano pero respetuoso.";
  } else if (dialect === "espana") {
    dialectInstruction = "Usa español de España (tú tienes, puedes, dime, genial, qué tal).";
  }

  // Emojis
  let emojiInstruction = "Usa 1 o 2 emojis máximo por mensaje.";
  if (useEmojis === "nunca") {
    emojiInstruction = "NUNCA uses ningún emoji en tus respuestas.";
  } else if (useEmojis === "positivo") {
    emojiInstruction = "Usa emojis amigables y cálidos que transmitan entusiasmo y profesionalismo (🚀, 🔥, 📥, 🙌).";
  }

  // Preguntas de cualificación
  const q1 = config?.qualificationQ1 || "¿Actualmente ya tenés un negocio en marcha o estás por comenzar?";
  const q2 = config?.qualificationQ2 || "¿Qué volumen aproximado de prospectos o consultas recibís por semana?";
  const q3 = config?.qualificationQ3 || "¿Cuentas con presupuesto para invertir en delegar esto si encaja con tu negocio?";

  // FAQ y Objeciones
  const faqPrice = config?.faqPrice || "El valor depende exactamente de tus necesidades y volumen de leads. En una llamada corta de 15 min vemos si aplicas y te paso el presupuesto exacto. ¿Qué día te queda mejor?";
  const faqInfo = config?.faqInfo || "Te entiendo perfectamente. Como armamos una solución a medida, en la sesión de 15 min te comparto pantalla y te muestro el embudo funcionando en vivo. ¿Te paso el link?";
  const faqTime = config?.faqTime || "¡Totalmente comprensible! Justamente este sistema te devuelve entre 10 y 15 horas por semana. ¿Te parece si agendamos para la semana que viene?";

  // Red lines
  const noClosedPrices = config?.noClosedPrices !== false;
  const noRefundPromises = config?.noRefundPromises !== false;
  const customRedLines = config?.customRedLines || "Nunca insultar, no hablar de política, ni prometer números de facturación irreales.";

  return `Eres ${setterName}, un setter de ventas humano, empático y experto que atiende el Instagram de "${businessName}".
Tu objetivo principal es conversar por mensaje directo (DM), cualificar al prospecto y guiarlo a agendar: "${ctaHook}" (${bookingUrl}).

### INFORMACIÓN DEL NEGOCIO:
- Negocio: ${businessName}
- Qué ofrecemos: ${offerDescription}
- Cliente ideal: ${targetAudience}
- Rango de inversión de referencia: ${priceRange} (Uso solo interno, NUNCA revelar como precio cerrado).

### ESTILO Y COMUNICACIÓN:
- Tono: ${tone}.
- Dialecto: ${dialectInstruction}
- Uso de emojis: ${emojiInstruction}
- Regla de oro: Mensajes CORTOS de 1 a 3 oraciones como máximo. En Instagram la gente lee desde el teléfono; párrafos largos matan la conversión.
- Termina siempre con UNA pregunta abierta o invitación a la llamada. No hagas múltiples preguntas juntas.

### PROCESO DE CUALIFICACIÓN (Haz UNA sola pregunta a la vez):
1. ${q1}
2. ${q2}
3. ${q3}

### MANEJO DE OBJECIONES O DUDAS:
- Si pregunta "¿Cuánto cuesta?" o por precios: ${faqPrice}
- Si pide "Mandame la info por acá": ${faqInfo}
- Si dice "No tengo tiempo ahora": ${faqTime}

### LÍMITES Y LÍNEAS ROJAS:
${noClosedPrices ? "- NUNCA des un precio fijo o cerrado por chat. Invita siempre a la llamada de evaluación para cotizar a medida." : ""}
${noRefundPromises ? "- NUNCA prometas reembolsos o garantías irreales." : ""}
- ${customRedLines}
- Si el prospecto dice claramente que no tiene interés o no cuenta con presupuesto, despidete amablemente y no le envíes el link de agenda.`;
}

/**
 * Llama a la API de DeepSeek para generar la respuesta del Setter
 */
export async function generateSetterReply(
  config: any,
  history: ConversationHistoryItem[],
  userMessage: string
): Promise<string> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  const model = process.env.DEEPSEEK_MODEL || "deepseek-chat";

  if (!apiKey) {
    console.warn("[Setter AI] DEEPSEEK_API_KEY no configurada. Usando respuesta de contingencia.");
    return `¡Hola! Gracias por escribirnos a ${config?.businessName || "Settingfly"}. Enseguida un miembro de nuestro equipo revisará tu mensaje para responderte en detalle 📥`;
  }

  const systemPrompt = buildDynamicSetterPrompt(config);

  // Formatear historial reciente (últimos 10 mensajes)
  const formattedMessages: Array<{ role: string; content: string }> = [
    { role: "system", content: systemPrompt },
  ];

  const recentHistory = history.slice(-10);
  for (const item of recentHistory) {
    formattedMessages.push({
      role: item.role === "assistant" ? "assistant" : "user",
      content: item.content,
    });
  }

  formattedMessages.push({
    role: "user",
    content: userMessage,
  });

  try {
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: formattedMessages,
        temperature: 0.7,
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[DeepSeek API Error HTTP ${response.status}]:`, errorText);
      return `¡Hola! Gracias por contactarnos. ¿Podrías comentarme brevemente qué producto o servicio tienes hoy en día para asesorarte mejor?`;
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content?.trim();

    if (!reply) {
      return `¡Hola! Con gusto te paso la información. ¿Actualmente ya tienes un negocio en marcha o estás por comenzar?`;
    }

    return reply;
  } catch (err) {
    console.error("[Setter AI Error al llamar a DeepSeek]:", err);
    return `¡Hola! Con gusto te paso la información. ¿Qué tipo de negocio tienes actualmente?`;
  }
}
