"use client";

import { Product, ProductForm } from "@/features/products/types";
import { POST, GET, DELETE } from "@/lib/fetcher";

export async function CreateProduct(
  companyId: string,
  form: ProductForm,
): Promise<Product> {
  return await POST(`?company=${companyId}&products=true`, form, true);
}

export async function GetProducts(companyId: string): Promise<Product[]> {
  return await GET(`?company=${companyId}&products=true`);
}

export async function GetProduct(
  companyId: string,
  id: string,
): Promise<Product> {
  return await GET(`?company=${companyId}&product=${id}`, true);
}

export async function UpdateProduct(
  companyId: string,
  id: string,
  form: ProductForm,
) {
  return await POST(`?company=${companyId}&product=${id}`, form, true);
}

export async function DeleteProduct(
  companyId: string,
  id: string,
): Promise<Product> {
  return await DELETE(`?company=${companyId}&product=${id}`, true);
}
