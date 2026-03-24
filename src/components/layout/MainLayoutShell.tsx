"use client";

import { CSSProperties, useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { HomePersonalizationProvider } from "@/app/(main)/home-personalization";
import { DesktopUtilityHeader } from "./DesktopUtilityHeader";
import { Sidebar, SIDEBAR_MIN_WIDTH, SIDEBAR_MAX_WIDTH } from "./Sidebar";

type MainLayoutShellProps = {
  children: ReactNode;
  footer: ReactNode;
  homeWeather: ReactNode;
};

const PINNED_KEY = "sidebar-pinned";
const WIDTH_KEY = "sidebar-width";
const DEFAULT_WIDTH = 288; // 18rem

export function MainLayoutShell({ children, footer, homeWeather }: MainLayoutShellProps) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(false);
  const [isSidebarPinned, setIsSidebarPinned] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_WIDTH);

  // Restore persisted preferences on client mount
  useEffect(() => {
    try {
      if (localStorage.getItem(PINNED_KEY) === "true") setIsSidebarPinned(true);
      const savedWidth = parseInt(localStorage.getItem(WIDTH_KEY) ?? "", 10);
      if (savedWidth >= SIDEBAR_MIN_WIDTH && savedWidth <= SIDEBAR_MAX_WIDTH) {
        setSidebarWidth(savedWidth);
      }
    } catch {}
  }, []);

  // Close overlay sidebar on navigation (ignored when pinned)
  useEffect(() => {
    if (!isSidebarPinned) setIsDesktopSidebarOpen(false);
  }, [pathname, isSidebarPinned]);

  const handlePinToggle = () => {
    setIsSidebarPinned((prev) => {
      const next = !prev;
      try { localStorage.setItem(PINNED_KEY, String(next)); } catch {}
      if (!next) setIsDesktopSidebarOpen(false);
      return next;
    });
  };

  const handleWidthChange = (width: number) => {
    setSidebarWidth(width);
    try { localStorage.setItem(WIDTH_KEY, String(width)); } catch {}
  };

  const content = (
    <>
      <Sidebar
        open={isDesktopSidebarOpen}
        onOpenChange={setIsDesktopSidebarOpen}
        onNavigate={() => setIsDesktopSidebarOpen(false)}
        isPinned={isSidebarPinned}
        onPinToggle={handlePinToggle}
        sidebarWidth={sidebarWidth}
        onWidthChange={handleWidthChange}
      />
      <main
        className="sidebar-pinned-content flex min-h-screen min-w-0 flex-1 flex-col overflow-x-hidden pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:pb-0"
        style={{ "--pinned-sidebar-w": isSidebarPinned ? `${sidebarWidth}px` : "0px" } as CSSProperties}
      >
        <DesktopUtilityHeader
          isHome={isHome}
          homeWeather={homeWeather}
          isSidebarOpen={isDesktopSidebarOpen}
          isSidebarPinned={isSidebarPinned}
          onSidebarToggle={() => setIsDesktopSidebarOpen((open) => !open)}
        />
        <div className="flex-1">{children}</div>
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
