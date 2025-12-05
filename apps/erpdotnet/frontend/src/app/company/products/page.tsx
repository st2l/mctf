"use client";

import { useEffect, useState } from "react";
import { getCompanyIdFromToken } from "@/lib/fetcher";
import { GetProducts } from "@/features/products/api";
import { ProductRow } from "@/features/products/components/card";
import { CreateProductModal } from "@/features/products/components/create";
import { Product } from "@/features/products/types";

export default function ProductsPage() {
  const [companyId, setCompanyId] = useState<string>("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = getCompanyIdFromToken();
    //eslint-disable-next-line react-hooks/set-state-in-effect
    setCompanyId(id);
  }, []);

  useEffect(() => {
    if (!companyId) return;

    const loadProducts = async () => {
      setLoading(true);
      const data = await GetProducts(companyId);
      setProducts(data);
      setLoading(false);
    };

    loadProducts();
  }, [companyId]);

  const reloadProducts = () => {
    if (companyId) {
      GetProducts(companyId).then(setProducts);
    }
  };

  if (loading || !companyId) {
    return (
      <main className="min-h-screen p-10 text-gray-100 bg-neutral-950">
        <h1 className="text-3xl font-bold mb-8 text-cyan-300">Products</h1>
        <p className="text-gray-400">Loading...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-10 text-gray-100 bg-neutral-950">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-cyan-300">Products</h1>
        <CreateProductModal companyId={companyId} onCreated={reloadProducts} />
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12 bg-neutral-900/60 border border-neutral-800 rounded-xl">
          <p className="text-gray-400 mb-4">No products yet</p>
          <p className="text-gray-500 text-sm">
            Click &quot;Add Product&quot; to create your first product
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
                Description
              </th>
              <th className="px-4 py-3 text-right text-gray-300 font-medium">
                Price
              </th>
              <th className="px-4 py-3 text-right text-gray-300 font-medium">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <ProductRow
                key={p.id}
                product={p}
                companyId={companyId}
                onUpdated={reloadProducts}
              />
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
