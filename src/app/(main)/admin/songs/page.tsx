import { startOfDay } from "date-fns";
import { fromZonedTime, toZonedTime } from "date-fns-tz";
import { Check, X, Play, History, ChevronLeft } from "lucide-react";
import { format } from "date-fns";

import { prisma } from "@/lib/db";
import { updateSongStatus } from "./actions";
import { BanUserButton } from "./ban-user-button";

const SEOUL_TZ = "Asia/Seoul";

function getTodayStartUTC() {
  const nowKST = toZonedTime(new Date(), SEOUL_TZ);
  const kstMidnight = startOfDay(nowKST);
  return fromZonedTime(kstMidnight, SEOUL_TZ);
}

export default async function AdminSongsPage({
  searchParams,
}: {
  searchParams: Promise<{ history?: string }>;
}) {
  const { history } = await searchParams;
  const showHistory = history === "1";

  const todayStartUTC = getTodayStartUTC();

  const songs = showHistory
    ? await prisma.songRequest.findMany({
        orderBy: { createdAt: "desc" },
        include: { requester: true },
        where: { createdAt: { lt: todayStartUTC } },
      })
    : await prisma.songRequest.findMany({
        orderBy: { createdAt: "desc" },
        include: { requester: true },
        where: { createdAt: { gte: todayStartUTC } },
      });

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">기상곡 관리</h1>
        {showHistory ? (
          <a
            href="/admin/songs"
            className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition-colors"
            style={{ backgroundColor: "var(--surface-2)", color: "var(--foreground)" }}
          >
            <ChevronLeft className="w-4 h-4" />
            오늘 신청곡 보기
          </a>
        ) : (
          <a
            href="/admin/songs?history=1"
            className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition-colors"
            style={{ backgroundColor: "var(--surface-2)", color: "var(--muted)" }}
          >
            <History className="w-4 h-4" />
            이전에 신청했던 곡 보기
          </a>
        )}
      </div>

      {showHistory && (
        <p className="text-sm -mt-4" style={{ color: "var(--muted)" }}>
          오늘 이전에 신청된 곡 목록입니다. 최신순으로 정렬됩니다.
        </p>
      )}

      <div className="glass rounded-3xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="border-b" style={{ backgroundColor: "var(--surface-2)", borderColor: "var(--border)" }}>
            <tr>
              <th className="p-4 font-medium" style={{ color: "var(--muted)" }}>신청자</th>
              <th className="p-4 font-medium" style={{ color: "var(--muted)" }}>제목 / URL</th>
              <th className="p-4 font-medium" style={{ color: "var(--muted)" }}>신청일시</th>
              <th className="p-4 font-medium" style={{ color: "var(--muted)" }}>상태</th>
              <th className="p-4 font-medium text-right" style={{ color: "var(--muted)" }}>관리</th>
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: "var(--border)" }}>
            {songs.map((song) => (
              <tr key={song.id} className="transition-colors">
                <td className="p-4">
                  <div className="font-medium">{song.requester.name}</div>
                  <div className="text-xs" style={{ color: "var(--muted)" }}>{song.requester.studentId}</div>
                </td>
                <td className="p-4 max-w-xs truncate">
                  <div className="font-medium truncate">{song.videoTitle}</div>
                  <a
                    href={song.youtubeUrl}
                    target="_blank"
                    className="text-xs hover:underline truncate block"
                    style={{ color: "var(--accent)" }}
                  >
                    {song.youtubeUrl}
                  </a>
                </td>
                <td className="p-4 text-sm" style={{ color: "var(--muted)" }}>
                  {format(song.createdAt, "MM.dd HH:mm")}
                </td>
                <td className="p-4">
                  <span
                    className={`px-2 py-1 rounded-md text-xs font-bold ${
                      song.status === "PENDING"
                        ? "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                        : song.status === "APPROVED"
                          ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                          : song.status === "REJECTED"
                            ? "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400"
                            : "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                    }`}
                  >
                    {song.status === "PENDING"
                      ? "대기중"
                      : song.status === "APPROVED"
                        ? "승인됨"
                        : song.status === "REJECTED"
                          ? "반려됨"
                          : "재생됨"}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <BanUserButton userId={song.requesterId} userName={song.requester.name} />
                    {song.status === "PENDING" && (
                      <>
                        <form action={updateSongStatus.bind(null, song.id, "APPROVED", undefined)}>
                          <button
                            className="p-2 rounded-lg bg-emerald-100 text-emerald-600 hover:bg-emerald-200 transition-colors dark:bg-emerald-900/30 dark:text-emerald-400"
                            title="승인"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        </form>
                        <form action={updateSongStatus.bind(null, song.id, "REJECTED", undefined)}>
                          <button
                            className="p-2 rounded-lg bg-rose-100 text-rose-600 hover:bg-rose-200 transition-colors dark:bg-rose-900/30 dark:text-rose-400"
                            title="반려"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </form>
                      </>
                    )}
                    {song.status === "APPROVED" && (
                      <form action={updateSongStatus.bind(null, song.id, "PLAYED", undefined)}>
                        <button
                          className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors dark:bg-blue-900/30 dark:text-blue-400"
                          title="재생 완료 처리"
                        >
                          <Play className="w-4 h-4" />
                        </button>
                      </form>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {songs.length === 0 && (
          <div className="p-12 text-center" style={{ color: "var(--muted)" }}>
            {showHistory ? "이전 신청 기록이 없습니다." : "오늘 신청된 곡이 없습니다."}
          </div>
        )}
      </div>
    </div>
  );
}
