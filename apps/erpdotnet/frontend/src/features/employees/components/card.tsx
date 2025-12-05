"use client";

import { useState } from "react";
import { Employee } from "@/features/employees/types";
import { EditEmployeeModal } from "@/features/employees/components/edit";
import { DeleteEmployee } from "@/features/employees/api";

export function EmployeeRow({
  employee,
  companyId,
  onUpdated,
}: {
  employee: Employee;
  companyId: string;
  onUpdated: () => void;
}) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${employee.name}?`)) return;
    setIsDeleting(true);
    try {
      await DeleteEmployee(companyId, employee.id);
      onUpdated();
    } catch (e) {
      console.error(e);
      alert("Failed to delete employee");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <tr className="border-b border-neutral-800 hover:bg-neutral-800/40 transition-all">
      <td className="px-4 py-3 text-gray-200">{employee.name}</td>
      <td className="px-4 py-3 text-gray-400">{employee.login}</td>
      <td className="px-4 py-3 text-right flex justify-end gap-2">
        <EditEmployeeModal
          employee={employee}
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
      </td>
    </tr>
  );
}
