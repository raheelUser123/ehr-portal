import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
export async function POST(req:Request){
  const {email,otp,password}=await req.json();
  if(String(password||"").length<8)return NextResponse.json({error:"Password must be at least 8 characters"},{status:400});
  const supabase=await createClient();
  const verify=await supabase.auth.verifyOtp({email:String(email).toLowerCase(),token:String(otp),type:"recovery"});
  if(verify.error)return NextResponse.json({error:verify.error.message},{status:400});
  const {error}=await supabase.auth.updateUser({password:String(password)});
  if(error)return NextResponse.json({error:error.message},{status:400});
  return NextResponse.json({ok:true});
}
