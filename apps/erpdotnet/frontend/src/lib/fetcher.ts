"use client";

interface RequestOptions {
  method?: "GET" | "POST" | "DELETE";
  body?: any;
  headers?: Record<string, string>;
  requireAuth?: boolean;
}

const PUBLIC_ENDPOINTS = ["/api/login", "/api/register", "/api/employee-login"];

function getTokenFromCookie(): string | null {
  const match = document.cookie.match(/(?:^|;\s*)token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

function isPublicEndpoint(path: string): boolean {
  const fullPath = path.startsWith("/api")
    ? path
    : `/api${path.startsWith("/") ? path : `/${path}`}`;
  return PUBLIC_ENDPOINTS.some((endpoint) => fullPath.startsWith(endpoint));
}

export function getCompanyIdFromToken() {
  const token = getTokenFromCookie(); // или из cookie
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split(".")[1])); // decode base64
    return payload.companyId || payload.company; // смотри точное поле в JWT
  } catch (e) {
    console.error("Invalid token", e);
    return null;
  }
}

export async function backendRequest<T = any>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = "GET", body, headers = {}, requireAuth } = options;

  const url = `/api${path.startsWith("/") ? path : `/${path}`}`;

  const needsAuth = requireAuth !== false && !isPublicEndpoint(url);

  const token = getTokenFromCookie();

  if (needsAuth && !token) {
    throw new Error("Unauthorized");
  }

  const fetchHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...headers,
  };

  if (token) {
    fetchHeaders["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method,
    credentials: "include",
    headers: fetchHeaders,
    body: body ? JSON.stringify(body) : undefined,
  });

  const newResp = response.clone();
  const respBody = await newResp.text();

  if (!response.ok) {
    throw new Error(`
Backend error:
${url}
${response.status}
${respBody}
${JSON.stringify(body)}
TOKEN: ${token || "NO TOKEN"}
`);
  }

  if (respBody === "") {
    return null as T; // empty response
  }

  return JSON.parse(respBody);
}

export async function GET<T = any>(
  path: string,
  requireAuth: boolean = true,
): Promise<T> {
  return await backendRequest<T>(path, { method: "GET", requireAuth });
}

export async function POST<T = any>(
  path: string,
  body: any,
  requireAuth: boolean = true,
): Promise<T> {
  return await backendRequest<T>(path, { method: "POST", body, requireAuth });
}

export async function DELETE<T = any>(
  path: string,
  requireAuth: boolean = true,
): Promise<T> {
  return await backendRequest<T>(path, { method: "DELETE", requireAuth });
}
