import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
export async function POST(req:Request){
  const {email,password}=await req.json();
  const supabase=await createClient();
  const {data,error}=await supabase.auth.signInWithPassword({email:String(email||"").toLowerCase(),password:String(password||"")});
  if(error||!data.user)return NextResponse.json({error:error?.message||"Invalid email or password"},{status:401});
  return NextResponse.json({ok:true,user:{id:data.user.id,email:data.user.email}});
}
