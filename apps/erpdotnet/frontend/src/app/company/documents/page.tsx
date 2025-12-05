"use client";

import { useEffect, useState } from "react";
import { getCompanyIdFromToken } from "@/lib/fetcher";
import { GetDocuments } from "@/features/documents/api";
import { DocumentRow } from "@/features/documents/components/card";
import { CreateDocumentModal } from "@/features/documents/components/create";
import { Document } from "@/features/documents/types";

export default function DocumentsPage() {
  const [companyId, setCompanyId] = useState<string>("");
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = getCompanyIdFromToken();
    //eslint-disable-next-line react-hooks/set-state-in-effect
    setCompanyId(id);
  }, []);

  useEffect(() => {
    if (!companyId) return;

    const loadDocuments = async () => {
      setLoading(true);
      const data = await GetDocuments(companyId);
      setDocuments(data);
      setLoading(false);
    };

    loadDocuments();
  }, [companyId]);

  const reloadDocuments = () => {
    if (companyId) {
      GetDocuments(companyId).then(setDocuments);
    }
  };

  if (loading || !companyId) {
    return (
      <main className="min-h-screen p-10 text-gray-100 bg-neutral-950">
        <h1 className="text-3xl font-bold mb-8 text-cyan-300">Documents</h1>
        <p className="text-gray-400">Loading...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-10 text-gray-100 bg-neutral-950">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-cyan-300">Documents</h1>
        <CreateDocumentModal
          companyId={companyId}
          onCreated={reloadDocuments}
        />
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-12 bg-neutral-900/60 border border-neutral-800 rounded-xl">
          <p className="text-gray-400 mb-4">No documents yet</p>
          <p className="text-gray-500 text-sm">
            Click &quot;Add Document&quot; to create your first document
          </p>
        </div>
      ) : (
        <table className="w-full border border-neutral-800 rounded-xl overflow-hidden">
          <thead className="bg-neutral-900/60">
            <tr>
              <th className="px-4 py-3 text-left text-gray-300 font-medium">
                Name
              </th>
              <th className="px-4 py-3 text-left text-gray-300 font-medium">
                PDF
              </th>
              <th className="px-4 py-3 text-left text-gray-300 font-medium">
                Password
              </th>
              <th className="px-4 py-3 text-right text-gray-300 font-medium">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => (
              <DocumentRow
                key={doc.id}
                document={doc}
                companyId={companyId}
                onUpdated={reloadDocuments}
              />
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
