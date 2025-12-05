"use client";

import {
  Employee,
  EmployeeLoginForm,
  EmployeeForm,
} from "@/features/employees/types";
import { POST, GET, DELETE } from "@/lib/fetcher";

export async function LoginEmployee(
  form: EmployeeLoginForm,
): Promise<Employee> {
  return await POST(`/employee-login`, form, true);
}

export async function CreateEmployee(
  company_id: string,
  form: EmployeeForm,
): Promise<Employee> {
  return await POST(`?company=${company_id}&employee=true`, form, true);
}

export async function UpdateEmployee(
  company_id: string,
  id: string,
  form: EmployeeForm,
): Promise<Employee> {
  return await POST(`?company=${company_id}&employee=${id}`, form, true);
}

export async function DeleteEmployee(company_id: string, id: string) {
  return await DELETE(`?company=${company_id}&employee=${id}`, true);
}

export async function GetEmployee(
  company_id: string,
  id: string,
): Promise<Employee> {
  return await GET(`?company=${company_id}&employee=${id}`, true);
}

export async function GetEmployees(company_id: string): Promise<Employee[]> {
  return await GET(`?company=${company_id}&employees=true`, true);
}
