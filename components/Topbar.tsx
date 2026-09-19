"use client";
import { Bell, LogOut, Search } from "lucide-react";
import { useEffect,useState } from "react";
import Link from "next/link";
import {useRouter} from "next/navigation";
export default function Topbar({user,canNotifications}:{user:{name:string;role:string};canNotifications:boolean}){
 const [open,setOpen]=useState(false); const [items,setItems]=useState<any[]>([]); const [q,setQ]=useState(""); const router=useRouter();
 async function load(){if(!canNotifications)return;const r=await fetch('/api/notifications'); if(r.ok)setItems(await r.json())}
 useEffect(()=>{load()},[canNotifications]);
 const unread=items.filter(x=>!x.read).length;
 async function logout(){await fetch('/api/auth/logout',{method:'POST'}); location.href='/login'}
 function search(e:React.FormEvent){e.preventDefault();const value=q.trim();if(!value)return;router.push(`/residents?search=${encodeURIComponent(value)}`)}
 return <header className="topbar"><form className="search" onSubmit={search}><Search size={17}/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search residents..."/></form><div className="topright">{canNotifications&&<div style={{position:'relative'}}><button className="iconbtn" aria-label="Notifications" onClick={()=>{setOpen(!open);load()}}><Bell size={19}/>{unread>0&&<span className="dot"/>}</button>{open&&<div className="notifmenu">{items.length?items.slice(0,8).map(n=><Link key={n.id} href={n.href||'/notifications'} className={`notifitem ${!n.read?'unread':''}`}><b>{n.title}</b><p>{n.message}</p></Link>):<div className="empty">No notifications</div>}<Link href="/notifications" className="notifitem"><b>View all notifications</b></Link></div>}</div>}<Link href="/profile" className="topProfileLink" title="My Profile"><div className="avatar">{user.name.split(' ').map(x=>x[0]).slice(0,2).join('')}</div><div><b style={{fontSize:13}}>{user.name}</b><div className="muted" style={{fontSize:11}}>{user.role.replaceAll('_',' ')}</div></div></Link><button className="iconbtn" title="Logout" onClick={logout}><LogOut size={18}/></button></div></header>
}
