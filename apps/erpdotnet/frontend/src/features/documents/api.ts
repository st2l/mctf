"use client";

import {
  Document,
  DocumentCreate,
  DocumentPublicRead,
} from "@/features/documents/types";
import { POST, GET } from "@/lib/fetcher";

export async function CreateDocument(
  companyId: string,
  form: DocumentCreate,
): Promise<Document> {
  return await POST(`?company=${companyId}&documents=true`, form, true);
}

export async function GetDocument(
  companyId: string,
  documentId: string,
): Promise<Document> {
  return await GET(`?company=${companyId}&document=${documentId}`, true);
}

export async function GetDocuments(companyId: string): Promise<Document[]> {
  return await GET(`?company=${companyId}&documents=true`, true);
}

export async function GetPublicDocument(form: DocumentPublicRead) {
  return await POST(`/document/read`, form, true);
}
