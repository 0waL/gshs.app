"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { mainNavItems } from "@/config/nav";
import { cn } from "@/lib/utils";
import { NotificationBadge } from "./notification-badge";

export function SidebarNav({
  onNavigate,
  compact,
}: {
  onNavigate?: () => void;
  compact?: boolean;
}) {
  const pathname = usePathname();

  return (
    <nav className={cn("sidebar-nav flex w-full flex-col", compact ? "gap-1" : "gap-1.5")}>
      {mainNavItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "sidebar-nav-link flex w-full items-center rounded-xl border font-medium transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]",
              compact
                ? "min-h-10 gap-2.5 px-3 py-1.5 text-sm"
                : "min-h-11 gap-3 px-3.5 py-2.5 text-sm",
              isActive ? "" : "hover:bg-[color:var(--surface-2)]"
            )}
            style={
              isActive
                ? {
                    backgroundColor: "var(--surface-2)",
                    borderColor: "var(--accent)",
                    color: "var(--foreground)",
                  }
                : {
                    backgroundColor: "transparent",
                    borderColor: "transparent",
                    color: "var(--muted)",
                  }
            }
          >
            <div className="relative">
              <item.icon
                className={compact ? "h-4 w-4" : "h-5 w-5"}
                style={{ color: isActive ? "var(--accent)" : "var(--muted)" }}
              />
              {item.href === "/notifications" && <NotificationBadge className="-top-1 -right-1" />}
            </div>
            <span>{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
