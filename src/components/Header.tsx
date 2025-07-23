"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";
import { Home, LogOut, UserCircle2 } from "lucide-react";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { usePathname } from "next/navigation";

export function Header() {
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const isChinese = pathname.startsWith('/cn');
  
  const profileUrl = isChinese ? '/cn/profile' : '/profile';
  const homeUrl = isChinese ? '/cn' : '/';
  const loginUrl = isChinese ? '/cn/login' : '/login';

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href={homeUrl} className="mr-6 flex items-center space-x-2">
            <span className="hidden font-bold sm:inline-block">
              Temporal Harmony Oracle
            </span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <LanguageSwitcher />
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "User"} data-ai-hint="profile avatar" />
                    <AvatarFallback>
                      <UserCircle2 />
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{user.displayName || user.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={profileUrl}>Profile</Link>
                </DropdownMenuItem>
                 <DropdownMenuItem asChild>
                  <Link href={homeUrl}>Home</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href={loginUrl}>
               <Avatar className="h-9 w-9">
                  <AvatarFallback>
                    <UserCircle2 />
                  </AvatarFallback>
                </Avatar>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
