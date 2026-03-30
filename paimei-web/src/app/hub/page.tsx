"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ToastProvider";

export default function HubPage() {
  const router = useRouter();
  const { addToast } = useToast();

  const [showContent, setShowContent] = useState(false);
  const [isCouponsUnlocked, setIsCouponsUnlocked] = useState(false);
  const [currentUser, setCurrentUser] = useState("Amey");
  
  // State untuk Ulang Tahun
  const [isBirthday, setIsBirthday] = useState(false);
  const [timeObj, setTimeObj] = useState({ d: '--', h: '--', m: '--', s: '--' });
  const [isShaking, setIsShaking] = useState(false);

  useEffect(() => {
    // 1. Ambil data user yang login
    const user = localStorage.getItem("currentUser");
    if (user) {
      setCurrentUser(user.charAt(0).toUpperCase() + user.slice(1));
    }

    // 2. Cek status kupon
    const unlocked = localStorage.getItem("isCouponsUnlocked");
    if (unlocked === "true") {
      setIsCouponsUnlocked(true);
    }

    // 3. Efek Fade-in halaman
    const timer = setTimeout(() => setShowContent(true), 100);

    // 4. Logika Countdown Ulang Tahun (Target: 31 Maret 2026, 00:00 WIB)
    const targetDate = new Date("2026-03-30T22:29:00+07:00").getTime();
    
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance <= 0) {
        setIsBirthday(true);
        clearInterval(interval);
      } else {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        setTimeObj({
          d: days.toString().padStart(2, '0'),
          h: hours.toString().padStart(2, '0'),
          m: minutes.toString().padStart(2, '0'),
          s: seconds.toString().padStart(2, '0')
        });
      }
    }, 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  const handleBirthdayClick = () => {
    // KUNCI MASTER: Jika yang login adalah Paisen, langsung buka!
    const isAdmin = currentUser.toLowerCase() === "paisen";

    if (isBirthday || isAdmin) {
      router.push("/birthday");
    } else {
      addToast("Patience... the time hasn't come yet!", "warning");
      
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);

      if (typeof window !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([100, 50, 100]); 
      }
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-6 md:p-12 relative overflow-hidden text-stone-800">
      
      {/* Background Aesthetic Elements */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-stone-200/50 to-transparent pointer-events-none"></div>
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-stone-200/50 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-stone-200/50 rounded-full blur-3xl pointer-events-none"></div>

      <div className={`max-w-5xl w-full z-10 transition-all duration-1000 transform ${
          showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
        }`}
      >
        {/* Header Section */}
        <div className="text-center space-y-6 mb-16">
          <p className="text-sm font-bold uppercase tracking-widest text-stone-400">
            Welcome Back, {currentUser}
          </p>
          <h1 className="text-4xl md:text-6xl font-serif text-stone-800 leading-tight">
            A quiet sanctuary <br className="hidden md:block" /> preserving our eternity.
          </h1>
          <div className="w-16 h-1 bg-stone-300 mx-auto rounded-full"></div>
          <p className="text-lg md:text-xl text-stone-500 italic font-serif">
            "Four years of us, and a lifetime more to go."
          </p>
        </div>

        {/* Navigation Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          
          {/* CARD 1: Anniversary */}
          <div
            onClick={() => router.push("/anniversary")}
            className="group relative flex flex-col p-8 bg-white rounded-[2rem] border border-stone-200 shadow-sm hover:shadow-xl hover:-translate-y-1 active:scale-[0.98] active:translate-y-0 transition-all duration-300 cursor-pointer overflow-hidden"
          >
            <div className="w-14 h-14 bg-stone-50 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-stone-100 transition-all">
              <svg className="w-6 h-6 text-stone-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
            </div>
            <h3 className="text-2xl font-serif text-stone-800 mb-2">The 4-Year Journey</h3>
            <p className="text-stone-500 text-sm leading-relaxed mb-8 flex-1">
              An interactive gallery capturing our journey, from the very first spark to the love we share today.
            </p>
            <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-stone-400 group-hover:text-stone-800 transition-colors">
              Enter Chapter 
              <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </div>
          </div>

          {/* CARD 2: Love Coupons */}
          <div
            onClick={() => isCouponsUnlocked && router.push("/coupons")}
            className={`group relative flex flex-col p-8 rounded-[2rem] border transition-all duration-300 overflow-hidden ${
              isCouponsUnlocked 
                ? "bg-white border-stone-200 shadow-sm hover:shadow-xl hover:-translate-y-1 active:scale-[0.98] active:translate-y-0 cursor-pointer" 
                : "bg-stone-100/50 border-stone-200/50 cursor-pointer"
            }`}
          >
            <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-6 transition-all ${isCouponsUnlocked ? "bg-stone-50 group-hover:scale-110 group-hover:bg-stone-100" : "bg-stone-200/50"}`}>
              {isCouponsUnlocked ? (
                <svg className="w-6 h-6 text-stone-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/></svg>
              ) : (
                <svg className="w-6 h-6 text-stone-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              )}
            </div>
            <h3 className={`text-2xl font-serif mb-2 ${isCouponsUnlocked ? "text-stone-800" : "text-stone-500"}`}>
              The Coupons
            </h3>
            <p className={`text-sm leading-relaxed mb-8 flex-1 ${isCouponsUnlocked ? "text-stone-500" : "text-stone-400"}`}>
              {isCouponsUnlocked 
                ? "An exclusive collection of weekly tokens, ready to be drawn whenever you desire."
                : "Unlock the first chapter of our story to reveal the secrets hidden within."}
            </p>
            <div className={`flex items-center gap-2 text-sm font-bold uppercase tracking-widest transition-colors ${isCouponsUnlocked ? "text-stone-400 group-hover:text-stone-800" : "text-stone-400/50"}`}>
              {isCouponsUnlocked ? "Open Vault" : "Locked"}
              {isCouponsUnlocked && (
                <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              )}
            </div>
          </div>

          {/* CARD 3: Birthday (Chapter 20) */}
          <div
            onClick={handleBirthdayClick}
            className={`group relative flex flex-col p-8 rounded-[2rem] border transition-all duration-300 overflow-hidden cursor-pointer active:scale-[0.98] active:translate-y-0 ${
              isBirthday 
                ? "bg-stone-900 border-stone-800 shadow-2xl hover:-translate-y-1" 
                : "bg-white border-stone-200 shadow-sm hover:shadow-md hover:border-stone-300 hover:-translate-y-1"
            } ${isShaking ? "animate-shake border-red-300/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]" : ""}`}
          >
            {isBirthday && <div className="absolute top-0 right-0 w-32 h-32 bg-stone-700 blur-3xl rounded-full opacity-50 pointer-events-none"></div>}

            <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-6 transition-all ${isBirthday ? "bg-stone-800 group-hover:scale-110 group-hover:bg-stone-700" : "bg-stone-50 group-hover:scale-110 group-hover:bg-stone-100"}`}>
              {isBirthday ? (
                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8"/><path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1"/><path d="M2 21h20"/><path d="M7 8v3"/><path d="M12 8v3"/><path d="M17 8v3"/><path d="M7 4h.01"/><path d="M12 4h.01"/><path d="M17 4h.01"/></svg>
              ) : (
                <svg className="w-6 h-6 text-stone-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M12 14v4"/><path d="M10 16h4"/></svg>
              )}
            </div>
            
            <h3 className={`text-2xl font-serif mb-2 ${isBirthday ? "text-white" : "text-stone-800"}`}>
              Chapter 20
            </h3>
            
            <div className={`text-sm leading-relaxed mb-8 flex-1 ${isBirthday ? "text-stone-300" : "text-stone-500"}`}>
              {isBirthday 
                ? "Happy birthday, Amey! A special, secret invitation is waiting for you inside."
                : (
                  <div className="space-y-4">
                    <p>A secret surprise safely locked away, set to unfold automatically on March 31st.</p>
                    
                    {/* UI COUNTDOWN MODERN */}
                    <div>
                      <p className="text-[10px] font-bold tracking-widest uppercase text-stone-400 mb-2">Unlocks In</p>
                      <div className="flex gap-2">
                        {Object.entries(timeObj).map(([unit, value]) => (
                          <div key={unit} className="flex flex-col items-center justify-center bg-stone-50 border border-stone-200 w-11 h-12 rounded-xl shadow-sm">
                            <span className="font-mono text-stone-700 font-bold text-sm leading-none">{value}</span>
                            <span className="text-[9px] font-bold uppercase tracking-wider text-stone-400 mt-1">{unit}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              }
            </div>

            <div className={`flex items-center gap-2 text-sm font-bold uppercase tracking-widest transition-colors ${isBirthday ? "text-stone-400 group-hover:text-white" : "text-stone-400 group-hover:text-stone-800"}`}>
              {isBirthday ? "Open Gift" : "Scheduled"}
              {/* Tambahan Panah */}
              <svg className={`w-4 h-4 transition-transform duration-300 ${isBirthday ? "group-hover:translate-x-1" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {isBirthday ? (
                  <><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></>
                ) : (
                  <><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></> // Ikon Gembok Kecil untuk Scheduled
                )}
              </svg>
            </div>
          </div>

        </div>
      </div>

      <style jsx global>{`
        /* Keyframes untuk efek getar */
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-4px) rotate(-1deg); }
          40%, 80% { transform: translateX(4px) rotate(1deg); }
        }
        .animate-shake {
          animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
        }
      `}</style>
    </div>
  );
}