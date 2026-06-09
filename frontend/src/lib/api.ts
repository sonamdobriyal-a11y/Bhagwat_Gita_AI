const raw = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

export function getApiBase(): string {
  return raw.replace(/\/$/, "");
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
    const t = await res.text();
    throw new Error(t || `Sources request failed (${res.status})`);
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
): Promise<void> {
  const res = await fetch(`${getApiBase()}/chat/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history: history ?? [] }),
  });

  if (!res.ok || !res.body) {
    const t = await res.text();
    onError(new Error(t || `Chat failed (${res.status})`));
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
            onError(new Error(j.error));
            return;
          }
          if (j.text) onToken(j.text);
        } catch {
          /* ignore partial JSON */
        }
      }
    }
  } catch (e) {
    onError(e instanceof Error ? e : new Error(String(e)));
  }
}
