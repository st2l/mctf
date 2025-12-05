"use client";

import { useState, useEffect } from "react";
import { CreateDocument } from "@/features/documents/api";
import { GetProducts } from "@/features/products/api";
import { Product } from "@/features/products/types";
import { DocumentProduct } from "@/features/documents/types";

type Props = {
  companyId: string;
  onCreated: () => void;
};

export function CreateDocumentModal({ companyId, onCreated }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState({
    name: "",
    note: "",
  });
  const [selectedItems, setSelectedItems] = useState<DocumentProduct[]>([]);

  useEffect(() => {
    if (open && products.length === 0) {
      loadProducts();
    }
  }, [open]);

  const loadProducts = async () => {
    setLoadingProducts(true);
    try {
      const data = await GetProducts(companyId);
      setProducts(data);
    } catch (e) {
      console.error(e);
      alert("Failed to load products");
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleAddItem = () => {
    setSelectedItems([...selectedItems, { productId: "", count: 1 }]);
  };

  const handleRemoveItem = (index: number) => {
    setSelectedItems(selectedItems.filter((_, i) => i !== index));
  };

  const handleItemChange = (
    index: number,
    field: "productId" | "count",
    value: string | number,
  ) => {
    const updated = [...selectedItems];
    updated[index] = {
      ...updated[index],
      [field]: field === "count" ? Number(value) : value,
    };
    setSelectedItems(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedItems.length === 0) {
      alert("Please add at least one product");
      return;
    }

    const hasEmptyProduct = selectedItems.some((item) => !item.productId);
    if (hasEmptyProduct) {
      alert("Please select a product for all items");
      return;
    }

    setLoading(true);
    try {
      await CreateDocument(companyId, {
        name: form.name,
        note: form.note,
        items: selectedItems,
      });
      setForm({ name: "", note: "" });
      setSelectedItems([]);
      setOpen(false);
      onCreated();
    } catch (e) {
      console.error(e);
      alert("Failed to create document");
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
        Add Document
      </button>

      {open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4 overflow-y-auto">
          <form
            onSubmit={handleSubmit}
            className="bg-neutral-900 p-6 rounded-xl border border-neutral-800 w-full max-w-2xl space-y-4 my-8"
          >
            <h3 className="text-lg font-bold text-cyan-300">
              Create New Document
            </h3>

            <div>
              <label className="text-sm text-gray-400 block mb-1">
                Document Name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Invoice #001"
                className="w-full p-2 rounded border border-neutral-700 bg-neutral-800 text-gray-100"
                required
              />
            </div>

            <div>
              <label className="text-sm text-gray-400 block mb-1">Note</label>
              <textarea
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                placeholder="Additional notes..."
                rows={3}
                className="w-full p-2 rounded border border-neutral-700 bg-neutral-800 text-gray-100"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-gray-400">Products</label>
                <button
                  type="button"
                  onClick={handleAddItem}
                  disabled={loadingProducts}
                  className="text-sm px-3 py-1 bg-cyan-600/20 text-cyan-300 rounded hover:bg-cyan-600/30 transition"
                >
                  + Add Product
                </button>
              </div>

              {loadingProducts ? (
                <p className="text-gray-400 text-sm">Loading products...</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {selectedItems.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-4">
                      No products added yet
                    </p>
                  ) : (
                    selectedItems.map((item, index) => (
                      <div
                        key={index}
                        className="flex gap-2 items-center bg-neutral-800/50 p-3 rounded border border-neutral-700"
                      >
                        <select
                          value={item.productId}
                          onChange={(e) =>
                            handleItemChange(index, "productId", e.target.value)
                          }
                          className="flex-1 p-2 rounded border border-neutral-700 bg-neutral-800 text-gray-100"
                          required
                        >
                          <option value="">Select Product</option>
                          {products.map((product) => (
                            <option key={product.id} value={product.id}>
                              {product.name} - ${product.price}
                            </option>
                          ))}
                        </select>

                        <input
                          type="number"
                          min="1"
                          value={item.count}
                          onChange={(e) =>
                            handleItemChange(index, "count", e.target.value)
                          }
                          placeholder="Qty"
                          className="w-20 p-2 rounded border border-neutral-700 bg-neutral-800 text-gray-100"
                          required
                        />

                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="p-2 text-red-400 hover:text-red-300 transition"
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
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-4 py-2 bg-gray-700 text-gray-100 rounded hover:bg-gray-600 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || loadingProducts}
                className="px-4 py-2 bg-cyan-600 text-gray-100 rounded hover:bg-cyan-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Creating..." : "Generate Document"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
