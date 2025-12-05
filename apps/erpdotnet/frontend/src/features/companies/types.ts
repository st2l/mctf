import { Employee } from "@/features/employees/types";

export type Company = {
  id: string;
  name: string;
  employees: Employee[];
};
