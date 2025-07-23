"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check, Globe } from "lucide-react";

export function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();

  const languages = [
    { code: "en", name: "English" },
    { code: "zh-CN", name: "简体中文" },
  ];

  const currentLangCode = pathname.startsWith("/cn") ? "zh-CN" : "en";
  const currentLanguage = languages.find((l) => l.code === currentLangCode) || languages[0];

  const handleLanguageChange = (newLangCode: string) => {
    const currentPath = pathname;
    let newPath;

    if (currentLangCode === 'en' && newLangCode === 'zh-CN') {
      // From English to Chinese
      if (currentPath === '/') {
        newPath = '/cn';
      } else {
        newPath = `/cn${currentPath}`;
      }
    } else if (currentLangCode === 'zh-CN' && newLangCode === 'en') {
      // From Chinese to English
      newPath = currentPath.startsWith('/cn') ? currentPath.substring(3) || '/' : '/';
    } else {
      // No change
      return;
    }
    router.push(newPath);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="gap-2">
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{currentLanguage.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className="justify-between"
          >
            {lang.name}
            {currentLanguage.code === lang.code && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
