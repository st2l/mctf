"use client";

import { useState } from "react";
import { CreateEmployee } from "@/features/employees/api";
import { EmployeeForm } from "@/features/employees/types";

type Props = {
  companyId: string;
  onCreated: () => void;
};

export function CreateEmployeeModal({ companyId, onCreated }: Props) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<EmployeeForm>({
    login: "",
    password: "",
    passwordRepeat: "",
    name: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.password !== form.passwordRepeat) {
      alert("Passwords don't match");
      return;
    }

    setLoading(true);
    try {
      await CreateEmployee(companyId, form);
      setForm({
        login: "",
        password: "",
        passwordRepeat: "",
        name: "",
      });
      setOpen(false);
      onCreated();
    } catch (e) {
      console.error(e);
      alert("Failed to create employee");
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
        Add Employee
      </button>

      {open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <form
            onSubmit={handleSubmit}
            className="bg-neutral-900 p-6 rounded-xl border border-neutral-800 w-full max-w-md space-y-4"
          >
            <h3 className="text-lg font-bold text-cyan-300">
              Create New Employee
            </h3>

            <div>
              <label className="text-sm text-gray-400 block mb-1">Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="John Doe"
                className="w-full p-2 rounded border border-neutral-700 bg-neutral-800 text-gray-100"
                required
              />
            </div>

            <div>
              <label className="text-sm text-gray-400 block mb-1">Login</label>
              <input
                type="text"
                value={form.login}
                onChange={(e) => setForm({ ...form, login: e.target.value })}
                placeholder="johndoe"
                className="w-full p-2 rounded border border-neutral-700 bg-neutral-800 text-gray-100"
                required
              />
            </div>

            <div>
              <label className="text-sm text-gray-400 block mb-1">
                Password
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                className="w-full p-2 rounded border border-neutral-700 bg-neutral-800 text-gray-100"
                required
              />
            </div>

            <div>
              <label className="text-sm text-gray-400 block mb-1">
                Repeat Password
              </label>
              <input
                type="password"
                value={form.passwordRepeat}
                onChange={(e) =>
                  setForm({ ...form, passwordRepeat: e.target.value })
                }
                placeholder="••••••••"
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
