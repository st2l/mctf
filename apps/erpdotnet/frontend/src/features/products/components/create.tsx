"use client";

import { useState } from "react";
import { CreateProduct } from "@/features/products/api";
import { ProductForm } from "@/features/products/types";

type Props = {
  companyId: string;
  onCreated: () => void;
};

export function CreateProductModal({ companyId, onCreated }: Props) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<ProductForm>({
    name: "",
    description: "",
    price: 0,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    try {
      await CreateProduct(companyId, form);
      setForm({
        name: "",
        description: "",
        price: 0,
      });
      setOpen(false);
      onCreated();
    } catch (e) {
      console.error(e);
      alert("Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 bg-cyan-600 text-gray-100 rounded-lg hover:bg-cyan-500 transition flex items-center gap-2"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
        Add Product
      </button>

      {open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <form
            onSubmit={handleSubmit}
            className="bg-neutral-900 p-6 rounded-xl border border-neutral-800 w-full max-w-md space-y-4"
          >
            <h3 className="text-lg font-bold text-cyan-300">
              Create New Product
            </h3>

            <div>
              <label className="text-sm text-gray-400 block mb-1">Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Big gun"
                className="w-full p-2 rounded border border-neutral-700 bg-neutral-800 text-gray-100"
                required
              />
            </div>

            <div>
              <label className="text-sm text-gray-400 block mb-1">Note</label>
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Description..."
                rows={3}
                className="w-full p-2 rounded border border-neutral-700 bg-neutral-800 text-gray-100"
              />
            </div>

            <div>
              <label className="text-sm text-gray-400 block mb-1">Price</label>
              <input
                type="number"
                value={form.price}
                onChange={(e) =>
                  setForm({ ...form, price: Number(e.target.value) })
                }
                placeholder="0"
                className="w-full p-2 rounded border border-neutral-700 bg-neutral-800 text-gray-100"
                required
              />
            </div>

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
                {loading ? "Creating..." : "Create"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
