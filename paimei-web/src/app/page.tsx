"use client";

import { useState } from "react";
// HAPUS useRouter, kita tidak memakainya lagi untuk navigasi sukses
import { fetchAPI } from "@/lib/api";
import { createSession } from "../actions/auth"; // IMPORT SERVER ACTION

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); 
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false); 

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetchAPI("/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        const data = await res.json();
        
        // Simpan username di local storage untuk sapaan UI
        localStorage.setItem("currentUser", username);
        
        // DELEGASIKAN SET COOKIE DAN REDIRECT KE SERVER ACTION
        await createSession(data.token);
        
      } else {
        const data = await res.json();
        setError(data.error || "Oops! Coba ingat-ingat lagi hari spesial kita.");
        setIsLoading(false);
      }
    } catch (err: any) {
      // Tangkap error bawaan fungsi redirect() Next.js agar tidak masuk ke blok error UI
      if (err?.message === "NEXT_REDIRECT" || err?.digest?.startsWith("NEXT_REDIRECT")) {
        throw err;
      }
      setError("Gagal terhubung ke server. Pastikan API menyala.");
      setIsLoading(false);
    }
  };

  // ... (SISA KODE RENDER UI SAMA PERSIS)

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-serif text-stone-800 tracking-wide">
            Our Chapter
          </h1>
          <p className="text-sm text-stone-500">
            Please enter your credentials to continue.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-1">
            <label className="text-sm font-medium text-stone-700">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-400 transition-all text-stone-800"
              placeholder="paisen / amey"
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-1 relative">
            <label className="text-sm font-medium text-stone-700">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-400 transition-all text-stone-800 pr-12"
                placeholder="The day it all started..."
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center px-4 text-stone-400 hover:text-stone-600 focus:outline-none transition-colors"
                disabled={isLoading}
              >
                {showPassword ? (
                  <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                ) : (
                  <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                )}
              </button>
            </div>
          </div>

          {error && <p className="text-red-500 text-sm text-center animate-pulse">{error}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-stone-800 text-white py-3 rounded-lg hover:bg-stone-700 transition-colors duration-300 font-medium tracking-wide disabled:opacity-70 flex justify-center items-center gap-2"
          >
            {isLoading ? <span className="animate-pulse">Unlocking...</span> : "Unlock Memories"}
          </button>
        </form>
      </div>
    </div>
  );
}