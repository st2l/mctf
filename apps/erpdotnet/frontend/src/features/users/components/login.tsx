"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Login } from "@/features/users/api";

type Props = {
  open: boolean;
  onClose: () => void;
  onSwitchToSignup: () => void;
};

export function LoginModal({ open, onClose, onSwitchToSignup }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ login: "", password: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = await Login(form);

    setLoading(false);
    if (!result.success) {
      alert("Incorrect login or password");
      return;
    }

    onClose();
    router.push("/company");
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
      <div className="w-full max-w-md">
        <form
          onSubmit={handleSubmit}
          className="space-y-5 bg-neutral-950/60 backdrop-blur-sm border border-neutral-800 p-8 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.9)]"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-gray-100">Login</h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-200 transition"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div>
            <label htmlFor="login" className="block text-sm mb-1 text-gray-400">
              Login
            </label>
            <input
              id="login"
              type="text"
              placeholder="Login"
              value={form.login}
              onChange={(e) => setForm({ ...form, login: e.target.value })}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-md px-3 py-2 text-gray-100
                         focus:border-cyan-400 outline-none transition"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm mb-1 text-gray-400"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-md px-3 py-2 text-gray-100
                         focus:border-cyan-400 outline-none transition"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-md border border-cyan-600 text-cyan-300 font-medium tracking-wide
                       hover:bg-cyan-600/10 active:bg-cyan-600/20 transition-all"
          >
            {loading ? "Logging in..." : "Log in"}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={onSwitchToSignup}
              className="text-sm text-cyan-400 hover:text-cyan-300 transition"
            >
              Dont have an account? Sign up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
