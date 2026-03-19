"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteReadNotifications } from "./actions";

export function DeleteReadButton() {
    const [isPending, startTransition] = useTransition();

    const handleClick = () => {
        if (!confirm("읽은 알림을 모두 삭제하시겠습니까?")) return;
        startTransition(async () => {
            await deleteReadNotifications();
            window.dispatchEvent(new CustomEvent("notification-update"));
        });
    };

    return (
        <button
            onClick={handleClick}
            disabled={isPending}
            className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-rose-500 disabled:opacity-50 transition-colors"
        >
            <Trash2 className="w-4 h-4" />
            읽은 알림 모두 삭제
        </button>
    );
}
