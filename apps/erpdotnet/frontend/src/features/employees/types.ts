export type EmployeeForm = {
  login: string;
  password: string;
  passwordRepeat: string;
  name: string;
};

export type Employee = {
  id: string;
  login: string;
  name: string;
};

export type EmployeeLoginForm = {
  login: string;
  password: string;
};

export type Props = {
  employee: Employee;
  companyId: string;
  onUpdated: () => void;
};
