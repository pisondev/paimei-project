"use client";

import { useEffect, useState } from "react";
import AmeyView from "./AmeyView";
import PaisenView from "./PaisenView";

export default function CouponsPageWrapper() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = localStorage.getItem("currentUser")?.toLowerCase();
    if (user === "paisen") {
      setIsAdmin(true);
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center font-serif text-stone-500 italic">
        Opening the vault...
      </div>
    );
  }

  return isAdmin ? <PaisenView /> : <AmeyView />;
}