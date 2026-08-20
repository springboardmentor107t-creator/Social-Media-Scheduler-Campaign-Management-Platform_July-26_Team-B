"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { isLoggedIn } from "../lib/auth";
import api from "../lib/api";
import Link from "next/link";
import { roleConfig } from "../lib/roleConfig";
import RoleBadge from "./RoleBadge";

export default function DashboardShell({ children }) {
 const router = useRouter();
 const pathname = usePathname();
 const [user, setUser] = useState(null);
 const [loading, setLoading] = useState(true);

 async function fetchUser() {
 try {
 const response = await api.get("/api/v1/auth/me");
 setUser(response.data);
 } catch (err) {
 console.error("Failed to fetch user in DashboardShell", err);
 // If unauthorized, could force logout here
 } finally {
 setLoading(false);
 }
 }

 useEffect(() => {
 if (!isLoggedIn()) {
 router.push("/login");
 return;
 }
 fetchUser();
 }, []);

 if (loading) {
 return (
 <div className="flex-1 flex items-center justify-center p-6">
 <div className="flex items-center gap-3 text-foreground-muted">
 <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
 <span className="font-medium text-lg">Loading dashboard...</span>
 </div>
 </div>
 );
 }

 if (!user) {
 return null; // Will redirect or fail gracefully
 }

 const role = user.role || "creator";
 const config = roleConfig[role] || roleConfig.creator;

 const primaryHref =
   role === "admin"
     ? "/admin/users"
     : role === "marketing"
     ? "/campaigns"
     : role === "business"
     ? "/social-accounts"
     : "/posts/create";

 return (
   <div className="flex-1 w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 animate-in fade-in duration-500">
     {/* Dashboard Header / Landing View */}
     <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 pb-6 border-b border-surface-border">
       <div>
         <div className="flex items-center gap-3 mb-1.5">
           <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
             {config.landingTitle}
           </h1>
           <RoleBadge role={role} />
         </div>
         <p className="text-foreground-muted text-sm sm:text-base">
           {config.landingDesc}
         </p>
       </div>
       <button
         onClick={() => router.push(primaryHref)}
         className="px-6 py-2.5 rounded-xl bg-gradient-brand text-white text-sm font-semibold shadow-md shadow-brand-500/20 hover:shadow-brand-500/30 active:scale-[0.98] transition-all self-start sm:self-auto"
       >
         {config.primaryAction}
       </button>
     </div>

     <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
       {/* Sidebar Nav */}
       <aside className="lg:col-span-3 xl:col-span-2">
         <div className="glass-panel p-3.5 rounded-2xl sticky top-24 space-y-1">
           <h2 className="text-xs font-bold uppercase tracking-wider px-3 py-2 text-foreground-muted">
             Menu
           </h2>
           <nav className="flex flex-col gap-1">
             {config.navItems.map((item) => {
               const isActive = pathname === item.href;
               return (
                 <Link
                   key={item.name}
                   href={item.href}
                   className={`flex items-center px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                     isActive
                       ? "bg-brand-500/10 text-brand-600 font-semibold"
                       : "text-foreground-subtle hover:text-foreground hover:bg-background-secondary"
                   }`}
                 >
                   {item.name}
                 </Link>
               );
             })}
           </nav>
         </div>
       </aside>

       {/* Main Content Area */}
       <main className="lg:col-span-9 xl:col-span-10 space-y-6">
         {children}
       </main>
     </div>
   </div>
 );
}
