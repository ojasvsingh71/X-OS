"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen, Code2, Activity } from "lucide-react";
import LogoutButton from "./LogoutButton";
import Image from "next/image";

const navItems = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Academics", href: "/dashboard/academics", icon: BookOpen },
  { name: "DSA", href: "/dashboard/dsa", icon: Code2 },
  { name: "Life Log", href: "/dashboard/habits", icon: Activity },
];

export default function Navbar({ username }: { username: string }) {
  const pathname = usePathname();

  return (
    <>
     
      <header className="fixed top-0 left-0 right-0 z-50 h-16 px-4 md:px-6 flex items-center justify-between bg-black/40 backdrop-blur-md border-b border-white/10">
        {/* Left: Brand */}
        <div className="flex items-center gap-3">
             <Image
              src="/x.png"
              alt="X-OS"
              width={35}
              height={35}
            />
          
          <span className="font-semibold text-white tracking-wide text-sm md:text-base">
            {username}'s OS
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/10">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <item.icon size={16} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <LogoutButton />
      </header>

    
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0f172a] border-t border-white/10 pb-safe">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                  isActive ? "text-blue-500" : "text-slate-500"
                }`}
              >
                {/* Active Indicator Line (Top) */}
                {isActive && (
                  <span className="absolute top-0 w-12 h-0.5 bg-blue-500 shadow-[0_0_10px_#3b82f6]" />
                )}

                <item.icon
                  size={24}
                  strokeWidth={isActive ? 2.5 : 2}
                  className={`transition-transform duration-200 ${
                    isActive ? "-translate-y-1" : ""
                  }`}
                />
                <span className="text-[10px] font-medium">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
