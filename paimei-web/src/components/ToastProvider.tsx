"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

type ToastType = 'info' | 'success' | 'warning' | 'error';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
}

interface ToastContextType {
  addToast: (message: string, type?: ToastType, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
};

// --- KOMPONEN ITEM TOAST ---
const ToastItem = ({ toast, onRemove }: { toast: Toast, onRemove: (id: string) => void }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Timer otomatis untuk menghilang
    const timer = setTimeout(() => {
      setIsExiting(true);
      // Tunggu 300ms agar animasi fade-out CSS selesai sebelum komponen benar-benar dihapus
      setTimeout(() => onRemove(toast.id), 300); 
    }, toast.duration);
    
    return () => clearTimeout(timer);
  }, [toast, onRemove]);

  // Handler saat tombol silang (X) ditekan
  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => onRemove(toast.id), 300);
  };

  return (
    <div 
      className={`relative overflow-hidden px-5 py-4 bg-stone-800 text-white rounded-2xl shadow-2xl flex items-center gap-3 transition-all duration-300 ease-in-out pointer-events-auto min-w-[320px] max-w-md border border-stone-700/50 transform ${
        isExiting 
          ? 'opacity-0 scale-95 translate-x-12' // Bergeser ke kanan dan memudar saat keluar
          : 'opacity-100 scale-100 translate-x-0 animate-toast-enter'
      }`}
    >
      {/* Ikon Dinamis Berdasarkan Tipe */}
      <div className="flex-shrink-0">
        {toast.type === 'warning' && <svg className="w-5 h-5 text-yellow-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8v4l3 3"/><circle cx="12" cy="12" r="10"/></svg>}
        {toast.type === 'success' && <svg className="w-5 h-5 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>}
        {toast.type === 'info' && <svg className="w-5 h-5 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>}
        {toast.type === 'error' && <svg className="w-5 h-5 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>}
      </div>

      <span className="font-medium tracking-wide text-sm flex-1">{toast.message}</span>

      {/* Tombol Silang (X) */}
      <button 
        onClick={handleClose} 
        className="flex-shrink-0 p-1 text-stone-400 hover:text-white hover:bg-stone-700 rounded-full transition-colors focus:outline-none"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>

      {/* Loading Bar Mundur (Progress Bar) */}
      <div className="absolute bottom-0 left-0 h-1 bg-stone-700 w-full">
        <div
          className={`h-full ${
            toast.type === 'warning' ? 'bg-yellow-400' :
            toast.type === 'success' ? 'bg-green-400' :
            toast.type === 'error' ? 'bg-red-400' : 'bg-blue-400'
          }`}
          style={{ animation: `shrink ${toast.duration}ms linear forwards` }}
        />
      </div>
    </div>
  );
};

// --- PROVIDER UTAMA ---
export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Durasi dipercepat dari 4000ms menjadi 2000ms (2.0 detik)
  const addToast = useCallback((message: string, type: ToastType = 'info', duration: number = 2000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      
      {/* Container untuk menumpuk notifikasi */}
      <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>

      <style jsx global>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
        @keyframes toast-enter {
          from { opacity: 0; transform: translateY(-20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-toast-enter {
          animation: toast-enter 0.4s cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }
      `}</style>
    </ToastContext.Provider>
  );
};