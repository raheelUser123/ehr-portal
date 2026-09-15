import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
export async function POST(req:Request){
  const {email,otp}=await req.json();
  const supabase=await createClient();
  const {error}=await supabase.auth.verifyOtp({email:String(email).toLowerCase(),token:String(otp),type:"signup"});
  if(error)return NextResponse.json({error:error.message},{status:400});
  return NextResponse.json({ok:true});
}
