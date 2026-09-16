import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSession } from "@/lib/auth";
import { isAdminRole } from "@/lib/admin";
export async function PATCH(req:Request,c:{params:Promise<{id:string}>}){const s=await getSession();if(!s||!isAdminRole(s.role))return NextResponse.json({error:"Forbidden"},{status:403});const {id}=await c.params;const b=await req.json();const a=createAdminClient();const {data,error}=await a.from("organizations").update({name:b.name}).eq("id",id).select("*").single();if(error)return NextResponse.json({error:error.message},{status:400});return NextResponse.json(data)}
export async function DELETE(_:Request,c:{params:Promise<{id:string}>}){const s=await getSession();if(!s||!isAdminRole(s.role))return NextResponse.json({error:"Forbidden"},{status:403});const {id}=await c.params;const a=createAdminClient();const {error}=await a.from("organizations").delete().eq("id",id);if(error)return NextResponse.json({error:error.message},{status:400});return NextResponse.json({success:true})}
