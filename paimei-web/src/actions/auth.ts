"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function createSession(token: string) {
  const cookieStore = await cookies();
  
  cookieStore.set("paimei_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Otomatis true saat di VPS
    sameSite: "lax", // Penting agar cookie terbaca mulus setelah redirect middleware
    maxAge: 60 * 60 * 24, // Masa aktif 24 jam
    path: "/",
  });

  // Eksekusi redirect langsung dari Server Edge!
  // Ini membersihkan cache client dan mencegah infinite loop yang bikin RAM jebol.
  redirect("/hub");
}