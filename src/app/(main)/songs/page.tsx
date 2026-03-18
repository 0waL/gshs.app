import { getTodayMorningSongs, getNextMorningSongs } from "./actions";
import { SongList } from "./song-list";
import { SongRequestForm } from "./request-form";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import { prisma } from "@/lib/db";
import { getKSTDate } from "@/lib/date-utils";
import { getUserGrade } from "@/lib/grade-utils";

export const metadata: Metadata = {
  title: "기상곡 신청",
  description: "아침 기상곡을 신청하고 다른 학생들이 신청한 곡을 확인하세요.",
};

export default async function SongsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const todayDay = getKSTDate().getDay();

  const [todaySongs, nextSongs, dbUser, rule, gradeDescSetting] = await Promise.all([
    getTodayMorningSongs(),
    getNextMorningSongs(),
    prisma.user.findUnique({ where: { id: user.id! } }),
    prisma.songRule.findFirst({ where: { dayOfWeek: todayDay } }),
    prisma.systemSetting.findUnique({ where: { key: "SONG_GRADE_DESCRIPTION" } }),
  ]);

  let isEligible = true;
  if (user.role !== 'ADMIN' && rule && rule.allowedGrade !== 'ALL') {
    let grade = await getUserGrade(dbUser?.gisu ?? null);
    if (!grade && dbUser?.studentId && dbUser.studentId.length >= 3) {
      grade = dbUser.studentId.substring(0, 1);
    }
    const allowedGrades = rule.allowedGrade.split(',');
    isEligible = !!grade && allowedGrades.includes(grade);
  }

  const gradeDescription = gradeDescSetting?.value ?? "";
  const canEdit = user.role === 'BROADCAST' || user.role === 'ADMIN';

  return (
    <div className="mobile-page mobile-safe-bottom space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>기상곡 신청</h1>
          <p style={{ color: "var(--muted)" }}>
            매일 07:00 ~ 익일 05:00까지 신청 가능합니다.
          </p>
        </div>
      </div>

      <SongRequestForm isEligible={isEligible} gradeDescription={gradeDescription} canEdit={canEdit} />

      <div className="space-y-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold" style={{ color: "var(--foreground)" }}>🎵 오늘 아침 나온 기상곡</h2>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: "var(--surface-2)", color: "var(--accent)" }}>승인됨</span>
          </div>
          {todaySongs.length > 0 ? (
            <SongList songs={todaySongs} currentUser={user} emptyMessage="오늘 나온 기상곡 내역이 없습니다." />
          ) : (
            <div className="p-8 text-center rounded-2xl border border-dashed" style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)", color: "var(--muted)" }}>
              오늘 선정된 기상곡이 없거나 아직 업데이트되지 않았습니다.
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold" style={{ color: "var(--foreground)" }}>📝 내일 기상곡 신청 현황</h2>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: "var(--surface-2)", color: "var(--accent)" }}>진행중</span>
          </div>
          <SongList songs={nextSongs} currentUser={user} emptyMessage="아직 신청된 노래가 없습니다. 첫 번째 주인공이 되어보세요! 🎵" />
        </div>
      </div>
    </div>
  )
}
