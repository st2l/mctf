"use client";

import { useEffect, useState } from "react";
import { getCompanyIdFromToken } from "@/lib/fetcher";
import { GetEmployees } from "@/features/employees/api";
import { EmployeeRow } from "@/features/employees/components/card";
import { CreateEmployeeModal } from "@/features/employees/components/create";
import { Employee } from "@/features/employees/types";

export default function EmployeesPage() {
  const [companyId, setCompanyId] = useState<string>("");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = getCompanyIdFromToken();
    //eslint-disable-next-line react-hooks/set-state-in-effect
    setCompanyId(id);
  }, []);

  useEffect(() => {
    if (!companyId) return;

    const loadEmployees = async () => {
      setLoading(true);
      const data = await GetEmployees(companyId);
      setEmployees(data);
      setLoading(false);
    };

    loadEmployees();
  }, [companyId]);

  const reloadEmployees = () => {
    if (companyId) {
      GetEmployees(companyId).then(setEmployees);
    }
  };

  if (loading || !companyId) {
    return (
      <main className="min-h-screen p-10 text-gray-100 bg-neutral-950">
        <h1 className="text-3xl font-bold mb-8 text-cyan-300">Employees</h1>
        <p className="text-gray-400">Loading...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-10 text-gray-100 bg-neutral-950">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-cyan-300">Employees</h1>
        <CreateEmployeeModal
          companyId={companyId}
          onCreated={reloadEmployees}
        />
      </div>

      {employees.length === 0 ? (
        <div className="text-center py-12 bg-neutral-900/60 border border-neutral-800 rounded-xl">
          <p className="text-gray-400 mb-4">No employees yet</p>
          <p className="text-gray-500 text-sm">
            Click &quot;Add Employee&quot; to create your first employee
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
                Login
              </th>
              <th className="px-4 py-3 text-right text-gray-300 font-medium">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <EmployeeRow
                key={emp.id}
                employee={emp}
                companyId={companyId}
                onUpdated={reloadEmployees}
              />
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
