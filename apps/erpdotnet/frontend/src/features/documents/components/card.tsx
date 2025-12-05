"use client";

import { Document } from "@/features/documents/types";

export function DocumentRow({
  document,
  companyId,
  onUpdated,
}: {
  document: Document;
  companyId: string;
  onUpdated: () => void;
}) {
  return (
    <tr className="border-b border-neutral-800 hover:bg-neutral-800/40 transition-all">
      <td className="px-4 py-3 text-gray-200">{document.name}</td>
      <td className="px-4 py-3 text-gray-400">
        <a
          href={`/api?company=${companyId}&document=${document.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-cyan-400 hover:text-cyan-300 underline"
        >
          View PDF
        </a>
      </td>
    </tr>
  );
}
