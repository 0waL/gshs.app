"use client"

import { useState } from "react";
import { saveRetentionSettings, getLogsForExport } from "./actions";
import { Save, Download, Loader2 } from "lucide-react";

export function LogSettingsForm({ initialDays }: { initialDays: number }) {
    const [days, setDays] = useState(initialDays);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await saveRetentionSettings(days);
            alert("설정이 저장되었습니다.");
        } catch (e) {
            alert("저장 중 오류가 발생했습니다.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium mb-1">
                    로그 보관 기간 (일)
                </label>
                <input
                    type="number"
                    value={days}
                    onChange={(e) => setDays(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg focus:outline-none"
                />
                <p className="text-xs text-slate-500 mt-1">이 기간보다 오래된 로그는 자동으로 삭제됩니다.</p>
            </div>
            <button
                onClick={handleSave}
                disabled={isSaving}
                className="btn-semantic btn-primary flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
            >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                설정 저장
            </button>
        </div>
    );
}

export function DownloadButton() {
    const [isLoading, setIsLoading] = useState(false);

    const handleDownload = async () => {
        setIsLoading(true);
        try {
            const csvData = await getLogsForExport();
            // UTF-8 BOM 추가하여 엑셀에서 한글 깨짐 방지
            const blob = new Blob(["\ufeff" + csvData], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `system_logs_${new Date().toISOString().slice(0, 10)}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (e) {
            alert("다운로드 중 오류가 발생했습니다.");
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleDownload}
            disabled={isLoading}
            className="btn-semantic flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
        >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            로그 다운로드 (CSV)
        </button>
    );
}
