import { Metadata } from "next";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { startOfDay } from "date-fns";
import { fromZonedTime, toZonedTime } from "date-fns-tz";
import { Check, Music as MusicIcon, Play, Settings, History, ChevronLeft } from "lucide-react";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

import { updateSongStatus } from "./actions";
import { RejectSongButton } from "./reject-song-button";
import { RuleSettingsForm } from "./rule-settings-form";
import { BanUserButton } from "../admin/songs/ban-user-button";

export const metadata: Metadata = {
  title: "방송부 스튜디오",
  robots: {
    index: false,
    follow: false,
  },
};

const DAYS = ["일", "월", "화", "수", "목", "금", "토"];
const SEOUL_TZ = "Asia/Seoul";

function getTodayStartUTC() {
  const nowKST = toZonedTime(new Date(), SEOUL_TZ);
  const kstMidnight = startOfDay(nowKST);
  return fromZonedTime(kstMidnight, SEOUL_TZ);
}

export default async function MusicManagerPage({
  searchParams,
}: {
  searchParams: Promise<{ history?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "BROADCAST" && user.role !== "ADMIN")) {
    redirect("/");
  }

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
        orderBy: [{ priorityScore: "desc" }, { createdAt: "asc" }],
        include: { requester: true },
        where: {
          createdAt: { gte: todayStartUTC },
          status: { not: "PLAYED" },
        },
      });

  const rules = await prisma.songRule.findMany();
  const ruleRows = DAYS.map((day, idx) => ({
    day,
    dayOfWeek: idx,
    allowedGrade: rules.find((rule) => rule.dayOfWeek === idx)?.allowedGrade || "ALL",
  }));

  return (
    <div className="p-4 md:p-8 space-y-8">
      <div className="flex items-center gap-3">
        <div
          className="p-3 rounded-full"
          style={{ backgroundColor: "var(--surface-2)", color: "var(--accent)" }}
        >
          <MusicIcon className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">방송부 스튜디오</h1>
          <p style={{ color: "var(--muted)" }}>
            기상곡 신청을 관리하고 요일별 신청 가능 학년을 설정합니다.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold flex items-center gap-2">
              {showHistory ? (
                <>
                  <History className="w-5 h-5" />
                  <span>이전 신청 기록</span>
                  <span className="text-xs font-normal" style={{ color: "var(--muted)" }}>
                    (최신순)
                  </span>
                </>
              ) : (
                <>
                  <span>현재 신청 목록</span>
                  <span className="text-xs font-normal" style={{ color: "var(--muted)" }}>
                    (우선순위 순 정렬)
                  </span>
                </>
              )}
            </h2>
            {showHistory ? (
              <a
                href="/music"
                className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition-colors"
                style={{ backgroundColor: "var(--surface-2)", color: "var(--foreground)" }}
              >
                <ChevronLeft className="w-4 h-4" />
                오늘 신청곡 보기
              </a>
            ) : (
              <a
                href="/music?history=1"
                className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition-colors"
                style={{ backgroundColor: "var(--surface-2)", color: "var(--muted)" }}
              >
                <History className="w-4 h-4" />
                이전에 신청했던 곡 보기
              </a>
            )}
          </div>

          <div className="glass rounded-3xl overflow-hidden">
            <div className="md:hidden p-3 space-y-3">
              {songs.map((song) => (
                <div
                  key={song.id}
                  className="rounded-2xl border p-3 space-y-2"
                  style={{ borderColor: "var(--border)", backgroundColor: "var(--surface)" }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      {!showHistory && (
                        <div className="text-xs font-mono" style={{ color: "var(--muted)" }}>
                          점수 {song.priorityScore}
                        </div>
                      )}
                      <div className="font-medium truncate">{song.videoTitle}</div>
                    </div>
                    <div className="text-right text-xs" style={{ color: "var(--muted)" }}>
                      <div>{song.requester.name}</div>
                      <div>{format(song.createdAt, "MM.dd HH:mm")}</div>
                    </div>
                  </div>

                  <a
                    href={song.youtubeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs hover:underline block truncate"
                    style={{ color: "var(--accent)" }}
                  >
                    {song.youtubeUrl}
                  </a>

                  {song.rejectionReason && song.status === "REJECTED" && (
                    <p className="text-xs whitespace-pre-wrap" style={{ color: "var(--muted)" }}>
                      반려 사유: {song.rejectionReason}
                    </p>
                  )}

                  <div className="flex items-center gap-2 pt-1">
                    {song.status === "PENDING" && (
                      <>
                        <form
                          action={updateSongStatus.bind(null, song.id, "APPROVED", undefined)}
                          className="flex-1"
                        >
                          <button
                            className="w-full py-2 rounded-lg text-sm font-semibold"
                            style={{ backgroundColor: "var(--surface-2)", color: "var(--accent)" }}
                          >
                            승인
                          </button>
                        </form>
                        <div className="flex-1">
                          <RejectSongButton
                            songId={song.id}
                            songTitle={song.videoTitle}
                            variant="full"
                          />
                        </div>
                        <BanUserButton userId={song.requester.id} userName={song.requester.name} />
                      </>
                    )}

                    {song.status === "APPROVED" && (
                      <form
                        action={updateSongStatus.bind(null, song.id, "PLAYED", undefined)}
                        className="flex-1"
                      >
                        <button
                          className="w-full py-2 rounded-lg text-sm font-semibold"
                          style={{ backgroundColor: "var(--surface-2)", color: "var(--accent)" }}
                        >
                          재생 완료
                        </button>
                      </form>
                    )}

                    {song.status === "REJECTED" && (
                      <div className="flex items-center gap-2 w-full">
                        <span className="text-xs font-bold" style={{ color: "var(--muted)" }}>
                          반려됨
                        </span>
                        <BanUserButton userId={song.requester.id} userName={song.requester.name} />
                      </div>
                    )}

                    {song.status === "PLAYED" && (
                      <span className="text-xs font-bold" style={{ color: "var(--muted)" }}>
                        재생됨
                      </span>
                    )}
                  </div>
                </div>
              ))}

              {songs.length === 0 && (
                <div className="p-8 text-center" style={{ color: "var(--muted)" }}>
                  {showHistory ? "이전 신청 기록이 없습니다." : "대기 중인 신청곡이 없습니다."}
                </div>
              )}
            </div>

            <table className="hidden md:table w-full text-left">
              <thead
                className="text-xs font-bold border-b"
                style={{
                  backgroundColor: "var(--surface-2)",
                  color: "var(--muted)",
                  borderColor: "var(--border)",
                }}
              >
                <tr>
                  {!showHistory && <th className="p-4">점수</th>}
                  <th className="p-4">곡 정보</th>
                  <th className="p-4">신청자</th>
                  {showHistory && <th className="p-4">상태</th>}
                  <th className="p-4 text-right">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y [--tw-divide-color:var(--border)]">
                {songs.map((song) => (
                  <tr key={song.id} className="transition-colors" style={{ backgroundColor: "transparent" }}>
                    {!showHistory && (
                      <td className="p-4 font-mono text-xs" style={{ color: "var(--muted)" }}>
                        {song.priorityScore}
                      </td>
                    )}
                    <td className="p-4 max-w-[240px]">
                      <div className="font-medium truncate">{song.videoTitle}</div>
                      <a
                        href={song.youtubeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs hover:underline truncate block"
                        style={{ color: "var(--accent)" }}
                      >
                        {song.youtubeUrl}
                      </a>
                      {song.rejectionReason && song.status === "REJECTED" && (
                        <p className="mt-1 text-xs whitespace-pre-wrap" style={{ color: "var(--muted)" }}>
                          반려 사유: {song.rejectionReason}
                        </p>
                      )}
                    </td>
                    <td className="p-4 text-sm">
                      <div>{song.requester.name}</div>
                      <div className="text-xs" style={{ color: "var(--muted)" }}>
                        {format(song.createdAt, "MM.dd HH:mm")}
                      </div>
                    </td>
                    {showHistory && (
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
                    )}
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-1">
                        {song.status === "PENDING" && (
                          <>
                            <form action={updateSongStatus.bind(null, song.id, "APPROVED", undefined)}>
                              <button
                                className="p-2 rounded-lg"
                                style={{ backgroundColor: "var(--surface-2)", color: "var(--accent)" }}
                                title="승인"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            </form>
                            <RejectSongButton songId={song.id} songTitle={song.videoTitle} />
                            <BanUserButton userId={song.requester.id} userName={song.requester.name} />
                          </>
                        )}

                        {song.status === "APPROVED" && (
                          <form action={updateSongStatus.bind(null, song.id, "PLAYED", undefined)}>
                            <button
                              className="p-2 rounded-lg"
                              title="재생 완료"
                              style={{ backgroundColor: "var(--surface-2)", color: "var(--accent)" }}
                            >
                              <Play className="w-4 h-4" />
                            </button>
                          </form>
                        )}

                        {song.status === "REJECTED" && (
                          <div className="flex items-center gap-2 py-2">
                            <span className="text-xs font-bold" style={{ color: "var(--muted)" }}>
                              반려됨
                            </span>
                            <BanUserButton userId={song.requester.id} userName={song.requester.name} />
                          </div>
                        )}

                        {song.status === "PLAYED" && (
                          <span className="text-xs font-bold py-2 px-1" style={{ color: "var(--muted)" }}>
                            재생됨
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {songs.length === 0 && (
              <div className="hidden md:block p-12 text-center" style={{ color: "var(--muted)" }}>
                {showHistory ? "이전 신청 기록이 없습니다." : "대기 중인 신청곡이 없습니다."}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Settings className="w-5 h-5" />
            <span>요일별 규칙</span>
          </h2>
          <RuleSettingsForm initialRules={ruleRows} />
        </div>
      </div>
    </div>
  );
}
