/**
 * Base fetch wrapper for all API calls.
 *
 * Normalizes error handling so components always receive an ApiError
 * with a human-readable message instead of raw HTTP response objects.
 */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiFetch<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(url, options);

  if (!res.ok) {
    let message = `Request failed with status ${res.status}`;
    try {
      const body = await res.json();
      if (body?.error?.message) message = body.error.message;
    } catch {
      // response body wasn't JSON — use default message
    }
    throw new ApiError(res.status, message);
  }

  return res.json() as Promise<T>;
}
