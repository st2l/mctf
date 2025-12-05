import type { NextConfig } from "next";

const API = process.env.NEXT_PUBLIC_API_BASE || "http://backend:80";

const nextConfig: NextConfig = {
  output: "standalone",
  logging: {
    incomingRequests: true,
    fetches: {
      fullUrl: true,
      hmrRefreshes: true,
    },
  },
  images: {
    deviceSizes: [320, 420, 768, 1024, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    dangerouslyAllowLocalIP: true,
    remotePatterns: [
      {
        protocol: "http",
        hostname: "backend",
        port: "",
        search: "",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/register",
        destination: `${API}/api/register`,
      },
      {
        source: "/api/login",
        destination: `${API}/api/login`,
      },
      {
        source: "/api/employee-login",
        destination: `${API}/api/employee-login`,
      },
      {
        source: "/api",
        has: [
          { type: "query", key: "company" },
          { type: "query", key: "employees" },
        ],
        destination: `${API}/api/company/:company/employees`,
      },
      {
        source: "/api",
        has: [
          { type: "query", key: "company" },
          { type: "query", key: "employee" },
        ],
        destination: `${API}/api/company/:company/employee/:employee?`,
      },
      {
        source: "/api",
        has: [
          { type: "query", key: "company" },
          { type: "query", key: "products" },
        ],
        destination: `${API}/api/company/:company/products`,
      },
      {
        source: "/api",
        has: [
          { type: "query", key: "company" },
          { type: "query", key: "product" },
        ],
        destination: `${API}/api/company/:company/product/:product?`,
      },
      {
        source: "/api",
        has: [
          { type: "query", key: "company" },
          { type: "query", key: "documents" },
        ],
        destination: `${API}/api/company/:company/documents`,
      },
      {
        source: "/api",
        has: [
          { type: "query", key: "company" },
          { type: "query", key: "document" },
        ],
        destination: `${API}/api/company/:company/document/:document?`,
      },
      {
        source: "/api",
        has: [{ type: "query", key: "read-document" }],
        destination: `${API}/api/document/read`,
      },
      {
        source: "/api",
        has: [{ type: "query", key: "companies" }],
        destination: `${API}/api/companies`,
      },
      {
        source: "/api",
        has: [{ type: "query", key: "company" }],
        destination: `${API}/api/company/:company`,
      },
    ];
  },
};

export default nextConfig;
