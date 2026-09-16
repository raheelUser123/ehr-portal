import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSession } from "@/lib/auth";
import { isAdminRole } from "@/lib/admin";
export async function POST(req:Request){const s=await getSession();if(!s||!isAdminRole(s.role))return NextResponse.json({error:"Forbidden"},{status:403});const body=await req.json();const a=createAdminClient();const {data,error}=await a.from("organizations").insert({name:body.name}).select("*").single();if(error)return NextResponse.json({error:error.message},{status:400});await a.from("audit_logs").insert({organization_id:data.id,actor_id:s.id,entity_type:"organization",entity_id:data.id,action:"CREATE_ORGANIZATION"});return NextResponse.json(data)}
