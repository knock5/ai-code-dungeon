// ============================================================
// API Route: /api/ai — EdgeOne Makers Models (streaming)
// Menggunakan @edgeone/makers-models-provider + Vercel AI SDK
// ============================================================

import { NextRequest } from "next/server";
import { createAiGateway } from "@edgeone/makers-models-provider";
import { streamText } from "ai";

export const runtime = "nodejs";

interface QuestContext {
  title: string;
  problem: string;
  hint: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

function buildSystemPrompt(mode: "mentor" | "reviewer", questContext?: QuestContext): string {
  const questInfo = questContext
    ? `\n\nKonteks Quest Saat Ini:\n- Judul: ${questContext.title}\n- Problem: ${questContext.problem}\n- Hint resmi: ${questContext.hint}`
    : "";

  if (mode === "mentor") {
    return `Kamu adalah Sage, seorang mentor coding bijaksana di AI Code Dungeon — sebuah game RPG pembelajaran coding.

Peranmu:
- Memberikan hints yang MEMANDU, bukan memberikan jawaban langsung
- Menggunakan analogi dunia RPG/dungeon dalam penjelasanmu (pedang, mantra, dungeon, monster, dll)
- Bersikap menyemangati dan positif, seperti mentor yang baik
- Jika user sama sekali tidak tahu, beri langkah kecil pertama saja
- Jawab dalam Bahasa Indonesia yang ramah dan antusias
- Gunakan emoji sesekali untuk membuat percakapan lebih hidup
- JANGAN pernah memberikan kode solusi lengkap — beri petunjuk arah saja${questInfo}

Ingat: Tugasmu adalah membuat user BERPIKIR, bukan memberikan jawaban instan!`;
  }

  return `Kamu adalah Code Oracle, reviewer kode di AI Code Dungeon.

Peranmu:
- Menganalisis kode yang ditulis user
- Menjelaskan APA yang salah atau bisa diperbaiki
- Memberikan saran perbaikan yang spesifik
- Menjelaskan konsep yang mungkin belum dipahami user
- Bersikap konstruktif, bukan mengkritik
- Jawab dalam Bahasa Indonesia
- Gunakan format yang jelas dengan contoh kode jika perlu${questInfo}

Fokus: Bantu user memahami, bukan hanya memperbaiki kode.`;
}

export async function POST(req: NextRequest) {
  try {
    const { messages, mode, questContext } = (await req.json()) as {
      messages: ChatMessage[];
      mode: "mentor" | "reviewer";
      questContext?: QuestContext;
    };

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "Invalid messages" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const apiKey = process.env.MAKERS_MODELS_KEY;
    if (!apiKey || apiKey.startsWith("sk-GANTI")) {
      return new Response(
        JSON.stringify({
          error:
            "MAKERS_MODELS_KEY belum diisi. Buka .env.local dan isi dengan API Key dari EdgeOne Makers → Models → API Key.",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const modelName = process.env.AI_MODEL || "@makers/deepseek-v4-flash";
    const systemPrompt = buildSystemPrompt(mode ?? "mentor", questContext);

    // Inisialisasi EdgeOne Makers AI Gateway
    const aiGateway = createAiGateway({ apiKey });

    // Stream response menggunakan Vercel AI SDK
    const result = await streamText({
      model: aiGateway(modelName),
      system: systemPrompt,
      messages: messages.slice(-10), // limit context window
      temperature: 0.7,
    });

    // Kembalikan sebagai plain text stream (mudah dibaca di frontend)
    return result.toTextStreamResponse();
  } catch (err) {
    console.error("AI route error:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
