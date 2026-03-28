"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ToastProvider";

// Import Komponen yang baru kita buat
import AmeyView from "./AmeyView";
import PaisenView from "./PaisenView";

export default function BirthdayPageWrapper() {
  const router = useRouter();
  const { addToast } = useToast();
  
  const [currentUser, setCurrentUser] = useState("Amey");
  const [isPageMounted, setIsPageMounted] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [loading, setLoading] = useState(true);

  const [invitation, setInvitation] = useState<any>(null);
  const [dustParticles, setDustParticles] = useState<any[]>([]);

  useEffect(() => {
    const user = localStorage.getItem("currentUser")?.toLowerCase();
    if (user) setCurrentUser(user);

    // Magical Dust Generation
    const particles = [...Array(35)].map(() => ({
      tx: (Math.random() - 0.5) * 200, 
      ty: -Math.random() * 200 - 50,  
      delay: Math.random() * 5,
      dur: Math.random() * 5 + 6,
      size: Math.random() * 3 + 1
    }));
    setDustParticles(particles);

    setTimeout(() => setIsPageMounted(true), 50);
    fetchInvitation();
  }, []);

  const fetchInvitation = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/invitation");
      const data = await res.json();
      setInvitation(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setIsExiting(true);
    setTimeout(() => router.push("/hub"), 600);
  };

  const saveAmey = async (payload: any) => {
    try {
      const res = await fetch("http://localhost:8080/api/invitation/accept", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
      });
      if (res.ok) {
        addToast("Outfit and Date Saved!", "success");
        fetchInvitation();
      }
    } catch (error) { addToast("Failed to save", "error"); }
  };

  const savePaisen = async (payload: any) => {
    try {
      const res = await fetch("http://localhost:8080/api/invitation/paisen", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
      });
      if (res.ok) {
        addToast("Paisen's outfit updated successfully!", "success");
        fetchInvitation();
      }
    } catch (error) { addToast("Failed to save", "error"); }
  };

  if (loading) return <div className="min-h-screen bg-stone-900 flex items-center justify-center text-stone-400">Unwrapping...</div>;

  const isAmey = currentUser === "amey";

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 p-6 md:p-12 relative overflow-hidden flex flex-col justify-center selection:bg-stone-700 selection:text-white">
      
      {/* OVERLAY TRANSISI DARI HUB */}
      <div className={`fixed inset-0 z-[999] bg-stone-50 transition-opacity duration-700 pointer-events-none ${isPageMounted && !isExiting ? 'opacity-0' : 'opacity-100'}`} />

      {/* MAGICAL DUST BACKGROUND */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {dustParticles.map((p, i) => (
          <div 
            key={i} 
            className="absolute bg-white rounded-full opacity-0"
            style={{
              width: p.size + 'px', height: p.size + 'px',
              left: (i * 2.8) + '%', top: '95%',
              animation: `magical-dust ${p.dur}s ease-in-out infinite`,
              animationDelay: `${p.delay}s`,
              '--tx': `${p.tx}px`, '--ty': `${p.ty}px`
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* TOMBOL BACK GLOBAL */}
      <div className="absolute top-6 left-6 md:top-12 md:left-12 z-[100] animate-fade-in-up">
        <button onClick={handleBack} className="group flex items-center gap-3 px-5 py-2.5 bg-stone-800/40 hover:bg-stone-700/60 backdrop-blur-md border border-stone-600/50 rounded-full text-stone-300 hover:text-white transition-all shadow-lg">
          <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          <span className="font-medium tracking-wide text-sm uppercase">Back</span>
        </button>
      </div>

      {/* RENDER VIEW BERDASARKAN USER */}
      <div className="relative z-10 w-full h-full">
        {isAmey ? (
          <AmeyView invitation={invitation} onSave={saveAmey} />
        ) : (
          <PaisenView invitation={invitation} onSavePaisen={savePaisen} />
        )}
      </div>

      <style jsx global>{`
        @keyframes fade-in-up { 0% { opacity: 0; transform: translateY(30px); } 100% { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { animation: fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
        @keyframes zoom-in { 0% { opacity: 0; transform: scale(0.95); } 100% { opacity: 1; transform: scale(1); } }
        .animate-zoom-in { animation: zoom-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes magical-dust {
          0% { transform: translate(0, 0) scale(0.5); opacity: 0; filter: blur(2px); }
          20% { opacity: 0.8; filter: blur(1px); }
          80% { opacity: 0.8; filter: blur(2px); }
          100% { transform: translate(var(--tx), var(--ty)) scale(1.5); opacity: 0; filter: blur(4px); }
        }
      `}</style>
    </div>
  );
}