"use client";

import { useState } from "react";
import { Product, ProductForm } from "@/features/products/types";
import { UpdateProduct } from "@/features/products/api";

type Props = {
  product: Product;
  companyId: string;
  onUpdated: () => void;
};

export function EditProductModal({ product, companyId, onUpdated }: Props) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<ProductForm>({
    name: product.name,
    description: product.description,
    price: product.price,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await UpdateProduct(companyId, product.id, form);
    setLoading(false);
    setOpen(false);
    onUpdated();
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-2 py-1 bg-cyan-600 text-gray-100 rounded hover:bg-cyan-500 transition"
      >
        Update
      </button>

      {open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <form
            onSubmit={handleSubmit}
            className="bg-neutral-900 p-6 rounded-xl border border-neutral-800 w-full max-w-md space-y-4"
          >
            <h3 className="text-lg font-bold text-cyan-300">Edit Product</h3>

            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Name"
              className="w-full p-2 rounded border border-neutral-700 bg-neutral-800 text-gray-100"
            />

            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Description"
              className="w-full p-2 rounded border border-neutral-700 bg-neutral-800 text-gray-100"
            />

            <input
              type="number"
              value={form.price}
              onChange={(e) =>
                setForm({ ...form, price: Number(e.target.value) })
              }
              placeholder="Price"
              className="w-full p-2 rounded border border-neutral-700 bg-neutral-800 text-gray-100"
            />

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-4 py-2 bg-gray-700 text-gray-100 rounded hover:bg-gray-600 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-cyan-600 text-gray-100 rounded hover:bg-cyan-500 transition"
              >
                {loading ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
