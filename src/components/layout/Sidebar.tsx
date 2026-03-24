"use client";

import Link from "next/link";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Pin, PinOff, X } from "lucide-react";
import { Dialog, DialogOverlay, DialogPortal } from "@/components/ui/dialog";
import { SidebarNav } from "./SidebarNav";

export const SIDEBAR_MIN_WIDTH = 180;
export const SIDEBAR_MAX_WIDTH = 480;

type SidebarProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigate: () => void;
  isPinned: boolean;
  onPinToggle: () => void;
  sidebarWidth: number;
  onWidthChange: (width: number) => void;
};

export function Sidebar({
  open,
  onOpenChange,
  onNavigate,
  isPinned,
  onPinToggle,
  sidebarWidth,
  onWidthChange,
}: SidebarProps) {
  const handleDragStart = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = sidebarWidth;

    const onMouseMove = (e: MouseEvent) => {
      const newWidth = Math.min(
        Math.max(startWidth + (e.clientX - startX), SIDEBAR_MIN_WIDTH),
        SIDEBAR_MAX_WIDTH,
      );
      onWidthChange(newWidth);
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  const sidebarContent = (
    <aside className="sidebar-shell relative flex h-full w-full flex-col px-4 py-4">
      {/* Header */}
      <div
        className="flex items-center justify-between gap-2 border-b pb-4"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="min-w-0">
          <Link
            href="/"
            onClick={onNavigate}
            className="block text-[1.7rem] font-bold leading-none tracking-[-0.04em]"
            style={{ color: "var(--foreground)" }}
          >
            GSHS.app
          </Link>
          <p className="mt-1 text-xs" style={{ color: "var(--muted)" }}>
            원하는 페이지로 빠르게 이동하세요.
          </p>
        </div>
        {/* Close button — only in overlay mode */}
        {!isPinned && (
          <button
            onClick={() => onOpenChange(false)}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-colors"
            style={{
              backgroundColor: "var(--surface-2)",
              borderColor: "var(--border)",
              color: "var(--foreground)",
            }}
            aria-label="사이드바 닫기"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Nav */}
      <div className="mt-5 flex-1 overflow-y-auto pr-1">
        <SidebarNav onNavigate={isPinned ? undefined : onNavigate} />
      </div>

      {/* Pin button — bottom-right */}
      <div className="flex justify-end pt-3">
        <button
          onClick={onPinToggle}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border transition-colors"
          style={
            isPinned
              ? {
                  backgroundColor: "var(--accent)",
                  borderColor: "var(--accent)",
                  color: "var(--brand-sub)",
                }
              : {
                  backgroundColor: "var(--surface-2)",
                  borderColor: "var(--border)",
                  color: "var(--muted)",
                }
          }
          aria-label={isPinned ? "사이드바 고정 해제" : "사이드바 고정"}
          title={isPinned ? "고정 해제" : "목록 고정"}
        >
          {isPinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* Drag-to-resize handle — pinned mode only */}
      {isPinned && (
        <div
          className="absolute inset-y-0 right-0 flex w-2 cursor-col-resize items-center justify-center group"
          onMouseDown={handleDragStart}
        >
          <div
            className="h-10 w-0.5 rounded-full transition-all group-hover:h-16 group-hover:w-1"
            style={{ backgroundColor: "var(--border)" }}
          />
        </div>
      )}
    </aside>
  );

  if (isPinned) {
    return (
      <div
        id="desktop-sidebar-drawer"
        data-testid="desktop-sidebar-drawer"
        className="fixed inset-y-0 left-0 z-[70] hidden border-r md:flex"
        style={{
          width: `${sidebarWidth}px`,
          backgroundColor: "color-mix(in srgb, var(--surface) 96%, transparent)",
          borderColor: "var(--border)",
        }}
      >
        {sidebarContent}
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay
          data-testid="desktop-sidebar-overlay"
          className="hidden bg-black/18 backdrop-blur-[2px] md:block md:z-[50]"
        />
        <DialogPrimitive.Content
          id="desktop-sidebar-drawer"
          data-testid="desktop-sidebar-drawer"
          aria-label="데스크톱 사이드바"
          className="fixed inset-y-0 left-0 z-[70] hidden w-[18rem] transform-gpu border-r outline-none transition-transform duration-200 ease-out data-[state=closed]:-translate-x-full data-[state=open]:translate-x-0 md:flex"
          style={{
            backgroundColor: "color-mix(in srgb, var(--surface) 96%, transparent)",
            borderColor: "var(--border)",
            boxShadow: "0 28px 80px color-mix(in srgb, var(--foreground) 14%, transparent)",
          }}
        >
          <DialogPrimitive.Title className="sr-only">데스크톱 사이드바</DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            주요 페이지로 이동할 수 있는 데스크톱용 네비게이션 메뉴입니다.
          </DialogPrimitive.Description>
          {sidebarContent}
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
