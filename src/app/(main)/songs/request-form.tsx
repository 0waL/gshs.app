"use client"

import { requestSong, updateGradeDescription } from "./actions";
import { Search, Plus, Clock, AlertCircle, Pencil, X, Check } from "lucide-react";
import { useRef, useEffect, useState } from "react";
import { toast } from "sonner";

type Props = {
  isEligible: boolean;
  gradeDescription: string;
  canEdit: boolean;
}

export function SongRequestForm({ isEligible, gradeDescription, canEdit }: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isBreakTime, setIsBreakTime] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(gradeDescription);

  const isDisabled = isBreakTime || !isEligible;

  useEffect(() => {
    const checkTime = () => {
      const now = new Date();
      const hours = now.getHours();
      setIsBreakTime(hours >= 5 && hours < 7);
    };

    checkTime();
    const interval = setInterval(checkTime, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-4">
      {/* 안내 문구 */}
      <div className="p-4 rounded-2xl flex items-start gap-3 text-sm" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", color: "var(--foreground)" }}>
        <Clock className="w-5 h-5 shrink-0 mt-0.5" style={{ color: "var(--accent)" }} />
        <div className="space-y-1 flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="font-semibold">기상곡 신청 안내</p>
            {canEdit && !isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1 text-xs opacity-60 hover:opacity-100 shrink-0"
                style={{ color: "var(--accent)" }}
              >
                <Pencil className="w-3 h-3" />
                학년 일정 수정
              </button>
            )}
          </div>
          <ul className="list-disc list-inside space-y-0.5 opacity-80">
            <li>신청 가능 시간: <span className="font-bold">매일 07:00 ~ 익일 05:00</span></li>
            <li>05:00 ~ 07:00 사이에는 신청이 제한됩니다.</li>
            <li>어제 신청 승인된 곡은 오늘 아침에, 오늘 신청한 곡은 내일 아침에 방송됩니다.</li>
            {!isEditing && editValue && (
              <li>학년별 신청 일정: {editValue}</li>
            )}
          </ul>

          {isEditing ? (
            <div className="pt-2 space-y-2">
              <textarea
                value={editValue}
                onChange={e => setEditValue(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 rounded-xl border text-sm resize-none focus:outline-none"
                style={{ backgroundColor: "var(--surface-2)", borderColor: "var(--border)", color: "var(--foreground)" }}
                placeholder="예: 3학년: 일,월,수,금 / 2학년: 화,목 / 1학년: 토"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await updateGradeDescription(editValue);
                      setIsEditing(false);
                      toast.success("안내 문구가 저장되었습니다.");
                    } catch {
                      toast.error("저장 중 오류가 발생했습니다.");
                    }
                  }}
                  className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium"
                  style={{ backgroundColor: "var(--accent)", color: "var(--brand-sub)" }}
                >
                  <Check className="w-3 h-3" />
                  저장
                </button>
                <button
                  type="button"
                  onClick={() => { setIsEditing(false); setEditValue(gradeDescription); }}
                  className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium"
                  style={{ backgroundColor: "var(--surface-2)", color: "var(--muted)" }}
                >
                  <X className="w-3 h-3" />
                  취소
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {isBreakTime && (
        <div className="p-4 rounded-2xl flex items-center gap-3 text-sm border" style={{ backgroundColor: "var(--surface-2)", borderColor: "var(--border)", color: "var(--foreground)" }}>
          <AlertCircle className="w-5 h-5" style={{ color: "var(--accent)" }} />
          <span>지금은 기상곡 신청 시간이 아닙니다. (07:00부터 신청 가능)</span>
        </div>
      )}

      {!isEligible && !isBreakTime && (
        <div className="p-4 rounded-2xl flex items-center gap-3 text-sm border" style={{ backgroundColor: "var(--surface-2)", borderColor: "var(--border)", color: "var(--foreground)" }}>
          <AlertCircle className="w-5 h-5" style={{ color: "var(--muted)" }} />
          <span>오늘은 내 학년의 기상곡 신청일이 아닙니다.</span>
        </div>
      )}

      <form
        action={async (formData) => {
          try {
            await requestSong(formData);
            formRef.current?.reset();
            toast.success("기상곡 신청이 완료되었습니다!");
          } catch (error: any) {
            toast.error(error.message || "신청 중 오류가 발생했습니다.");
          }
        }}
        ref={formRef}
        className={`glass p-4 rounded-2xl flex flex-col gap-4 md:flex-row md:items-center ${isDisabled ? 'opacity-50 pointer-events-none grayscale' : ''}`}
      >
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--muted)" }} />
          <input
            name="youtubeUrl"
            type="url"
            placeholder="YouTube URL을 입력하세요..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border focus:outline-none"
            style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)", color: "var(--foreground)" }}
            required
            disabled={isDisabled}
          />
        </div>
        <div className="flex-1 md:max-w-xs">
          <input
            name="videoTitle"
            type="text"
            placeholder="노래 제목 (선택)"
            className="w-full px-4 py-2 rounded-xl border focus:outline-none"
            style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)", color: "var(--foreground)" }}
            disabled={isDisabled}
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isAnonymous"
            name="isAnonymous"
            className="w-4 h-4 rounded"
            disabled={isDisabled}
          />
          <label htmlFor="isAnonymous" className="text-sm select-none cursor-pointer" style={{ color: "var(--muted)" }}>
            내 정보 가리기
          </label>
        </div>
        <button
          type="submit"
          disabled={isDisabled}
          className="flex items-center justify-center gap-2 px-6 py-2 rounded-xl font-medium transition-colors cursor-pointer disabled:cursor-not-allowed"
          style={{ backgroundColor: "var(--accent)", color: "var(--brand-sub)" }}
        >
          <Plus className="w-4 h-4" />
          <span>신청하기</span>
        </button>
      </form>
    </div>
  )
}
