import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { supabaseServer } from "@/lib/supabase-server";

export const runtime = "nodejs";

const SYSTEM = [
  "Você é o assistente do lst, o Life OS pessoal do Daniel.",
  "Responda em português do Brasil, direto e útil. Sem floreios.",
  "Você pode ajudar com tarefas, treino, dieta, livros, lembretes, etc.",
].join(" ");

export async function POST(req: NextRequest) {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return new Response("ANTHROPIC_API_KEY missing", { status: 500 });

  const body = await req.json().catch(() => null) as { message?: string } | null;
  const message = body?.message?.trim();
  if (!message) return new Response("message required", { status: 400 });

  // Persist user message
  await supabase.from("chat_messages").insert({ role: "user", content: message });

  // Last 20 messages as context
  const { data: history } = await supabase
    .from("chat_messages")
    .select("role, content")
    .order("created_at", { ascending: false })
    .limit(20);

  const ordered = (history ?? []).slice().reverse();

  const client = new Anthropic({ apiKey });

  const encoder = new TextEncoder();
  let assistantBuf = "";

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const response = await client.messages.stream({
          model: "claude-haiku-4-5",
          max_tokens: 1024,
          system: SYSTEM,
          messages: ordered
            .filter((m) => m.role === "user" || m.role === "assistant")
            .map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
        });

        for await (const event of response) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            assistantBuf += event.delta.text;
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }

        if (assistantBuf) {
          await supabase.from("chat_messages").insert({ role: "assistant", content: assistantBuf });
        }
      } catch (e: any) {
        controller.enqueue(encoder.encode(`\n[erro: ${e?.message ?? "desconhecido"}]`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
    },
  });
}
