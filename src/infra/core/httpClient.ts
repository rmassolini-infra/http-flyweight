export interface HttpClientOptions {
  timeoutMs?: number;
  headers?: Record<string, string>;
}

export class HttpError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function httpGetJson<T = any>(
  url: string,
  options: HttpClientOptions = {}
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    options.timeoutMs ?? 30000
  );

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        ...(options.headers ?? {}),
      },
      signal: controller.signal,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new HttpError(
        `Request failed: ${res.status} ${res.statusText} - ${text}`,
        res.status
      );
    }

    return (await res.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
}

export async function httpGetText(
  url: string,
  options: HttpClientOptions = {}
): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    options.timeoutMs ?? 60000
  );

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        ...(options.headers ?? {}),
      },
      signal: controller.signal,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new HttpError(
        `Request failed: ${res.status} ${res.statusText} - ${text}`,
        res.status
      );
    }

    return await res.text();
  } finally {
    clearTimeout(timeout);
  }
}
