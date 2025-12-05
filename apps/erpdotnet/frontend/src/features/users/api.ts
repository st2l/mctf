"use client";

import { LoginForm, SignupForm } from "@/features/users/types";
import { POST } from "@/lib/fetcher";

async function setToken(token: string) {
  document.cookie = `token=${token}; Path=/; Max-Age=${60 * 60 * 24 * 7}`;
}

export async function Login(loginForm: LoginForm) {
  const data = await POST("/login", loginForm, false);

  await setToken(data.token);

  return { success: true };
}

export async function Signup(signupForm: SignupForm) {
  const { password, passwordRepeat } = signupForm;

  if (password !== passwordRepeat) {
    throw new Error("Passwords do not match");
  }

  const data = await POST("/register", signupForm, false);

  await setToken(data.token);

  return { success: true };
}
