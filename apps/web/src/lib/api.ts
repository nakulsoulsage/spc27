const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface FetchOptions extends RequestInit {
  token?: string;
}

class ApiError extends Error {
  constructor(
    public status: number,
    public data: any,
  ) {
    const msg = data?.message;
    super(Array.isArray(msg) ? msg[0] : msg || 'API Error');
  }
}

async function fetchApi<T = any>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { token, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  // Only set Content-Type to JSON if there's no explicit header override
  // and the body is not FormData (for file uploads)
  if (!(fetchOptions.body instanceof FormData)) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  }

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

  upload: <T = any>(endpoint: string, formData: FormData, token?: string) =>
    fetchApi<T>(endpoint, {
      method: 'POST',
      body: formData,
      token,
    }),
};

export { ApiError };
