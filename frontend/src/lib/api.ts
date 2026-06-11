const raw = process.env.NEXT_PUBLIC_API_URL ?? "";

export function getApiBase(): string {
  if (!raw) {
    throw new Error("Service configuration missing. Please contact admin.");
  }
  return raw.replace(/\/$/, "");
}

/** Maps HTTP status codes and raw errors to user-friendly messages. */
function friendlyError(status: number, raw?: string): string {
  if (status === 401 || status === 403)
    return "Please sign in to continue.";
  if (status === 404)
    return "Service not found. Please contact admin.";
  if (status === 429)
    return "Too many requests. Please wait a moment and try again.";
  if (status === 503 || status === 502)
    return "The server is temporarily unavailable. Please try again shortly.";
  if (status >= 500)
    return "Something went wrong on our end. Please try again or contact admin.";
  // Check for raw backend "knowledge base" message and show a cleaner version
  if (raw?.includes("knowledge base"))
    return "The assistant could not find relevant passages. Please try rephrasing your question.";
  if (raw?.includes("API key"))
    return "Service configuration error. Please contact admin.";
  return "Something went wrong. Please try again.";
}

export type SourceRef = {
  id: string;
  page?: number | null;
  source?: string;
};

export async function fetchSources(
  message: string,
): Promise<{ context_present: boolean; sources: SourceRef[] }> {
  const res = await fetch(`${getApiBase()}/chat/sources`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
  if (!res.ok) {
    throw new Error(friendlyError(res.status));
  }
  return res.json();
}

export type ChatHistoryMessage = {
  role: "user" | "assistant";
  content: string;
};

export async function streamChat(
  message: string,
  onToken: (t: string) => void,
  onError: (e: Error) => void,
  history?: ChatHistoryMessage[],
  language?: "en" | "hi",
): Promise<void> {
  const res = await fetch(`${getApiBase()}/chat/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history: history ?? [], language: language ?? "en" }),
  });

  if (!res.ok || !res.body) {
    const t = await res.text().catch(() => "");
    onError(new Error(friendlyError(res.status, t)));
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const payload = line.slice(6).trim();
        if (payload === "[DONE]" || payload === '{"done":true}') return;
        try {
          const j = JSON.parse(payload) as { text?: string; error?: string };
          if (j.error) {
            // Sanitise backend error before showing to user
            onError(new Error(friendlyError(0, j.error)));
            return;
          }
          if (j.text) onToken(j.text);
        } catch {
          /* ignore partial JSON */
        }
      }
    }
  } catch {
    onError(new Error("Connection lost. Please try again."));
  }
}
