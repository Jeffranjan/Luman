/**
 * AI Agent Module — MiMo V2.5 Pro Integration
 * Handles email summarization, drafting, and priority scoring.
 */

import { env } from "~/env";

// AI API configuration — Xiaomi MiMo V2.5 Pro (OpenAI-compatible)
const MIMO_BASE_URL =
  process.env.MIMO_BASE_URL ?? "https://token-plan-sgp.xiaomimimo.com/v1";
const MIMO_MODEL = process.env.MIMO_MODEL ?? "mimo-v2.5-pro";

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

async function callMiMo(
  messages: ChatMessage[],
  maxTokens: number = 500,
): Promise<string> {
  const url = `${MIMO_BASE_URL}/chat/completions`;
  console.log(`[MiMo] Calling ${url} with model ${MIMO_MODEL}`);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.MIMO_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MIMO_MODEL,
        messages,
        max_tokens: maxTokens,
      }),
    });

    console.log(
      `[MiMo] Response status: ${response.status} ${response.statusText}`,
    );

    if (!response.ok) {
      const errorText = await response.text().catch(() => "unknown");
      console.error(`[MiMo] API error ${response.status}: ${errorText}`);
      return `AI service error (${response.status}): ${errorText.substring(0, 200)}`;
    }

    const data = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };

    console.log(`[MiMo] Got response, choices: ${data.choices?.length ?? 0}`);
    return data.choices?.[0]?.message?.content ?? "No response from AI.";
  } catch (error: any) {
    console.error(`[MiMo] Fetch failed: ${error?.message ?? error}`);
    return `AI connection failed: ${error?.message ?? "Unknown error"}. Check MIMO_BASE_URL (${MIMO_BASE_URL}) and API key.`;
  }
}

/**
 * Summarize an email thread into 2-3 concise bullet points.
 */
export async function summarizeThread(
  messages: { from: string; body: string }[],
): Promise<string> {
  if (messages.length === 0) return "No messages to summarize.";

  const threadText = messages
    .map((m) => `From: ${m.from}\n${m.body}`)
    .join("\n\n---\n\n");

  return callMiMo(
    [
      {
        role: "system",
        content:
          "You are an email assistant. Summarize email threads concisely in 2-3 bullet points. Focus on action items, decisions, and key information.",
      },
      {
        role: "user",
        content: `Summarize this email thread:\n\n${threadText}`,
      },
    ],
    300,
  );
}

/**
 * Draft a professional email based on context.
 */
export async function draftEmail(
  context: string,
  to: string,
  subject: string,
): Promise<string> {
  return callMiMo(
    [
      {
        role: "system",
        content:
          "You are a professional email writer. Draft clear, concise, and well-structured emails. Return only the email body text, no subject line or signature placeholders.",
      },
      {
        role: "user",
        content: `Draft a professional email.\nTo: ${to}\nSubject: ${subject}\nContext: ${context}\n\nReturn only the email body.`,
      },
    ],
    500,
  );
}

/**
 * Score email priority from 0.0 (low) to 1.0 (urgent).
 */
export async function scorePriority(
  subject: string,
  snippet: string,
): Promise<number> {
  const response = await callMiMo(
    [
      {
        role: "system",
        content:
          "Rate email priority. Return ONLY a number between 0.0 (low priority) and 1.0 (urgent). No text, just the number.",
      },
      {
        role: "user",
        content: `Subject: "${subject}"\nPreview: "${snippet}"`,
      },
    ],
    10,
  );

  const score = parseFloat(response.trim());
  return isNaN(score) ? 0.5 : Math.max(0, Math.min(1, score));
}

/**
 * Generate a draft reply based on the thread context.
 */
export async function draftReply(
  threadSubject: string,
  threadMessages: { from: string; body: string }[],
  userContext?: string,
): Promise<string> {
  const threadText = threadMessages
    .map((m) => `From: ${m.from}\n${m.body}`)
    .join("\n\n---\n\n");

  const contextNote = userContext
    ? `\n\nAdditional context from the user: ${userContext}`
    : "";

  return callMiMo(
    [
      {
        role: "system",
        content:
          "You are an email assistant. Draft a concise, professional reply to the last message in an email thread. Return only the reply body text.",
      },
      {
        role: "user",
        content: `Thread subject: ${threadSubject}\n\nThread messages:\n${threadText}${contextNote}\n\nDraft a reply to the last message.`,
      },
    ],
    400,
  );
}
