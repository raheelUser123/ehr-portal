import raw from "@/data/form-definitions.json";
import { createAdminClient } from "@/lib/supabase/admin";
export type FieldType="text"|"textarea"|"select"|"checkbox"|"radio"|"number"|"email"|"tel"|"date"|"time";
export type FormField={name:string;label:string;type:FieldType;required:boolean;readonly:boolean;options:string[]};
export type FormDefinition={slug:string;title:string;fields:FormField[]};
export const formDefinitions=raw as FormDefinition[];
export const formMap=Object.fromEntries(formDefinitions.map(f=>[f.slug,f]));

export async function getFormDefinition(slug:string){
  const builtIn=formMap[slug]; if(builtIn) return builtIn;
  const admin=createAdminClient();
  const {data:t}=await admin.from("form_templates").select("slug,name,schema,active").eq("slug",slug).maybeSingle();
  if(!t||!t.active)return null;
  const schema=typeof t.schema==="string"?JSON.parse(t.schema):t.schema;
  const fields=Array.isArray(schema)?schema:(schema?.fields||[]);
  return {slug:t.slug,title:t.name,fields} as FormDefinition;
}
