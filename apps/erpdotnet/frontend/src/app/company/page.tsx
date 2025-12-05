"use client";

import { useEffect, useState } from "react";
import { getCompanyIdFromToken } from "@/lib/fetcher";
import { GetCompany, ChangeCompanyName } from "@/features/companies/api";
import { Company } from "@/features/companies/types";
import Link from "next/link";

export default function CompanyPage() {
  const [companyId, setCompanyId] = useState<string>("");
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const id = getCompanyIdFromToken();
    setCompanyId(id);
  }, []);

  useEffect(() => {
    if (!companyId) return;

    const loadCompany = async () => {
      setLoading(true);
      const data = await GetCompany(companyId);
      setCompany(data);
      setNewName(data.name);
      setLoading(false);
    };

    loadCompany();
  }, [companyId]);

  const handleChangeName = async () => {
    if (!newName.trim() || !company) return;
    setSaving(true);
    try {
      const updated = await ChangeCompanyName(company.id, newName);
      setCompany(updated);
      setEditMode(false);
    } catch (e) {
      console.error(e);
      alert("Failed to update company name");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !companyId || !company) {
    return (
      <main className="min-h-screen p-10 text-gray-100 bg-neutral-950">
        <h1 className="text-3xl font-bold mb-8 text-cyan-300">Company</h1>
        <p className="text-gray-400">Loading...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-10 text-gray-100 bg-neutral-950">
      <div className="max-w-4xl mx-auto">
        {/* Header with company name */}
        <div className="mb-8">
          {editMode ? (
            <div className="flex items-center gap-4">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="text-3xl font-bold bg-neutral-800 border border-neutral-700 rounded px-4 py-2 text-cyan-300 flex-1"
                placeholder="Company Name"
              />
              <button
                onClick={handleChangeName}
                disabled={saving}
                className="px-4 py-2 bg-cyan-600 text-gray-100 rounded hover:bg-cyan-500 transition"
              >
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                onClick={() => {
                  setEditMode(false);
                  setNewName(company.name);
                }}
                className="px-4 py-2 bg-gray-700 text-gray-100 rounded hover:bg-gray-600 transition"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-cyan-300">
                {company.name}
              </h1>
              <button
                onClick={() => setEditMode(true)}
                className="px-4 py-2 bg-cyan-600 text-gray-100 rounded hover:bg-cyan-500 transition"
              >
                Edit Name
              </button>
            </div>
          )}
        </div>

        {/* Company Info Card */}
        <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-200 mb-4">
            Company Information
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-400 text-sm">Company ID</p>
              <p className="text-gray-100 font-mono">{company.id}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Employees</p>
              <p className="text-gray-100 text-2xl font-bold">
                {company.employees.length}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/company/employees"
            className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-6 hover:bg-neutral-800/60 transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-cyan-300 group-hover:text-cyan-400 transition">
                Employees
              </h3>
              <svg
                className="w-6 h-6 text-cyan-300 group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </div>
            <p className="text-gray-400 text-sm">
              Manage company employees and access
            </p>
            <p className="text-gray-300 mt-2 font-semibold">
              {company.employees.length} employee
              {company.employees.length !== 1 ? "s" : ""}
            </p>
          </Link>

          <Link
            href="/company/documents"
            className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-6 hover:bg-neutral-800/60 transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-cyan-300 group-hover:text-cyan-400 transition">
                Documents
              </h3>
              <svg
                className="w-6 h-6 text-cyan-300 group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </div>
            <p className="text-gray-400 text-sm">
              View and manage company documents
            </p>
          </Link>

          <Link
            href="/company/products"
            className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-6 hover:bg-neutral-800/60 transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-cyan-300 group-hover:text-cyan-400 transition">
                Products
              </h3>
              <svg
                className="w-6 h-6 text-cyan-300 group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </div>
            <p className="text-gray-400 text-sm">Manage products and pricing</p>
          </Link>
        </div>

        {/* Employees Preview */}
        {company.employees.length > 0 && (
          <div className="mt-8 bg-neutral-900/60 border border-neutral-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-200">
                Recent Employees
              </h2>
              <Link
                href="/company/employees"
                className="text-cyan-400 hover:text-cyan-300 text-sm"
              >
                View all →
              </Link>
            </div>
            <div className="space-y-2">
              {company.employees.slice(0, 5).map((employee) => (
                <div
                  key={employee.id}
                  className="flex items-center justify-between p-3 bg-neutral-800/40 rounded-lg"
                >
                  <div>
                    <p className="text-gray-200 font-medium">{employee.name}</p>
                    <p className="text-gray-400 text-sm">{employee.login}</p>
                  </div>
                </div>
              ))}
              {company.employees.length > 5 && (
                <p className="text-gray-400 text-sm text-center pt-2">
                  And {company.employees.length - 5} more...
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
