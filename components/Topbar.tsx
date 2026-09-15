"use client";
import { Bell, LogOut, Search } from "lucide-react";
import { useEffect,useState } from "react";
import Link from "next/link";
export default function Topbar({user}:{user:{name:string;role:string}}){
 const [open,setOpen]=useState(false); const [items,setItems]=useState<any[]>([]);
 async function load(){const r=await fetch('/api/notifications'); if(r.ok)setItems(await r.json())}
 useEffect(()=>{load()},[]);
 const unread=items.filter(x=>!x.read).length;
 async function logout(){await fetch('/api/auth/logout',{method:'POST'}); location.href='/login'}
 return <header className="topbar"><div className="search"><Search size={17}/><input placeholder="Search residents, forms, appointments..."/></div><div className="topright"><div style={{position:'relative'}}><button className="iconbtn" onClick={()=>{setOpen(!open);load()}}><Bell size={19}/>{unread>0&&<span className="dot"/>}</button>{open&&<div className="notifmenu">{items.length?items.slice(0,8).map(n=><Link key={n.id} href={n.href||'/notifications'} className={`notifitem ${!n.read?'unread':''}`}><b>{n.title}</b><p>{n.message}</p></Link>):<div className="empty">No notifications</div>}<Link href="/notifications" className="notifitem"><b>View all notifications</b></Link></div>}</div><div className="avatar">{user.name.split(' ').map(x=>x[0]).slice(0,2).join('')}</div><div><b style={{fontSize:13}}>{user.name}</b><div className="muted" style={{fontSize:11}}>{user.role.replace('_',' ')}</div></div><button className="iconbtn" title="Logout" onClick={logout}><LogOut size={18}/></button></div></header>
}
