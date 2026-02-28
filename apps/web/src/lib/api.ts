const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface FetchOptions extends RequestInit {
  token?: string;
}

class ApiError extends Error {
  constructor(
    public status: number,
    public data: any,
  ) {
    super(data?.message?.[0] || 'API Error');
  }
}

async function fetchApi<T = any>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { token, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}/api${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new ApiError(res.status, data);
  }

  return data;
}

export const api = {
  get: <T = any>(endpoint: string, token?: string) =>
    fetchApi<T>(endpoint, { method: 'GET', token }),

  post: <T = any>(endpoint: string, body: any, token?: string) =>
    fetchApi<T>(endpoint, { method: 'POST', body: JSON.stringify(body), token }),

  patch: <T = any>(endpoint: string, body: any, token?: string) =>
    fetchApi<T>(endpoint, { method: 'PATCH', body: JSON.stringify(body), token }),

  delete: <T = any>(endpoint: string, token?: string) =>
    fetchApi<T>(endpoint, { method: 'DELETE', token }),
};

export { ApiError };
