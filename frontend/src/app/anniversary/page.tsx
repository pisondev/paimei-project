"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import memoryCards from "../../data/anniversary.json";

export default function AnniversaryPage() {
  const router = useRouter();
  
  // State Intro Sequence
  // 0: Init, 1: Text Fade In, 2: Text Fade Out, 3: Show Main UI
  const [introState, setIntroState] = useState(0); 
  const [isPageMounted, setIsPageMounted] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [showUnlockAnim, setShowUnlockAnim] = useState(false);

  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionId, setTransitionId] = useState<number | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [hasDragged, setHasDragged] = useState(false);

  useEffect(() => {
    setIsPageMounted(true);
    // Sequence Timing Intro (DIPERCEPAT)
    const t1 = setTimeout(() => setIntroState(1), 200);  // Munculkan teks lebih cepat
    const t2 = setTimeout(() => setIntroState(2), 1200); // Pudarkan teks lebih cepat
    const t3 = setTimeout(() => setIntroState(3), 1800); // Mulai UI utama (total 1.8s)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  const handleBack = () => {
    if (selectedCard !== null) {
      setSelectedCard(null);
    } else {
      setIsExiting(true);
      setTimeout(() => router.push("/hub"), 600);
    }
  };

  const handleComplete = () => {
    localStorage.setItem("isCouponsUnlocked", "true");
    setShowUnlockAnim(true);
    setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => router.push("/hub"), 600);
    }, 1500);
  };

  const handleCardClick = (id: number) => {
    if (hasDragged) {
      setHasDragged(false);
      return;
    }
    setTransitionId(id);
    setIsTransitioning(true);
    setTimeout(() => {
      setSelectedCard(id);
      setIsTransitioning(false);
      setTransitionId(null);
    }, 800);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setHasDragged(false);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => setIsDragging(false);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    if (Math.abs(walk) > 10) setHasDragged(true);
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const activeCard = memoryCards.find((c) => c.id === selectedCard);

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 p-4 md:p-8 lg:p-12 font-sans overflow-x-hidden flex flex-col relative select-none">
      
      {/* 1. INTRO SEQUENCE (Teks di tengah) */}
      {introState < 3 && (
        <div className="fixed inset-0 z-[150] bg-stone-900 flex items-center justify-center">
          <h1 
            className={`text-2xl md:text-4xl font-serif tracking-widest text-stone-300 uppercase transition-opacity duration-1000 ${
              introState === 1 ? 'opacity-100' : 'opacity-0'
            }`}
          >
            The 4-Year Journey
          </h1>
        </div>
      )}

      {/* 2. ANIMASI GEMBOK TERBUKA */}
      {showUnlockAnim && (
        <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-stone-900/90 backdrop-blur-sm transition-opacity duration-500">
          <svg className="w-24 h-24 text-stone-300 animate-bounce mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
          </svg>
          {/* UBAH TEKS MENJADI THE COUPONS UNLOCKED */}
          <h2 className="text-3xl md:text-4xl font-serif text-white tracking-widest uppercase text-center px-4">The Coupons Unlocked</h2>
          <p className="text-stone-400 mt-2 italic text-center px-4">A new section is now available in the hub.</p>
        </div>
      )}

      {/* 3. OVERLAY TRANSISI WARNA KE HUB (Krem Lembut) */}
      <div 
        className={`fixed inset-0 z-[999] bg-stone-50 transition-opacity duration-700 pointer-events-none ${
          isPageMounted && !isExiting ? 'opacity-0' : 'opacity-100'
        }`} 
      />

      {/* KONTEN UTAMA (Baru dirender setelah Intro selesai) */}
      {introState === 3 && (
        <>
          {/* Header, Back Button, dan Done Button */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 md:mb-12 max-w-[1600px] w-full mx-auto relative z-50 animate-fade-in-up">
            
            <h1 className="md:hidden text-lg font-serif tracking-widest text-stone-300 uppercase text-center w-full mb-5">
              {selectedCard !== null && activeCard ? activeCard.headerTitle : "The 4-Year Journey"}
            </h1>

            <button 
              onClick={handleBack}
              className="group flex items-center gap-3 px-5 py-2.5 bg-stone-800/40 hover:bg-stone-700/60 backdrop-blur-md border border-stone-600/50 rounded-full text-stone-300 hover:text-white transition-all duration-300 shadow-lg"
            >
              <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="font-medium tracking-wide text-sm uppercase">Back</span>
            </button>

            <h1 className="hidden md:block absolute left-1/2 -translate-x-1/2 text-2xl font-serif tracking-widest text-stone-300 uppercase leading-snug">
              {selectedCard !== null && activeCard ? activeCard.headerTitle : "The 4-Year Journey"}
            </h1>

            {selectedCard === null && (
              <button 
                onClick={handleComplete}
                className="hidden md:flex items-center gap-2 px-6 py-2.5 bg-stone-100 hover:bg-white text-stone-900 rounded-full font-bold uppercase tracking-wider text-sm transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.3)] hover:-translate-y-0.5"
              >
                Complete Chapter
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>

          {/* STATE 1: ROW VIEW */}
          {selectedCard === null && (
            <div className="flex-1 flex items-center justify-start xl:justify-center w-full max-w-[1600px] mx-auto">
              <div 
                ref={scrollRef}
                onMouseDown={handleMouseDown}
                onMouseLeave={handleMouseLeave}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
                className={`flex flex-row gap-4 md:gap-6 lg:gap-8 w-full overflow-x-auto px-2 md:px-8 pb-12 hide-scrollbar py-6 ${
                  isDragging ? 'cursor-grabbing snap-none' : 'cursor-grab snap-x snap-mandatory'
                }`}
              >
                {memoryCards.map((card, index) => (
                  <div
                    key={card.id}
                    onClick={() => handleCardClick(card.id)}
                    style={{ 
                      animationDelay: `${index * 150}ms`,
                      WebkitMaskImage: '-webkit-radial-gradient(white, black)',
                      WebkitBackfaceVisibility: 'hidden',
                      transform: isTransitioning && transitionId === card.id ? 'scale(1.10) translateZ(0)' : ''
                    }}
                    className={`animate-card opacity-0 group relative w-[75vw] md:w-[21vw] max-w-[320px] flex-shrink-0 aspect-[9/16] snap-center rounded-[2rem] overflow-hidden transition-all duration-[800ms] ease-[cubic-bezier(0.25,1,0.5,1)] origin-center shadow-2xl isolation-isolate transform-gpu ${
                      isTransitioning && transitionId === card.id
                        ? "z-50 shadow-white/30"
                        : isTransitioning
                        ? "opacity-0 scale-90 blur-sm pointer-events-none" 
                        : "hover:scale-[1.03] hover:-translate-y-2 hover:z-10 hover:shadow-white/10"
                    }`}
                  >
                    <img src={card.gifImg} alt={`${card.year} active`} draggable={false} className="absolute inset-0 w-full h-full object-cover" />
                    
                    <img src={card.staticImg} alt={card.year} draggable={false} className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 delay-[700ms] group-hover:opacity-0" />
                    
                    <img src={card.staticImg} alt={card.year} draggable={false} className="absolute inset-0 w-full h-full object-cover grayscale transition-opacity duration-500 group-hover:opacity-0" />
                    
                    <div className="absolute inset-0 bg-stone-900/60 group-hover:bg-stone-900/20 transition-colors duration-700 pointer-events-none" />
                    
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span className="text-8xl md:text-9xl font-serif font-bold text-white/80 group-hover:scale-110 group-hover:text-white/90 transition-all duration-700 drop-shadow-2xl">
                        {card.id}
                      </span>
                    </div>
                  </div>
                ))}

                {/* Card Loading (Nomor 5) */}
                <div 
                  style={{ animationDelay: `${memoryCards.length * 150}ms` }}
                  className={`animate-card opacity-0 relative w-[75vw] md:w-[21vw] max-w-[320px] flex-shrink-0 aspect-[9/16] snap-center flex flex-col items-center justify-center rounded-[2rem] border-2 border-dashed border-stone-600 bg-stone-800/30 text-center transition-all duration-[800ms] isolation-isolate transform-gpu overflow-hidden ${
                    isTransitioning ? "opacity-0 scale-90 blur-sm pointer-events-none" : ""
                  }`}
                >
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
                    <span className="text-[15rem] md:text-[20rem] font-serif font-bold text-white leading-none">5</span>
                  </div>

                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-stone-400 mb-6 pointer-events-none relative z-10"></div>
                  <h3 className="text-2xl font-serif text-stone-300 pointer-events-none relative z-10">Chapter 5</h3>
                  <p className="text-stone-500 mt-2 text-sm italic px-6 pointer-events-none relative z-10">Loading our next adventure...</p>
                </div>
              </div>
            </div>
          )}

          {/* STATE 2: DETAIL VIEW (DENGAN EFEK HOVER GAMBAR) */}
          {selectedCard !== null && activeCard && (
            <div className="flex-1 flex items-center justify-center w-full max-w-6xl mx-auto animate-fade-in-up relative z-10">
              <div className="flex flex-col md:flex-row-reverse gap-8 lg:gap-16 items-center w-full">
                
                {/* Frame dengan interaksi Hover Static -> GIF */}
                <div 
                  className="group w-2/3 md:w-1/3 max-w-[260px] lg:max-w-[320px] relative rounded-[2rem] overflow-hidden aspect-[9/16] shadow-2xl shadow-black/80 border border-stone-700/50 isolation-isolate transform-gpu cursor-crosshair"
                  style={{ WebkitMaskImage: '-webkit-radial-gradient(white, black)' }}
                >
                  {/* Layer Dasar: Gambar Statis */}
                  <img src={activeCard.staticImg} alt={activeCard.year} draggable={false} className="absolute inset-0 w-full h-full object-cover" />
                  
                  {/* Layer Atas: GIF yang muncul perlahan saat di-hover */}
                  <img src={activeCard.gifImg} alt={`${activeCard.year} active`} draggable={false} className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="absolute inset-0 bg-stone-900/20 pointer-events-none" />
                </div>
                
                <div className="w-full md:w-2/3 space-y-6 md:space-y-8 text-center md:text-left">
                  <h2 className="text-7xl lg:text-[10rem] font-serif text-white/5 absolute -z-10 md:relative translate-y-16 md:translate-y-0">
                    {activeCard.id}
                  </h2>
                  <h3 className="text-3xl lg:text-5xl text-stone-200 font-serif leading-tight">
                    {activeCard.title}
                  </h3>
                  <div className="w-16 h-1 bg-stone-600 mx-auto md:mx-0 rounded-full"></div>
                  <p className="text-stone-400 leading-relaxed text-lg lg:text-xl md:pr-10">
                    {activeCard.message}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tombol Done Mobile */}
          {selectedCard === null && (
            <div className="md:hidden flex justify-center mt-4 pb-8 relative z-50 animate-fade-in-up">
              <button 
                onClick={handleComplete}
                className="flex items-center gap-2 px-8 py-3.5 bg-stone-100 text-stone-900 rounded-full font-bold uppercase tracking-wider text-sm shadow-xl"
              >
                Complete Chapter
              </button>
            </div>
          )}
        </>
      )}

      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fade-in-up-stagger { 0% { opacity: 0; transform: translateY(50px); } 100% { opacity: 1; transform: translateY(0); } }
        .animate-card { animation: fade-in-up-stagger 0.8s cubic-bezier(0.25, 1, 0.5, 1) forwards; }
        @keyframes fade-in-up { 0% { opacity: 0; transform: translateY(40px); } 100% { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { animation: fade-in-up 0.8s cubic-bezier(0.25, 1, 0.5, 1) forwards; }
      `}</style>
    </div>
  );
}