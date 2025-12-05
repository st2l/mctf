export type User = {
  id: string;
  login: string;
  name: string;
  companyId: string;
};

export type LoginForm = {
  login: string;
  password: string;
};

export type SignupForm = {
  login: string;
  password: string;
  passwordRepeat: string;
  companyName: string;
};
