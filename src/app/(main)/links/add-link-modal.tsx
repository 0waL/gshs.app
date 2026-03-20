"use client"

import { useState, useRef } from "react";
import { Plus, X } from "lucide-react";
import { createLink } from "./actions";

export function AddLinkModal() {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-colors"
        style={{ backgroundColor: "var(--accent)", color: "var(--brand-sub)" }}
      >
        <Plus className="w-4 h-4" />
        추가하기
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div className="glass rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Plus className="w-5 h-5" />
                새 링크 추가
              </h3>
              <button
                onClick={() => setOpen(false)}
                className="tap-target p-2 rounded-lg"
                style={{ color: "var(--muted)" }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              ref={formRef}
              action={async (formData) => {
                await createLink(formData);
                setOpen(false);
              }}
              className="flex flex-col gap-4"
            >
              <input
                name="title"
                placeholder="사이트 이름"
                required
                className="px-4 py-3 rounded-xl border"
                style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)", color: "var(--foreground)" }}
              />
              <input
                name="url"
                placeholder="URL (https://...)"
                required
                className="px-4 py-3 rounded-xl border"
                style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)", color: "var(--foreground)" }}
              />
              <input type="hidden" name="category" value="GENERAL" />
              <input
                name="description"
                placeholder="간단한 설명 (선택)"
                className="px-4 py-3 rounded-xl border"
                style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)", color: "var(--foreground)" }}
              />
              <button
                type="submit"
                className="py-3 font-bold rounded-xl transition-colors mt-2"
                style={{ backgroundColor: "var(--accent)", color: "var(--brand-sub)" }}
              >
                추가하기
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
