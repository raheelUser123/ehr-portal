import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
export async function POST(req:Request){
  const {email}=await req.json();
  const supabase=await createClient();
  await supabase.auth.resetPasswordForEmail(String(email).toLowerCase());
  return NextResponse.json({ok:true});
}
