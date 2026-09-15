import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
export async function POST(req:Request){
  const {name,email,password}=await req.json();
  if(!name||!email||!password||String(password).length<8)return NextResponse.json({error:"Name, email and an 8+ character password are required"},{status:400});
  const supabase=await createClient();
  const {data,error}=await supabase.auth.signUp({email:String(email).toLowerCase(),password:String(password),options:{data:{full_name:name}}});
  if(error)return NextResponse.json({error:error.message},{status:400});
  if(data.user){
    const admin=createAdminClient();
    await admin.from("profiles").upsert({id:data.user.id,full_name:name,role:"staff",active:true},{onConflict:"id"});
  }
  return NextResponse.json({ok:true,needsVerification:!data.session});
}
