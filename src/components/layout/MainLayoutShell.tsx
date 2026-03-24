"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { HomePersonalizationProvider } from "@/app/(main)/home-personalization";
import { DesktopUtilityHeader } from "./DesktopUtilityHeader";
import { Sidebar } from "./Sidebar";

type MainLayoutShellProps = {
  children: ReactNode;
  footer: ReactNode;
  homeWeather: ReactNode;
};

const PINNED_STORAGE_KEY = "sidebar-pinned";

export function MainLayoutShell({ children, footer, homeWeather }: MainLayoutShellProps) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(false);
  const [isSidebarPinned, setIsSidebarPinned] = useState(false);

  // Restore pinned state from localStorage on client mount
  useEffect(() => {
    try {
      if (localStorage.getItem(PINNED_STORAGE_KEY) === "true") {
        setIsSidebarPinned(true);
      }
    } catch {}
  }, []);

  // Close overlay sidebar on navigation (but not when pinned)
  useEffect(() => {
    if (!isSidebarPinned) {
      setIsDesktopSidebarOpen(false);
    }
  }, [pathname, isSidebarPinned]);

  const handlePinToggle = () => {
    setIsSidebarPinned((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(PINNED_STORAGE_KEY, String(next));
      } catch {}
      if (!next) {
        setIsDesktopSidebarOpen(false);
      }
      return next;
    });
  };

  const content = (
    <>
      <Sidebar
        open={isDesktopSidebarOpen}
        onOpenChange={setIsDesktopSidebarOpen}
        onNavigate={() => setIsDesktopSidebarOpen(false)}
        isPinned={isSidebarPinned}
        onPinToggle={handlePinToggle}
      />
      <main
        className={`flex min-h-screen min-w-0 flex-1 flex-col overflow-x-hidden pb-[calc(5.5rem+env(safe-area-inset-bottom))] transition-[margin] duration-200 md:pb-0${isSidebarPinned ? " md:ml-72" : ""}`}
      >
        <DesktopUtilityHeader
          isHome={isHome}
          homeWeather={homeWeather}
          isSidebarOpen={isDesktopSidebarOpen || isSidebarPinned}
          onSidebarToggle={() => {
            if (isSidebarPinned) {
              handlePinToggle();
            } else {
              setIsDesktopSidebarOpen((open) => !open);
            }
          }}
        />
        <div className="flex-1">
          {children}
        </div>
        {footer}
      </main>
    </>
  );

  const wrappedContent = (
    <div className="relative flex min-h-screen min-w-0 flex-1">
      {content}
    </div>
  );

  if (isHome) {
    return <HomePersonalizationProvider>{wrappedContent}</HomePersonalizationProvider>;
  }

  return wrappedContent;
}
