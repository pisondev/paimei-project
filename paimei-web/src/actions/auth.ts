"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function createSession(token: string) {
  const cookieStore = await cookies();
  
  cookieStore.set("paimei_session", token, {
    httpOnly: false, // UBAH INI MENJADI FALSE AGAR BISA DIBACA FETCH API!
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24,
    path: "/",
  });

  redirect("/hub");
}