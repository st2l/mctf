"use client";

import { Company } from "@/features/companies/types";
import { POST, GET } from "@/lib/fetcher";

export async function GetCompany(id: string): Promise<Company> {
  return await GET(`?company=${id}`, true);
}

export async function GetCompanies(): Promise<Company[]> {
  return await GET("?companies", true);
}

export async function ChangeCompanyName(
  id: string,
  name: string,
): Promise<Company> {
  return await POST(`?company=${id}`, { name }, true);
}
