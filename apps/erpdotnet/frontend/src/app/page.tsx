"use client";

import { useState } from "react";
import { LoginModal } from "@/features/users/components/login";
import { SignupModal } from "@/features/users/components/signup";

export default function LandingPage() {
  const [loginOpen, setLoginOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-neutral-950 text-gray-100 p-6">
      <div className="text-center space-y-6 bg-neutral-900/50 backdrop-blur-sm border border-neutral-800 p-10 rounded-2xl shadow-[0_0_25px_rgba(0,0,0,0.8)] max-w-2xl w-full">
        <h1 className="text-4xl font-bold tracking-wide text-cyan-300">
          ERPNET
        </h1>
        <p className="text-gray-400 text-lg">No Safety Engaged.</p>

        {/* simple static graphic */}
        <div className="w-full h-40 bg-linear-to-br from-cyan-600/20 to-purple-600/20 border border-neutral-800 rounded-xl flex items-center justify-center">
          <span className="text-cyan-200/80 text-xl">
            [ graphics placeholder ]
          </span>
        </div>

        <div className="flex items-center justify-center gap-4 pt-4">
          <button
            onClick={() => setSignupOpen(true)}
            className="px-6 py-2 rounded-md border border-cyan-600 text-cyan-300 font-medium tracking-wide hover:bg-cyan-600/10 active:bg-cyan-600/20 transition-all"
          >
            Join
          </button>

          <button
            onClick={() => setLoginOpen(true)}
            className="px-6 py-2 rounded-md border border-purple-600 text-purple-300 font-medium tracking-wide hover:bg-purple-600/10 active:bg-purple-600/20 transition-all"
          >
            Im already in
          </button>
        </div>
      </div>

      <LoginModal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        onSwitchToSignup={() => {
          setLoginOpen(false);
          setSignupOpen(true);
        }}
      />

      <SignupModal
        open={signupOpen}
        onClose={() => setSignupOpen(false)}
        onSwitchToLogin={() => {
          setSignupOpen(false);
          setLoginOpen(true);
        }}
      />
    </main>
  );
}
