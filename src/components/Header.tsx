
"use client";

import Link from "next/link";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { usePathname } from "next/navigation";

export function Header() {
  const pathname = usePathname();
  const isChinese = pathname.startsWith('/cn');
  const homeUrl = isChinese ? '/cn' : '/';

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
        </div>
      </div>
    </header>
  );
}
