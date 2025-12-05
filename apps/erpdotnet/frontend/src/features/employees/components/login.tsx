import { LoginEmployee } from "@/features/employees/api";

export function LoginEmployeeForm() {
  function action(formData: FormData) {
    const login = formData.get("login") as string;
    const password = formData.get("password") as string;

    LoginEmployee({ login, password });
    return;
  }

  return (
    <form action={action}>
      <div>
        <label htmlFor="login">Login</label>
        <input id="login" name="login" type="text" placeholder="Login" />
      </div>
      <div>
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" />
      </div>
      <button type="submit">Log in!</button>
    </form>
  );
}
