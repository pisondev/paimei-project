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

export default function AmeyView() {
  const router = useRouter();
  const [state, setState] = useState<CouponState | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [gachaText, setGachaText] = useState(gachaPhrases[0]);
  const [revealedCoupon, setRevealedCoupon] = useState<Coupon | null>(null);
  const [couponToRedeem, setCouponToRedeem] = useState<Coupon | null>(null);
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
      const res = await fetchAPI("/coupons/draw", { method: "POST" });
      if (!res.ok) throw new Error("Gagal mengundi");
      const drawData = await res.json();

      let counter = 0;
      const gachaInterval = setInterval(() => {
        setGachaText(gachaPhrases[counter % gachaPhrases.length]);
        counter++;
      }, 150);

      setTimeout(async () => {
        clearInterval(gachaInterval);
        setIsDrawing(false);
        const stateRes = await fetchAPI("/coupons/state");
        if (stateRes.ok) {
          const newState = await stateRes.json();
          setState(newState);
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
      const res = await fetchAPI(`/coupons/${couponToRedeem.id}/redeem`, { method: "POST" });
      if (res.ok) {
        setCouponToRedeem(null);
        fetchState();
      }
    } catch (error) {
      console.error("Gagal redeem", error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-stone-50 p-6 md:p-12 font-sans overflow-x-hidden text-stone-800">
      {/* ... (PASTE SELURUH MODAL DAN UI AMEY DARI KODE SEBELUMNYA DI SINI) ... */}
      {/* Untuk mempersingkat pesan, UI Amey di sini persis 100% dengan UI The Vault yang sudah kita buat sebelumnya */}
      {/* Mulai dari <div className="max-w-4xl mx-auto flex justify-between... */}
      <div className="max-w-4xl mx-auto flex justify-between items-center mb-16 relative z-10">
        <button onClick={() => router.push("/hub")} className="text-stone-500 hover:text-stone-800 transition-colors flex items-center gap-2 font-medium">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          Sanctuary
        </button>
        <h1 className="text-2xl md:text-3xl font-serif text-stone-800 uppercase tracking-widest">The Coupons</h1>
      </div>

      <div className="max-w-3xl mx-auto space-y-16 pb-20">
        <div className="relative border-l-2 border-stone-300 ml-4 md:ml-8 space-y-12">
          {state?.unlocked_coupons?.map((coupon, index) => (
            <div key={coupon.id} className="relative pl-8 md:pl-12 animate-fade-in-up" style={{ animationDelay: `${index * 150}ms` }}>
              <div className="absolute -left-[11px] top-8 w-5 h-5 rounded-full bg-stone-800 border-4 border-stone-50 shadow-sm"></div>
              <div className={`relative flex flex-col md:flex-row rounded-2xl overflow-hidden transition-all duration-300 shadow-lg ${
                coupon.is_redeemed ? "bg-stone-200/50 opacity-70 grayscale-[30%]" : "bg-white border border-stone-200 hover:shadow-xl hover:-translate-y-1"
              }`}>
                <div className="flex-1 p-6 md:p-8">
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <span className="text-sm font-bold uppercase tracking-widest text-stone-800 bg-stone-100 px-3 py-1 rounded-md">Week {coupon.drawn_week}</span>
                    <span className="text-xs font-medium text-stone-500 flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      {formatDate(coupon.unlocked_at)}
                    </span>
                    {coupon.is_redeemed && (
                      <span className="text-xs bg-stone-800 text-white px-3 py-1 rounded-full font-medium tracking-wide flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg> Claimed
                      </span>
                    )}
                  </div>
                  <h3 className={`text-2xl font-serif mb-2 ${coupon.is_redeemed ? "text-stone-500 line-through" : "text-stone-800"}`}>{coupon.title}</h3>
                  <p className="text-stone-600 leading-relaxed text-sm md:text-base">{coupon.description}</p>
                </div>
                <div className="hidden md:block w-0 border-l-2 border-dashed border-stone-200 relative my-4">
                   <div className="absolute -top-6 -left-3 w-6 h-6 bg-stone-50 rounded-full"></div>
                   <div className="absolute -bottom-6 -left-3 w-6 h-6 bg-stone-50 rounded-full"></div>
                </div>
                <div className="md:hidden h-0 border-t-2 border-dashed border-stone-200 relative mx-4">
                   <div className="absolute -left-6 -top-3 w-6 h-6 bg-stone-50 rounded-full"></div>
                   <div className="absolute -right-6 -top-3 w-6 h-6 bg-stone-50 rounded-full"></div>
                </div>
                <div className="bg-stone-50 md:bg-transparent p-6 md:p-8 flex items-center justify-center md:min-w-[200px]">
                  {!coupon.is_redeemed ? (
                    <button onClick={() => setCouponToRedeem(coupon)} className="w-full px-6 py-3 bg-stone-800 text-white rounded-xl text-sm font-bold tracking-widest uppercase hover:bg-stone-700 hover:shadow-lg transition-all">Redeem</button>
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-stone-200 flex items-center justify-center text-stone-400">
                      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          {state?.unlocked_coupons?.length === 0 && <div className="pl-8 md:pl-12 text-stone-400 italic">The Coupons is empty. Unveil your first surprise.</div>}
        </div>

        <div className="pt-12 border-t border-stone-200 text-center space-y-6">
          {state?.can_draw ? (
            <div className="p-8 md:p-12 rounded-3xl border border-stone-200 bg-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden">
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-stone-100 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
              <div className="w-16 h-16 bg-stone-100 text-stone-800 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="5" rx="1"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>
              </div>
              <h3 className="text-2xl font-serif text-stone-800 mb-2 relative z-10">A new gift awaits</h3>
              <p className="text-stone-500 mb-8 relative z-10">Tap below to reveal your token for Week {(state?.unlocked_coupons?.length || 0) + 1}.</p>
              <button onClick={handleDraw} className="px-10 py-4 bg-stone-800 text-white rounded-full font-bold tracking-widest uppercase hover:bg-stone-700 hover:shadow-xl transition-all transform hover:scale-105 active:scale-95 relative z-10">Draw Token</button>
            </div>
          ) : (state?.total_coupons ?? 0) === (state?.unlocked_coupons?.length ?? 0) && (state?.total_coupons ?? 0) > 0 ? (
            <div className="p-8 rounded-3xl bg-stone-100 border border-stone-200 text-stone-500 flex flex-col items-center">
              <svg className="w-10 h-10 mb-4 text-stone-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              <h3 className="text-xl font-serif text-stone-800 mb-2">Vault Emptied</h3>
              <p>You have collected every memory and surprise we stored.</p>
            </div>
          ) : (
            <div className="p-8 md:p-12 rounded-3xl bg-stone-900 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-stone-800 via-stone-400 to-stone-800 opacity-50"></div>
              <div className="flex justify-center mb-6 text-stone-500">
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
              <h3 className="text-sm font-bold tracking-widest uppercase text-stone-400 mb-4">Next Gift In</h3>
              <div className="text-4xl md:text-6xl font-serif font-medium tracking-wider mb-2 font-mono tabular-nums text-stone-100 drop-shadow-md">{timeLeft || "Unlocking..."}</div>
              <p className="text-stone-400 mt-4 italic text-sm">Patience... the best things are worth waiting for.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}