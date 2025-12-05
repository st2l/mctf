"use client";

import { useState } from "react";
import { EmployeeForm } from "@/features/employees/types";
import { UpdateEmployee } from "@/features/employees/api";
import { Props } from "@/features/employees/types";

export function EditEmployeeModal({ employee, companyId, onUpdated }: Props) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<EmployeeForm>({
    login: employee.login,
    password: "",
    passwordRepeat: "",
    name: employee.name,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password && form.password !== form.passwordRepeat) {
      alert("Passwords don't match");
      return;
    }
    setLoading(true);
    await UpdateEmployee(companyId, employee.id, form);
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
            <h3 className="text-lg font-bold text-cyan-300">Edit Employee</h3>

            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Name"
              className="w-full p-2 rounded border border-neutral-700 bg-neutral-800 text-gray-100"
              required
            />

            <input
              type="text"
              value={form.login}
              onChange={(e) => setForm({ ...form, login: e.target.value })}
              placeholder="Login"
              className="w-full p-2 rounded border border-neutral-700 bg-neutral-800 text-gray-100"
              required
            />

            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="New Password (leave empty to keep current)"
              className="w-full p-2 rounded border border-neutral-700 bg-neutral-800 text-gray-100"
            />

            <input
              type="password"
              value={form.passwordRepeat}
              onChange={(e) =>
                setForm({ ...form, passwordRepeat: e.target.value })
              }
              placeholder="Repeat New Password"
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
