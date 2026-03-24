import { getLogStats, getLogSettings } from "./actions";
import { LogSettingsForm, DownloadButton } from "./client";
import { LogViewer } from "./log-viewer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "시스템 로그 관리",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function LogsPage() {
  const stats = await getLogStats();
  const retentionDays = await getLogSettings();

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">시스템 로그 관리</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 통계 카드 */}
        <div
          className="p-6 rounded-xl border shadow-sm"
          style={{ backgroundColor: "var(--surface-2)", borderColor: "var(--border)" }}
        >
          <h3 className="text-sm font-medium" style={{ color: "var(--muted)" }}>총 로그 수</h3>
          <p className="text-3xl font-bold mt-2">{stats.totalCount.toLocaleString()}</p>
        </div>
        <div
          className="p-6 rounded-xl border shadow-sm"
          style={{ backgroundColor: "var(--surface-2)", borderColor: "var(--border)" }}
        >
          <h3 className="text-sm font-medium" style={{ color: "var(--muted)" }}>오늘 생성된 로그</h3>
          <p className="text-3xl font-bold mt-2" style={{ color: "var(--accent)" }}>
            {stats.todayCount.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-bold">최근 로그 기록</h2>
        <LogViewer />
      </div>

      <div
        className="p-6 rounded-xl border shadow-sm space-y-6"
        style={{ backgroundColor: "var(--surface-2)", borderColor: "var(--border)" }}
      >
        <h2
          className="text-lg font-bold pb-2 border-b"
          style={{ borderColor: "var(--border)" }}
        >
          로그 설정 및 다운로드
        </h2>

        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1">
            <LogSettingsForm initialDays={retentionDays} />
          </div>
          <div
            className="flex-1 border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-8"
            style={{ borderColor: "var(--border)" }}
          >
            <h3 className="text-sm font-medium mb-2">로그 데이터 내보내기</h3>
            <p className="text-xs mb-4 leading-relaxed" style={{ color: "var(--muted)" }}>
              최근 10,000건의 시스템 로그를 CSV 파일로 다운로드합니다.<br />
              다운로드한 파일은 엑셀 등에서 열어 분석할 수 있습니다.
            </p>
            <DownloadButton />
          </div>
        </div>
      </div>
    </div>
  );
}
