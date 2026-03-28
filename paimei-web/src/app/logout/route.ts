import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const cookieStore = await cookies();
  
  // Hancurkan session
  cookieStore.delete("paimei_session");

  // Lempar kembali ke halaman login dengan bersih
  return NextResponse.redirect(new URL("/", request.url));
}