"use client";

import { Product } from "@/features/products/types";
import Link from "next/link";
import { DeleteProduct } from "@/features/products/api";
import { useState } from "react";

import { EditProductModal } from "@/features/products/components/edit";

export function ProductRow({
  product,
  companyId,
  onUpdated,
}: {
  product: Product;
  companyId: string;
  onUpdated: () => void;
}) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${product.name}?`)) return;
    setIsDeleting(true);
    try {
      await DeleteProduct(companyId, product.id);
      onUpdated(); // обновляем список товаров
    } catch (e) {
      console.error(e);
      alert("Failed to delete product");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <tr className="border-b border-neutral-800 hover:bg-neutral-800/40 transition-all">
      <td className="px-4 py-3 text-gray-200">{product.name}</td>
      <td className="px-4 py-3 text-gray-400">{product.description}</td>
      <td className="px-4 py-3 text-gray-100 text-right">${product.price}</td>
      <td className="px-4 py-3 text-right flex justify-end gap-2">
        <EditProductModal
          product={product}
          companyId={companyId}
          onUpdated={onUpdated}
        />
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="px-2 py-1 bg-red-600 text-gray-100 rounded hover:bg-red-500 transition"
        >
          {isDeleting ? "Deleting..." : "Delete"}
        </button>
        <Link
          href={`./product/${product.id}`}
          className="text-cyan-300 hover:text-cyan-400 transition"
        >
          Open
        </Link>
      </td>
    </tr>
  );
}
