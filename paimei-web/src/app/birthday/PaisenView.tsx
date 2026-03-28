"use client";

import { useState } from "react";
import AmeyView from "./AmeyView";

export default function PaisenView({ invitation, onSavePaisen }: any) {
  const [isPreviewingAmey, setIsPreviewingAmey] = useState(false);
  
  const [outfitType, setOutfitType] = useState<"suit" | "separates">(invitation?.paisen_outfit || "suit");
  const [topColor, setTopColor] = useState(invitation?.paisen_top_color || "#1c1917");
  const [bottomColor, setBottomColor] = useState(invitation?.paisen_bottom_color || "#1c1917");

  // Jika tombol Preview ditekan, muat komponen AmeyView (dalam mode isPreview = true)
  if (isPreviewingAmey) {
    return (
      <div className="relative w-full h-full min-h-screen">
        <div className="absolute top-6 right-6 md:top-12 md:right-12 z-[999] animate-fade-in-up">
          <button onClick={() => setIsPreviewingAmey(false)} className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-full font-bold uppercase tracking-widest text-xs shadow-xl transition-all">
            Exit Preview
          </button>
        </div>
        {/* Render tampilan Amey untuk dipreview Paisen */}
        <AmeyView invitation={invitation} onSave={() => alert("This is just a preview!")} isPreview={true} />
      </div>
    );
  }

  // TAMPILAN DASHBOARD PAISEN
  return (
    <div className="max-w-4xl w-full mx-auto relative z-10 flex flex-col items-center gap-12 pt-16">
      
      <div className="text-center space-y-4 animate-fade-in-up">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-stone-800 border border-stone-700 text-stone-300 text-xs font-bold uppercase tracking-widest">
          Director's Dashboard
        </div>
        <h1 className="text-4xl md:text-5xl font-serif text-white tracking-wide">
          Manage The Date
        </h1>
        <p className="text-stone-400 max-w-md mx-auto">
          Pantau status undangan Amey dan pastikan kamu menyesuaikan pakaianmu dengan pilihannya.
        </p>
        
        {/* Tombol Preview Amey's View */}
        <button onClick={() => setIsPreviewingAmey(true)} className="mt-4 px-6 py-2 border border-stone-600 rounded-full text-stone-300 hover:bg-stone-800 hover:text-white transition-all text-xs font-bold uppercase tracking-widest">
          👁️ Preview Amey's View
        </button>
      </div>

      <div className="w-full max-w-xl animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <div className="bg-stone-800/40 backdrop-blur-2xl p-8 md:p-10 rounded-[2.5rem] border border-stone-700/50 shadow-2xl relative">
          
          {/* Amey's Status Panel */}
          <div className="text-center mb-8 border-b border-stone-700/50 pb-8">
            <p className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-3">Amey's Status</p>
            {invitation?.is_accepted ? (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full font-bold text-sm">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span> Accepted
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded-full font-bold text-sm">
                <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></span> Waiting
              </div>
            )}
            
            {invitation?.is_accepted && (
              <div className="mt-6 flex justify-center gap-6">
                <div className="text-center">
                  <p className="text-[10px] uppercase text-stone-500 mb-2">Outfit</p>
                  <p className="text-white font-serif capitalize">{invitation.amey_outfit}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] uppercase text-stone-500 mb-2">Colors</p>
                  <div className="flex gap-2 justify-center">
                    <span className="w-6 h-6 rounded-full border border-stone-600 shadow-sm" style={{ backgroundColor: invitation.amey_top_color || "#000" }}></span>
                    {invitation.amey_outfit === "separates" && (
                      <span className="w-6 h-6 rounded-full border border-stone-600 shadow-sm" style={{ backgroundColor: invitation.amey_bottom_color || "#000" }}></span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Paisen's Setup Form */}
          <div className="space-y-6">
            <p className="text-sm font-bold uppercase tracking-widest text-stone-400 text-center">Your Outfit (Match Her)</p>
            
            <div className="flex gap-2 bg-stone-900/50 p-1 rounded-xl">
              <button onClick={() => setOutfitType("suit")} className={`flex-1 py-2 rounded-lg text-sm font-bold uppercase transition-all ${outfitType === "suit" ? "bg-stone-700 text-white shadow-md" : "text-stone-500 hover:text-stone-300"}`}>Suit</button>
              <button onClick={() => setOutfitType("separates")} className={`flex-1 py-2 rounded-lg text-sm font-bold uppercase transition-all ${outfitType === "separates" ? "bg-stone-700 text-white shadow-md" : "text-stone-500 hover:text-stone-300"}`}>Top & Bottom</button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-stone-800 border border-stone-600 flex items-center justify-center flex-shrink-0 relative overflow-hidden">
                  <div className="absolute inset-0" style={{ backgroundColor: topColor }}></div>
                  {outfitType === "suit" 
                    ? <svg className="w-8 h-8 relative z-10 text-white/40" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L4 6v12l8 4 8-4V6l-8-4zm0 2.5l5 2.5-5 5-5-5 5-2.5z"/></svg> 
                    : <svg className="w-8 h-8 relative z-10 text-white/40" viewBox="0 0 24 24" fill="currentColor"><path d="M14 3h-4L6 8v13h12V8l-4-5z"/></svg>}
                </div>
                <div className="flex-1 space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-stone-400">{outfitType === "suit" ? "Suit Color" : "Top Color"}</label>
                  <input type="color" value={topColor} onChange={(e) => setTopColor(e.target.value)} className="w-full h-8 rounded cursor-pointer bg-stone-800 border-none p-0" />
                </div>
              </div>

              {outfitType === "separates" && (
                <div className="flex items-center gap-4 animate-fade-in">
                  <div className="w-12 h-12 rounded-xl bg-stone-800 border border-stone-600 flex items-center justify-center flex-shrink-0 relative overflow-hidden">
                    <div className="absolute inset-0" style={{ backgroundColor: bottomColor }}></div>
                    <svg className="w-8 h-8 relative z-10 text-white/40" viewBox="0 0 24 24" fill="currentColor"><path d="M6 22h4v-8h4v8h4V8H6v14z"/></svg>
                  </div>
                  <div className="flex-1 space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-stone-400">Bottom Color (Pants)</label>
                    <input type="color" value={bottomColor} onChange={(e) => setBottomColor(e.target.value)} className="w-full h-8 rounded cursor-pointer bg-stone-800 border-none p-0" />
                  </div>
                </div>
              )}
            </div>

            <button 
              onClick={() => onSavePaisen({ outfit: outfitType, top_color: topColor, bottom_color: outfitType === "suit" ? topColor : bottomColor })} 
              className="w-full py-4 bg-stone-100 text-stone-900 rounded-full font-bold uppercase tracking-widest text-sm hover:bg-white transition-all shadow-lg mt-4 active:scale-95"
            >
              Save Paisen's Outfit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}