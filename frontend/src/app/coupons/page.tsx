"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchAPI } from "@/lib/api";

interface Coupon {
  id: number;
  title: string;
  description: string;
  is_redeemed: boolean;
  drawn_week: number;
  unlocked_at: string;
}

interface CouponState {
  current_week: number;
  next_week_start: string;
  can_draw: boolean;
  unlocked_coupons: Coupon[];
  total_coupons: number;
}

const gachaPhrases = [
  "Fetching a surprise...", "Paisen is cooking...", "Shuffling memories...",
  "Getting the Royal Treatment?", "Maybe a free meal?", "Rolling the dice..."
];

export default function CouponsTimelinePage() {
  const router = useRouter();
  const [state, setState] = useState<CouponState | null>(null);
  const [loading, setLoading] = useState(true);
  
  // State Gacha & Reveal
  const [isDrawing, setIsDrawing] = useState(false);
  const [gachaText, setGachaText] = useState(gachaPhrases[0]);
  const [revealedCoupon, setRevealedCoupon] = useState<Coupon | null>(null);

  // State Redeem Modal
  const [couponToRedeem, setCouponToRedeem] = useState<Coupon | null>(null);

  // State Countdown
  const [timeLeft, setTimeLeft] = useState("");

  const fetchState = async () => {
    try {
      const res = await fetchAPI("/coupons/state");
      if (res.ok) {
        const data = await res.json();
        setState(data);
      }
    } catch (error) {
      console.error("Gagal mengambil state kupon", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchState();
  }, []);

  useEffect(() => {
    if (!state?.next_week_start) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const target = new Date(state.next_week_start).getTime();
      const distance = target - now;

      if (distance < 0) {
        clearInterval(interval);
        setTimeLeft("00:00:00:00");
        fetchState(); 
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft(
        `${days.toString().padStart(2, '0')}d : ${hours.toString().padStart(2, '0')}h : ${minutes.toString().padStart(2, '0')}m : ${seconds.toString().padStart(2, '0')}s`
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [state?.next_week_start]);

  const handleDraw = async () => {
    setIsDrawing(true);
    
    try {
      // API Call di background pakai fetchAPI
      const res = await fetchAPI("/coupons/draw", { method: "POST" });
      if (!res.ok) throw new Error("Gagal mengundi");
      const drawData = await res.json();

      // Efek putar teks Roulette selama 3 detik
      let counter = 0;
      const gachaInterval = setInterval(() => {
        setGachaText(gachaPhrases[counter % gachaPhrases.length]);
        counter++;
      }, 150);

      setTimeout(async () => {
        clearInterval(gachaInterval);
        setIsDrawing(false);
        
        // Ambil state terbaru pakai fetchAPI
        const stateRes = await fetchAPI("/coupons/state");
        if (stateRes.ok) {
          const newState = await stateRes.json();
          setState(newState);

          // Cari kupon yang baru saja diundi dan tampilkan di Modal Reveal
          const drawn = newState.unlocked_coupons.find((c: Coupon) => c.id === drawData.id);
          if (drawn) setRevealedCoupon(drawn);
        }

      }, 3000);
    } catch (error) {
      setIsDrawing(false);
      console.error("Gagal mengundi", error);
    }
  };

  const executeRedeem = async () => {
    if (!couponToRedeem) return;
    try {
      // API Call pakai fetchAPI
      const res = await fetchAPI(`/coupons/${couponToRedeem.id}/redeem`, { method: "POST" });
      if (res.ok) {
        setCouponToRedeem(null);
        fetchState();
      }
    } catch (error) {
      console.error("Gagal redeem", error);
    }
  };

  // Helper Format Tanggal
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) return <div className="min-h-screen bg-stone-50 flex items-center justify-center">Loading the vault...</div>;

  return (
    <div className="min-h-screen bg-stone-50 p-6 md:p-12 font-sans overflow-x-hidden text-stone-800">
      
      {/* =========================================
          MODAL 1: CINEMATIC GACHA SHUFFLE
      ========================================= */}
      {isDrawing && (
        <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-stone-900/85 backdrop-blur-md transition-all duration-500 animate-fade-in">
          <svg className="w-16 h-16 text-white mb-8 animate-spin-slow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
          </svg>
          <h2 className="text-3xl md:text-5xl font-serif text-white tracking-wider animate-pulse scale-110 transition-transform text-center px-4">
            {gachaText}
          </h2>
        </div>
      )}

      {/* =========================================
          MODAL 2: REVEAL DRAWN COUPON
      ========================================= */}
      {revealedCoupon && (
        <div className="fixed inset-0 z-[150] flex flex-col items-center justify-center bg-stone-900/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="text-center mb-8 animate-fade-in-up">
            <h2 className="text-3xl font-serif text-white tracking-widest uppercase mb-2">Coupon Acquired!</h2>
            <p className="text-stone-300">Week {revealedCoupon.drawn_week} surprise is here.</p>
          </div>

          {/* Ticket Design untuk Reveal */}
          <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-zoom-in">
            {/* Cutouts pinggir */}
            <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-stone-900 rounded-full"></div>
            <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-stone-900 rounded-full"></div>
            
            <div className="p-8 md:p-10 text-center border-b-2 border-dashed border-stone-200">
              <h3 className="text-3xl font-serif text-stone-800 mb-4">{revealedCoupon.title}</h3>
              <p className="text-stone-600">{revealedCoupon.description}</p>
            </div>
            <div className="bg-stone-50 p-6 flex justify-center">
              <button 
                onClick={() => setRevealedCoupon(null)}
                className="px-8 py-3 bg-stone-800 text-white rounded-full font-bold uppercase tracking-widest hover:bg-stone-700 transition-all hover:scale-105"
              >
                Accept Coupon
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================
          MODAL 3: CUSTOM CONFIRM REDEEM
      ========================================= */}
      {couponToRedeem && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white p-8 rounded-3xl max-w-sm w-full shadow-2xl text-center animate-zoom-in">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/></svg>
            </div>
            <h3 className="text-2xl font-serif text-stone-800 mb-2">Use this coupon?</h3>
            <p className="text-stone-500 mb-8 text-sm">Once used, this action cannot be undone. Paisen will have to fulfill it!</p>
            <div className="flex flex-col gap-3">
              <button onClick={executeRedeem} className="w-full py-3 bg-stone-800 text-white rounded-xl font-bold uppercase tracking-wider hover:bg-stone-700 transition-all">
                Yes, Use It Now
              </button>
              <button onClick={() => setCouponToRedeem(null)} className="w-full py-3 bg-stone-100 text-stone-600 rounded-xl font-bold uppercase tracking-wider hover:bg-stone-200 transition-all">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}


      {/* =========================================
          MAIN PAGE CONTENT
      ========================================= */}
      <div className="max-w-4xl mx-auto flex justify-between items-center mb-16 relative z-10">
        <button onClick={() => router.push("/hub")} className="text-stone-500 hover:text-stone-800 transition-colors flex items-center gap-2 font-medium">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          Back
        </button>
        <h1 className="text-2xl md:text-3xl font-serif text-stone-800 uppercase tracking-widest">The Coupons</h1>
      </div>

      <div className="max-w-3xl mx-auto space-y-16 pb-20">

        {/* SECTION 1: TIMELINE KUPON YANG SUDAH TERBUKA */}
        <div className="relative border-l-2 border-stone-300 ml-4 md:ml-8 space-y-12">
          {state?.unlocked_coupons?.map((coupon, index) => (
            <div key={coupon.id} className="relative pl-8 md:pl-12 animate-fade-in-up" style={{ animationDelay: `${index * 150}ms` }}>
              
              {/* Bulatan Timeline */}
              <div className="absolute -left-[11px] top-8 w-5 h-5 rounded-full bg-stone-800 border-4 border-stone-50 shadow-sm"></div>
              
              {/* DESAIN TICKET MODERN */}
              <div className={`relative flex flex-col md:flex-row rounded-2xl overflow-hidden transition-all duration-300 shadow-lg ${
                coupon.is_redeemed ? "bg-stone-200/50 opacity-70 grayscale-[30%]" : "bg-white border border-stone-200 hover:shadow-xl hover:-translate-y-1"
              }`}>
                
                {/* Bagian Kiri: Header & Teks */}
                <div className="flex-1 p-6 md:p-8 relative">
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <span className="text-sm font-bold uppercase tracking-widest text-stone-800 bg-stone-100 px-3 py-1 rounded-md">
                      Week {coupon.drawn_week}
                    </span>
                    <span className="text-xs font-medium text-stone-500 flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      {formatDate(coupon.unlocked_at)}
                    </span>
                    {coupon.is_redeemed && (
                      <span className="text-xs bg-stone-800 text-white px-3 py-1 rounded-full font-medium tracking-wide flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                        Redeemed
                      </span>
                    )}
                  </div>
                  <h3 className={`text-2xl font-serif mb-2 ${coupon.is_redeemed ? "text-stone-500 line-through" : "text-stone-800"}`}>
                    {coupon.title}
                  </h3>
                  <p className="text-stone-600 leading-relaxed text-sm md:text-base pr-4">
                    {coupon.description}
                  </p>
                </div>

                {/* Garis Putus-putus Pemisah Tiket */}
                <div className="hidden md:flex flex-col items-center justify-center relative w-8 border-l-2 border-dashed border-stone-200 my-4">
                  <div className="absolute -top-6 w-6 h-6 bg-stone-50 rounded-full"></div>
                  <div className="absolute -bottom-6 w-6 h-6 bg-stone-50 rounded-full"></div>
                </div>

                {/* Garis Putus-putus Mobile */}
                <div className="md:hidden w-full h-8 relative flex items-center justify-center border-t-2 border-dashed border-stone-200 mx-4">
                  <div className="absolute -left-6 w-6 h-6 bg-stone-50 rounded-full"></div>
                  <div className="absolute -right-6 w-6 h-6 bg-stone-50 rounded-full"></div>
                </div>

                {/* Bagian Kanan: Aksi */}
                <div className="bg-stone-50 md:bg-transparent p-6 md:p-8 flex items-center justify-center min-w-[160px]">
                  {!coupon.is_redeemed ? (
                    <button
                      onClick={() => setCouponToRedeem(coupon)}
                      className="w-full md:w-auto px-6 py-3 bg-stone-800 text-white rounded-xl text-sm font-bold tracking-widest uppercase hover:bg-stone-700 hover:shadow-lg transition-all"
                    >
                      Use Coupon
                    </button>
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-stone-200 flex items-center justify-center text-stone-400">
                      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                    </div>
                  )}
                </div>

              </div>
            </div>
          ))}

          {state?.unlocked_coupons?.length === 0 && (
            <div className="pl-8 md:pl-12 text-stone-400 italic">Coupon collection is empty. Draw your first one!</div>
          )}
        </div>

        {/* SECTION 2: GACHA / COUNTDOWN AREA */}
        <div className="pt-12 border-t border-stone-200 text-center space-y-6">
          
          {state?.can_draw ? (
            <div className="p-8 md:p-12 rounded-3xl border border-stone-200 bg-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden">
              {/* Aksen background blur estetik */}
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-stone-100 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
              
              <div className="w-16 h-16 bg-stone-100 text-stone-800 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="5" rx="1"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>
              </div>
              <h3 className="text-2xl font-serif text-stone-800 mb-2 relative z-10">A new coupon is available!</h3>
              <p className="text-stone-500 mb-8 relative z-10">Tap the button below to draw your surprise for Week {(state?.unlocked_coupons?.length || 0) + 1}.</p>
              <button 
                onClick={handleDraw}
                className="px-10 py-4 bg-stone-800 text-white rounded-full font-bold tracking-widest uppercase hover:bg-stone-700 hover:shadow-xl transition-all transform hover:scale-105 active:scale-95 relative z-10"
              >
                Draw Coupon
              </button>
            </div>
          ) : state?.total_coupons === state?.unlocked_coupons?.length ? (
            <div className="p-8 rounded-3xl bg-stone-100 border border-stone-200 text-stone-500 flex flex-col items-center">
              <svg className="w-10 h-10 mb-4 text-stone-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              <h3 className="text-xl font-serif text-stone-800 mb-2">All Coupons Unlocked!</h3>
              <p>You have collected all the surprises.</p>
            </div>
          ) : (
            <div className="p-8 md:p-12 rounded-3xl bg-stone-900 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-stone-800 via-stone-400 to-stone-800 opacity-50"></div>
              <div className="flex justify-center mb-6 text-stone-500">
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
              <h3 className="text-sm font-bold tracking-widest uppercase text-stone-400 mb-4">Next Drop In</h3>
              <div className="text-4xl md:text-6xl font-serif font-medium tracking-wider mb-2 font-mono tabular-nums text-stone-100 drop-shadow-md">
                {timeLeft || "Calculating..."}
              </div>
              <p className="text-stone-400 mt-4 italic text-sm">Patience... good things come to those who wait.</p>
            </div>
          )}

        </div>

      </div>

      <style jsx global>{`
        @keyframes fade-in { 0% { opacity: 0; } 100% { opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.4s ease-out forwards; }
        
        @keyframes fade-in-up { 0% { opacity: 0; transform: translateY(30px); } 100% { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { animation: fade-in-up 0.8s cubic-bezier(0.25, 1, 0.5, 1) forwards; opacity: 0; }
        
        @keyframes zoom-in { 0% { opacity: 0; transform: scale(0.95); } 100% { opacity: 1; transform: scale(1); } }
        .animate-zoom-in { animation: zoom-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

        .animate-spin-slow { animation: spin 3s linear infinite; }
      `}</style>
    </div>
  );
}