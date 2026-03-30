"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchAPI } from "@/lib/api";
import { useToast } from "@/components/ToastProvider";

interface Coupon {
  id: number;
  title: string;
  description: string;
  is_redeemed: boolean;
  drawn_week: number | null;
}

export default function PaisenView() {
  const router = useRouter();
  const { addToast } = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  // State Timer untuk memantau jadwal Amey
  const [timeLeft, setTimeLeft] = useState("");
  const [nextWeekStart, setNextWeekStart] = useState("");

  // State Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [formData, setFormData] = useState({ id: 0, title: "", description: "" });

  const fetchDashboardData = async () => {
    try {
      // 1. Fetch State untuk Timer Amey
      const stateRes = await fetchAPI("/coupons/state");
      if (stateRes.ok) {
        const stateData = await stateRes.json();
        setNextWeekStart(stateData.next_week_start);
      }

      // 2. Fetch SEMUA Kupon dari API Admin
      const adminRes = await fetchAPI("/coupons/admin");
      if (adminRes.ok) {
        const adminData = await adminRes.json();
        setCoupons(adminData || []);
      }
    } catch (error) {
      console.error("Gagal mengambil data dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Logika Timer Amey
  useEffect(() => {
    if (!nextWeekStart) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const target = new Date(nextWeekStart).getTime();
      const distance = target - now;

      if (distance < 0) {
        clearInterval(interval);
        setTimeLeft("Available Now!");
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
  }, [nextWeekStart]);

  const openAddModal = () => {
    setModalMode("add");
    setFormData({ id: 0, title: "", description: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (coupon: Coupon) => {
    setModalMode("edit");
    setFormData({ id: coupon.id, title: coupon.title, description: coupon.description });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = modalMode === "add" ? "/coupons/admin" : `/coupons/admin/${formData.id}`;
      const method = modalMode === "add" ? "POST" : "PUT";
      
      const res = await fetchAPI(url, {
        method,
        body: JSON.stringify({ title: formData.title, description: formData.description })
      });

      if (res.ok) {
        addToast(`Coupon successfully ${modalMode === "add" ? "added" : "updated"}!`, "success");
        setIsModalOpen(false);
        fetchDashboardData();
      }
    } catch (error) {
      addToast("Failed to save coupon", "error");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this coupon? Amey won't be able to draw it.")) return;
    try {
      const res = await fetchAPI(`/coupons/admin/${id}`, { method: "DELETE" });
      if (res.ok) {
        addToast("Coupon deleted.", "success");
        fetchDashboardData();
      }
    } catch (error) {
      addToast("Failed to delete coupon", "error");
    }
  };

  if (loading) return <div className="min-h-screen bg-stone-100 flex items-center justify-center font-serif italic text-stone-500">Initializing Dashboard...</div>;

  return (
    <div className="min-h-screen bg-stone-100 p-6 md:p-12 font-sans text-stone-800">
      
      {/* MODAL FORM */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-4">
          <div className="bg-white p-8 rounded-3xl max-w-lg w-full shadow-2xl animate-zoom-in">
            <h2 className="text-2xl font-serif text-stone-900 mb-6">{modalMode === "add" ? "Draft New Coupon" : "Edit Coupon"}</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-stone-500 mb-1">Title</label>
                <input required type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full p-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-800 outline-none transition-all" placeholder="e.g., Free Massage"/>
              </div>
              <div>
                <label className="block text-sm font-bold text-stone-500 mb-1">Description</label>
                <textarea required rows={4} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full p-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-800 outline-none transition-all" placeholder="Describe the reward..."></textarea>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 py-3 bg-stone-800 text-white rounded-xl font-bold uppercase tracking-wider hover:bg-stone-700 transition-all">Save</button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-stone-100 text-stone-600 rounded-xl font-bold uppercase tracking-wider hover:bg-stone-200 transition-all">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DASHBOARD CONTENT */}
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <button onClick={() => router.push("/hub")} className="text-stone-500 hover:text-stone-800 flex items-center gap-2 mb-4 font-medium transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              Back to Sanctuary
            </button>
            <h1 className="text-3xl font-serif text-stone-900">Director's Dashboard</h1>
            <p className="text-stone-500">Monitor and manage the Vault for Amey.</p>
          </div>
          
          <button onClick={openAddModal} className="px-6 py-3 bg-stone-800 text-white rounded-lg text-sm font-bold tracking-wider uppercase hover:bg-stone-700 hover:shadow-lg transition-all transform active:scale-95 flex items-center gap-2">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
            Add New Coupon
          </button>
        </div>

        {/* WIDGET COUNTDOWN UNTUK PAISEN */}
        <div className="bg-stone-900 text-white rounded-2xl p-6 mb-8 flex flex-col md:flex-row items-center justify-between shadow-lg relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 bg-gradient-to-b from-stone-400 to-stone-700 h-full"></div>
          <div className="pl-4 z-10">
            <h3 className="text-sm font-bold tracking-widest uppercase text-stone-400 mb-1">Amey's Next Draw In</h3>
            <p className="text-xs text-stone-500 italic">This timer is synced with Amey's view.</p>
          </div>
          <div className="text-2xl md:text-3xl font-serif tracking-wider font-mono tabular-nums text-stone-100 mt-4 md:mt-0 z-10 drop-shadow-md">
            {timeLeft || "Calculating..."}
          </div>
          {/* Aksen Estetik */}
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-stone-700 rounded-full blur-3xl opacity-30 pointer-events-none"></div>
        </div>

        {/* TABEL KUPON */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 text-xs font-bold tracking-wider uppercase">
                <th className="p-5">Title & Description</th>
                <th className="p-5">Status</th>
                <th className="p-5">Drawn Week</th>
                <th className="p-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {coupons.map((coupon) => (
                <tr key={coupon.id} className="hover:bg-stone-50/50 transition-colors">
                  <td className="p-5">
                    <p className="font-bold text-stone-800">{coupon.title}</p>
                    <p className="text-sm text-stone-500 truncate max-w-sm mt-1">{coupon.description}</p>
                  </td>
                  <td className="p-5">
                    {coupon.is_redeemed ? (
                      <span className="px-3 py-1 bg-red-50 border border-red-100 text-red-600 rounded-full text-xs font-bold uppercase tracking-wider">Used</span>
                    ) : coupon.drawn_week ? (
                      <span className="px-3 py-1 bg-green-50 border border-green-100 text-green-600 rounded-full text-xs font-bold uppercase tracking-wider">Ready to Use</span>
                    ) : (
                      <span className="px-3 py-1 bg-stone-100 border border-stone-200 text-stone-500 rounded-full text-xs font-bold uppercase tracking-wider">In Vault (Hidden)</span>
                    )}
                  </td>
                  <td className="p-5 text-stone-600 font-medium">
                    {coupon.drawn_week ? `Week ${coupon.drawn_week}` : "-"}
                  </td>
                  <td className="p-5 text-right flex items-center justify-end gap-2">
                    <button onClick={() => openEditModal(coupon)} className="text-stone-400 hover:text-blue-600 p-2 transition-colors" title="Edit">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                    </button>
                    <button onClick={() => handleDelete(coupon.id)} className="text-stone-400 hover:text-red-600 p-2 transition-colors" title="Delete">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {coupons.length === 0 && (
            <div className="p-12 text-center text-stone-400 italic">No coupons available. Create one to surprise Amey!</div>
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes zoom-in { 0% { opacity: 0; transform: scale(0.95); } 100% { opacity: 1; transform: scale(1); } }
        .animate-zoom-in { animation: zoom-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
}