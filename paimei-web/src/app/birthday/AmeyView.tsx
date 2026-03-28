"use client";

import { useState, useEffect } from "react";
import loveLetter from "../../data/birthday.json";

// --- COLOR HELPERS ---
function hslToHex(h: number, s: number, l: number) {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function hexToHsl(hex: string) {
  let r = 0, g = 0, b = 0;
  if (hex.length === 7) {
    r = parseInt(hex.substring(1, 3), 16) / 255;
    g = parseInt(hex.substring(3, 5), 16) / 255;
    b = parseInt(hex.substring(5, 7), 16) / 255;
  }
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

// --- CLOTHING ICONS ---
const DRESS_ICONS = [
  <path key="0" d="M16 4h-8l-2 5h12l-2-5zm-6 6H6l-2 10h16l-2-10h-8z"/> 
];
const TOP_ICONS = [
  <path key="0" d="M14 3h-4L6 8v7h12V8l-4-5z"/>, // Normal Top
  <path key="1" d="M13 3h-2L7 9v6h10V9l-4-6z"/>  // Sleeveless
];
const BOTTOM_ICONS = [
  <path key="0" d="M6 22h4v-8h4v8h4V8H6v14z"/>, // Pants
  <path key="1" d="M7 8l-2 14h14l-2-14H7z"/>    // Skirt
];

export default function AmeyView({ invitation, onSave, isPreview = false }: any) {
  const savedOutfit = invitation?.amey_outfit || "dress|0|0";
  const [baseType, savedTopIdx, savedBotIdx] = savedOutfit.split("|");

  // --- STORYTELLING STATES ---
  const [storyState, setStoryState] = useState(invitation?.is_accepted ? 3 : 1);
  const [titleVisible, setTitleVisible] = useState(false);
  const [paraIdx, setParaIdx] = useState(0);
  const [readIdx, setReadIdx] = useState(0); // Untuk navigasi baca ulang di State 2
  const [typedText, setTypedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showLoveBtns, setShowLoveBtns] = useState(false);
  
  const [loveTooScale, setLoveTooScale] = useState(1);
  const [loveMoreScale, setLoveMoreScale] = useState(1);
  const [isShaking, setIsShaking] = useState(false);

  // --- FORM STATES ---
  const [showDialog, setShowDialog] = useState(false);
  const [noScale, setNoScale] = useState(1);
  const [yesScale, setYesScale] = useState(1);
  const [isDialogShaking, setIsDialogShaking] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [outfitType, setOutfitType] = useState<"dress" | "separates">((baseType as any) || "dress");
  
  const [topIdx, setTopIdx] = useState(parseInt(savedTopIdx) || 0);
  const [botIdx, setBotIdx] = useState(parseInt(savedBotIdx) || 0);

  const initTopHex = invitation?.amey_top_color || "#8b5cf6";
  const initBotHex = invitation?.amey_bottom_color || "#ec4899";
  const [initTopH, , initTopL] = hexToHsl(initTopHex);
  const [initBotH, , initBotL] = hexToHsl(initBotHex);

  const [topHue, setTopHue] = useState(initTopH);
  const [topLightness, setTopLightness] = useState(initTopL);
  const [topHexInput, setTopHexInput] = useState(initTopHex);

  const [botHue, setBotHue] = useState(initBotH);
  const [botLightness, setBotLightness] = useState(initBotL);
  const [botHexInput, setBotHexInput] = useState(initBotHex);

  useEffect(() => { setTopHexInput(hslToHex(topHue, 100, topLightness)); }, [topHue, topLightness]);
  useEffect(() => { setBotHexInput(hslToHex(botHue, 100, botLightness)); }, [botHue, botLightness]);

  const handleTopHexType = (val: string) => {
    setTopHexInput(val);
    if (/^#[0-9A-Fa-f]{6}$/i.test(val)) {
      const [h, , l] = hexToHsl(val); setTopHue(h); setTopLightness(l);
    }
  };
  const handleBotHexType = (val: string) => {
    setBotHexInput(val);
    if (/^#[0-9A-Fa-f]{6}$/i.test(val)) {
      const [h, , l] = hexToHsl(val); setBotHue(h); setBotLightness(l);
    }
  };

  // --- TYPING EFFECT LOGIC ---
  useEffect(() => {
    if (storyState === 1 && !invitation?.is_accepted) {
      setTimeout(() => setTitleVisible(true), 400); 
      setTimeout(() => setIsTyping(true), 1200); 
    }
  }, [storyState, invitation]);

  useEffect(() => {
    if (!isTyping) return;
    const fullText = loveLetter[paraIdx] || "";
    let i = 0;
    setTypedText(""); 
    const timer = setInterval(() => {
      setTypedText(fullText.slice(0, i + 1));
      i++;
      if (i >= fullText.length) {
        clearInterval(timer);
        setIsTyping(false);
        if (paraIdx === loveLetter.length - 1) {
          setTimeout(() => setShowLoveBtns(true), 600); 
        }
      }
    }, 35); 
    return () => clearInterval(timer);
  }, [isTyping, paraIdx]);

  const skipTyping = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTypedText(loveLetter[paraIdx]);
    setIsTyping(false);
    if (paraIdx === loveLetter.length - 1) setShowLoveBtns(true);
  };

  const handleScreenClick = () => {
    if (!isTyping && paraIdx < loveLetter.length - 1) {
      setParaIdx(p => p + 1);
      setIsTyping(true);
    }
  };

  // --- INTERACTION: LOVE BUTTONS (Only Click) ---
  const handleLoveTooClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Mencegah klik layar maju ke paragraf (jika ada)
    setLoveTooScale((prev) => Math.max(0, prev - 0.2)); 
    setLoveMoreScale((prev) => Math.min(1.4, prev + 0.1)); 
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 400);
    if (typeof window !== 'undefined' && navigator.vibrate) navigator.vibrate([50, 50]); 
  };

  const handleLoveMuchMoreClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setStoryState(2); 
    setTimeout(() => setShowDialog(true), 800); 
  };

  // --- INTERACTION: DECLINE DATE BUTTON (Only Click) ---
  const handleDeclineDateClick = () => {
    setNoScale((prev) => Math.max(0, prev - 0.25)); 
    setYesScale((prev) => Math.min(1.3, prev + 0.1)); 
    setIsDialogShaking(true);
    setTimeout(() => setIsDialogShaking(false), 400);
    if (typeof window !== 'undefined' && navigator.vibrate) navigator.vibrate([50, 50, 50]); 
  };

  const handleSubmit = () => {
    const finalTopHex = /^#[0-9A-Fa-f]{6}$/i.test(topHexInput) ? topHexInput : hslToHex(topHue, 100, topLightness);
    const finalBotHex = /^#[0-9A-Fa-f]{6}$/i.test(botHexInput) ? botHexInput : hslToHex(botHue, 100, botLightness);
    onSave({
      outfit: `${outfitType}|${topIdx}|${botIdx}`,
      top_color: finalTopHex,
      bottom_color: outfitType === "dress" ? finalTopHex : finalBotHex,
    });
    setIsEditing(false);
  };

  // =========================================================
  // RENDER: STORY STATE 1 (Tengah Layar: Typing + Love Buttons)
  // =========================================================
  if (storyState === 1) {
    return (
      <div 
        onClick={handleScreenClick}
        className={`max-w-3xl w-full mx-auto relative z-10 flex flex-col items-center justify-center min-h-[70vh] text-center px-4 ${!isTyping && paraIdx < loveLetter.length - 1 ? 'cursor-pointer' : ''}`}
      >
        <div className={`transition-all duration-1000 transform ${titleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-stone-800 border border-stone-700 text-stone-300 text-xs font-bold uppercase tracking-widest mb-6">
            <svg className="w-4 h-4 text-stone-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8"/><path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1"/><path d="M2 21h20"/><path d="M7 8v3"/><path d="M12 8v3"/><path d="M17 8v3"/><path d="M7 4h.01"/><path d="M12 4h.01"/><path d="M17 4h.01"/></svg>
            Chapter 20
          </div>
          
          <h1 className="text-5xl md:text-7xl font-serif text-white tracking-wide leading-tight drop-shadow-lg mb-10">
            Happy 20th <br/> Birthday, Amey.
          </h1>
        </div>
        
        <div className={`min-h-[160px] max-w-2xl transition-opacity duration-500 ${titleVisible ? 'opacity-100' : 'opacity-0'}`}>
          <p className="text-xl md:text-2xl text-stone-300 leading-relaxed font-serif">
            {typedText}
            {isTyping && <span className="animate-pulse">|</span>}
          </p>
          
          {/* Skip Button */}
          {isTyping && (
            <button onClick={skipTyping} className="mt-6 text-xs font-bold uppercase tracking-widest text-stone-500 hover:text-white transition-colors">
              Skip Animation
            </button>
          )}

          {/* Next Paragraph Hint */}
          {!isTyping && paraIdx < loveLetter.length - 1 && (
             <p className="text-xs font-bold uppercase tracking-widest text-stone-500 mt-8 animate-pulse">Tap anywhere to continue...</p>
          )}
        </div>

        {/* Tombol Cinta (Fade In) */}
        <div className={`flex flex-col md:flex-row gap-6 items-center justify-center mt-12 w-full max-w-md h-16 transition-all duration-1000 ${showLoveBtns ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
          {/* Pisahkan container scale dan container shake agar ukurannya tidak kereset */}
          <div style={{ transform: `scale(${loveTooScale})`, transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)', opacity: loveTooScale > 0.1 ? 1 : 0, pointerEvents: loveTooScale > 0.1 ? 'auto' : 'none' }}>
            <div className={isShaking ? 'animate-shake-pure' : ''}>
              <button onClick={handleLoveTooClick} className="px-6 py-3 bg-stone-800 text-stone-400 border border-stone-600 rounded-full font-bold uppercase text-xs whitespace-nowrap">
                I Love U Too
              </button>
            </div>
          </div>
          
          <div style={{ transform: `scale(${loveMoreScale})`, transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }} className="z-10">
            <button onClick={handleLoveMuchMoreClick} className="px-8 py-3.5 bg-white text-stone-900 rounded-full font-bold uppercase tracking-widest text-sm shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:bg-stone-200 whitespace-nowrap">
              I Love U Much More!
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // RENDER: STORY STATE 2 & 3 (Layout Terbelah)
  // =========================================================
  return (
    <div className="max-w-5xl w-full mx-auto relative z-10 flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
      
      {/* 1. BAGIAN KIRI: UCAPAN */}
      <div className="w-full lg:w-1/2 text-center lg:text-left space-y-6 animate-slide-left">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-stone-800 border border-stone-700 text-stone-300 text-xs font-bold uppercase tracking-widest mb-2">
          <svg className="w-4 h-4 text-stone-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8"/><path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1"/><path d="M2 21h20"/><path d="M7 8v3"/><path d="M12 8v3"/><path d="M17 8v3"/><path d="M7 4h.01"/><path d="M12 4h.01"/><path d="M17 4h.01"/></svg>
          Chapter 20
        </div>
        <h1 className="text-5xl md:text-6xl font-serif text-white tracking-wide leading-tight drop-shadow-lg">
          Happy 20th <br/> Birthday, Amey.
        </h1>
        
        {/* Navigasi Paragraf (Left Panel) */}
        <div className="min-h-[100px]">
          <p className="text-sm md:text-base text-stone-400 leading-relaxed max-w-md mx-auto lg:mx-0">
            {loveLetter[readIdx]}
          </p>
        </div>
        
        {loveLetter.length > 1 && (
          <div className="flex items-center justify-center lg:justify-start gap-4 mt-4 pt-4 border-t border-stone-800 max-w-md mx-auto lg:mx-0">
            <button 
              disabled={readIdx === 0} 
              onClick={() => setReadIdx(r => r - 1)}
              className="p-2 bg-stone-800 rounded-full text-stone-400 disabled:opacity-30 hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <span className="text-xs font-bold tracking-widest text-stone-500">{readIdx + 1} / {loveLetter.length}</span>
            <button 
              disabled={readIdx === loveLetter.length - 1} 
              onClick={() => setReadIdx(r => r + 1)}
              className="p-2 bg-stone-800 rounded-full text-stone-400 disabled:opacity-30 hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        )}
      </div>

      {/* 2. BAGIAN KANAN: KARTU INTERAKTIF */}
      <div className="w-full lg:w-1/2 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
        <div className="bg-stone-800/40 backdrop-blur-2xl p-8 md:p-10 rounded-[2.5rem] border border-stone-700/50 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden min-h-[400px] flex flex-col justify-center">
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-stone-600 rounded-full blur-[80px] opacity-30 pointer-events-none"></div>
          
          {/* A. STATE DIALOG */}
          {showDialog ? (
            <div className="text-center animate-fade-in relative z-10 flex flex-col items-center">
              <div className="w-20 h-20 bg-stone-900 border border-stone-700 text-stone-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                <svg className="w-10 h-10 animate-pulse text-stone-300" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
              </div>
              <h2 className="text-3xl font-serif text-white mb-3">An Evening to Remember</h2>
              <p className="text-stone-400 mb-10 text-sm leading-relaxed max-w-sm">
                I have prepared a little something special to celebrate your 20th birthday and our anniversary. Would you do me the honor of being my date?
              </p>
              
              <div className="flex flex-row gap-4 items-center justify-center w-full max-w-[320px]">
                {/* Pisahkan container Scale dan Shake */}
                <div style={{ transform: `scale(${noScale})`, transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)', opacity: noScale > 0.1 ? 1 : 0, pointerEvents: noScale > 0.1 ? 'auto' : 'none' }}>
                  <div className={isDialogShaking ? 'animate-shake-pure' : ''}>
                    <button onClick={handleDeclineDateClick} className="w-full px-6 py-3.5 bg-transparent border border-stone-600 text-stone-500 rounded-full font-bold uppercase text-xs whitespace-nowrap">
                      Uhmm..
                    </button>
                  </div>
                </div>
                
                <div style={{ transform: `scale(${yesScale})`, transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }} className="z-10">
                  <button onClick={() => { setShowDialog(false); setIsEditing(true); setStoryState(3); }} className="w-full px-8 py-3.5 bg-white text-stone-900 rounded-full font-bold uppercase tracking-widest text-xs shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:bg-stone-200 active:scale-95 whitespace-nowrap">
                    Yes, I'd Love To!
                  </button>
                </div>
              </div>
            </div>
          ) : 
          
          /* B. STATE SUDAH ACCEPT & TIDAK EDITING */
          invitation?.is_accepted && !isEditing ? (
            <div className="animate-fade-in relative z-10 flex flex-col h-full">
              <div className="text-center mb-6">
                <h3 className="text-3xl font-serif text-white mb-2">It's a Date! ❤️</h3>
                <p className="text-stone-400 text-sm">Our outfits are perfectly coordinated. I can't wait to see you looking breathtakingly gorgeous on our special day.</p>
              </div>

              <div className="bg-stone-900/50 p-5 rounded-2xl border border-stone-700/50 mb-6 space-y-4">
                <div className="flex justify-between items-center border-b border-stone-700/50 pb-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500">Location</span>
                  <span className="font-serif text-sm text-white">{invitation?.location_dummy}</span>
                </div>
                <div className="flex justify-between items-center border-b border-stone-700/50 pb-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500">Date</span>
                  <span className="font-serif text-sm text-white">April 11, 2026</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500">Time</span>
                  <span className="font-serif text-sm text-white">16:00 WIB</span>
                </div>
              </div>
              
              <div className="flex justify-center items-end gap-6 mb-8 mt-2">
                {/* Amey Model */}
                <div className="flex flex-col items-center group">
                  <div className="w-20 h-24 rounded-2xl bg-stone-800/80 border border-stone-600 flex items-center justify-center shadow-lg relative overflow-hidden transition-transform group-hover:scale-105">
                    {baseType === "dress" ? (
                      <div className="absolute inset-0" style={{ backgroundColor: invitation.amey_top_color || topHexInput }}></div>
                    ) : (
                      <>
                        <div className="w-full h-1/2 absolute top-0" style={{ backgroundColor: invitation.amey_top_color || topHexInput }}></div>
                        <div className="w-full h-1/2 absolute bottom-0" style={{ backgroundColor: invitation.amey_bottom_color || botHexInput }}></div>
                      </>
                    )}
                    <div className="absolute inset-0 bg-stone-900/10"></div>
                    
                    {baseType === "dress" ? (
                      <svg className="w-12 h-12 relative z-10 text-stone-900/80 drop-shadow-md" viewBox="0 0 24 24" fill="currentColor">{DRESS_ICONS[topIdx]}</svg> 
                    ) : (
                      <div className="relative z-10 flex flex-col items-center justify-center w-full h-full">
                        <svg className="w-8 h-8 text-stone-900/80 drop-shadow-md -mb-3" viewBox="0 0 24 24" fill="currentColor">{TOP_ICONS[topIdx]}</svg>
                        <svg className="w-8 h-8 text-stone-900/80 drop-shadow-md" viewBox="0 0 24 24" fill="currentColor">{BOTTOM_ICONS[botIdx]}</svg>
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-stone-500 mt-3">Amey</span>
                </div>
                
                <div className="pb-8 text-stone-600">
                  <svg className="w-6 h-6 animate-pulse" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                </div>

                {/* Paisen Model */}
                <div className="flex flex-col items-center group">
                  <div className="w-20 h-24 rounded-2xl bg-stone-800/80 border border-stone-600 flex items-center justify-center shadow-lg relative overflow-hidden transition-transform group-hover:scale-105">
                    {invitation.paisen_outfit === "suit" ? (
                      <div className="absolute inset-0" style={{ backgroundColor: invitation.paisen_top_color || "#1c1917" }}></div>
                    ) : (
                      <>
                        <div className="w-full h-1/2 absolute top-0" style={{ backgroundColor: invitation.paisen_top_color || "#1c1917" }}></div>
                        <div className="w-full h-1/2 absolute bottom-0" style={{ backgroundColor: invitation.paisen_bottom_color || "#1c1917" }}></div>
                      </>
                    )}
                    <div className="absolute inset-0 bg-stone-900/10"></div>
                    {invitation.paisen_outfit === "suit" 
                      ? <svg className="w-12 h-12 relative z-10 text-stone-900/60 drop-shadow-md" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L4 6v12l8 4 8-4V6l-8-4zm0 2.5l5 2.5-5 5-5-5 5-2.5z"/></svg> 
                      : <div className="relative z-10 flex flex-col items-center justify-center w-full h-full">
                          <svg className="w-8 h-8 text-stone-900/60 drop-shadow-md -mb-3" viewBox="0 0 24 24" fill="currentColor"><path d="M14 3h-4L6 8v13h12V8l-4-5z"/></svg>
                          <svg className="w-8 h-8 text-stone-900/60 drop-shadow-md" viewBox="0 0 24 24" fill="currentColor"><path d="M6 22h4v-8h4v8h4V8H6v14z"/></svg>
                        </div>
                    }
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-stone-500 mt-3">Paisen</span>
                </div>
              </div>

              <div className="mt-auto text-center">
                <button onClick={() => setIsEditing(true)} className="px-6 py-2 rounded-full border border-stone-600 text-stone-400 hover:text-white hover:bg-stone-800 transition-all text-xs font-bold uppercase tracking-widest">
                  Refine My Look
                </button>
              </div>
            </div>
          ) : 
          
          /* C. STATE FORM SETUP WARNA OUTFIT */
          (
            <div className="animate-fade-in relative z-10">
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-stone-300">Design My Ensemble</label>
                <span className="text-xs text-stone-500 italic">Tap the icon to switch styles</span>
              </div>

              <div className="flex gap-2 bg-stone-900/50 p-1 rounded-xl mb-6">
                <button onClick={() => { setOutfitType("dress"); setTopIdx(0); }} className={`flex-1 py-2 rounded-lg text-sm font-bold uppercase transition-all ${outfitType === "dress" ? "bg-stone-700 text-white shadow-md" : "text-stone-500 hover:text-stone-300"}`}>Dress</button>
                <button onClick={() => { setOutfitType("separates"); setTopIdx(0); setBotIdx(0); }} className={`flex-1 py-2 rounded-lg text-sm font-bold uppercase transition-all ${outfitType === "separates" ? "bg-stone-700 text-white shadow-md" : "text-stone-500 hover:text-stone-300"}`}>Separates</button>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div 
                    onClick={() => setTopIdx((prev) => (prev + 1) % (outfitType === "dress" ? DRESS_ICONS.length : TOP_ICONS.length))}
                    className="w-16 h-16 rounded-2xl bg-stone-800 border border-stone-600 flex items-center justify-center flex-shrink-0 relative overflow-hidden transition-all duration-300 cursor-pointer hover:ring-2 hover:ring-stone-400 group"
                  >
                    <div className="absolute inset-0 transition-colors duration-300" style={{ backgroundColor: topHexInput }}></div>
                    <svg className="w-10 h-10 relative z-10 text-stone-900/60 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="currentColor">
                      {outfitType === "dress" ? DRESS_ICONS[topIdx] : TOP_ICONS[topIdx]}
                    </svg>
                  </div>
                  
                  <div className="flex-1 space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">{outfitType === "dress" ? "Dress Color" : "Top Color"}</label>
                      <input type="text" value={topHexInput} onChange={(e) => handleTopHexType(e.target.value)} className="w-20 bg-stone-900/50 border border-stone-700 rounded px-2 py-1 text-xs text-white font-mono uppercase text-center outline-none focus:border-stone-400" />
                    </div>
                    <input type="range" min="0" max="360" value={topHue} onChange={(e) => setTopHue(Number(e.target.value))} className="w-full h-2 rounded-full appearance-none outline-none cursor-pointer" style={{ background: "linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)" }} />
                    <input type="range" min="10" max="90" value={topLightness} onChange={(e) => setTopLightness(Number(e.target.value))} className="w-full h-2 rounded-full appearance-none outline-none cursor-pointer mt-2" style={{ background: `linear-gradient(to right, #000 0%, hsl(${topHue}, 100%, 50%) 50%, #fff 100%)` }} />
                  </div>
                </div>

                {outfitType === "separates" && (
                  <div className="flex items-center gap-4 animate-fade-in pt-4 border-t border-stone-700/50">
                    <div 
                      onClick={() => setBotIdx((prev) => (prev + 1) % BOTTOM_ICONS.length)}
                      className="w-16 h-16 rounded-2xl bg-stone-800 border border-stone-600 flex items-center justify-center flex-shrink-0 relative overflow-hidden transition-all duration-300 cursor-pointer hover:ring-2 hover:ring-stone-400 group"
                    >
                      <div className="absolute inset-0 transition-colors duration-300" style={{ backgroundColor: botHexInput }}></div>
                      <svg className="w-10 h-10 relative z-10 text-stone-900/60 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="currentColor">
                        {BOTTOM_ICONS[botIdx]}
                      </svg>
                    </div>
                    
                    <div className="flex-1 space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Bottom Color</label>
                        <input type="text" value={botHexInput} onChange={(e) => handleBotHexType(e.target.value)} className="w-20 bg-stone-900/50 border border-stone-700 rounded px-2 py-1 text-xs text-white font-mono uppercase text-center outline-none focus:border-stone-400" />
                      </div>
                      <input type="range" min="0" max="360" value={botHue} onChange={(e) => setBotHue(Number(e.target.value))} className="w-full h-2 rounded-full appearance-none outline-none cursor-pointer" style={{ background: "linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)" }} />
                      <input type="range" min="10" max="90" value={botLightness} onChange={(e) => setBotLightness(Number(e.target.value))} className="w-full h-2 rounded-full appearance-none outline-none cursor-pointer mt-2" style={{ background: `linear-gradient(to right, #000 0%, hsl(${botHue}, 100%, 50%) 50%, #fff 100%)` }} />
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-8 flex gap-3">
                {isEditing && invitation?.is_accepted && (
                  <button onClick={() => setIsEditing(false)} className="px-6 py-4 bg-stone-800 text-stone-400 rounded-full font-bold uppercase tracking-widest text-sm hover:text-white transition-all">
                    Cancel
                  </button>
                )}
                <button onClick={handleSubmit} className="flex-1 py-4 bg-white text-stone-900 rounded-full font-bold uppercase tracking-widest text-sm hover:bg-stone-200 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-95">
                  {isPreview ? "Preview Only" : "Secure This Look"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <style jsx>{`
        /* Animasi getar murni tanpa mengubah scale */
        @keyframes shake-pure {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-4px) rotate(-2deg); }
          40%, 80% { transform: translateX(4px) rotate(2deg); }
        }
        .animate-shake-pure { animation: shake-pure 0.4s cubic-bezier(.36,.07,.19,.97) both; }
        
        @keyframes slide-left {
          from { transform: translateX(50%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-left { animation: slide-left 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none; appearance: none;
          width: 16px; height: 16px; border-radius: 50%;
          background: white; border: 2px solid #292524;
          cursor: pointer; box-shadow: 0 0 5px rgba(0,0,0,0.5);
        }
      `}</style>
    </div>
  );
}