"use client"

import { useState } from "react";
import { runSystemTests, TestResult } from "./actions";
import { Play, CheckCircle, XCircle, Loader2, AlertTriangle } from "lucide-react";

export function TestRunner() {
  const [results, setResults] = useState<TestResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const handleRunTest = async () => {
    setLoading(true);
    setResults(null);
    setError(null);
    setExpandedIndex(null);
    try {
      const data = await runSystemTests();
      setResults(data);
    } catch (e: any) {
      setError(e.message || "An error occurred during the test.");
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (idx: number) => {
    setExpandedIndex(expandedIndex === idx ? null : idx);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-center">
        <button
          onClick={handleRunTest}
          disabled={loading}
          data-testid="run-system-tests"
          className="btn-primary group relative inline-flex h-14 items-center justify-center px-8 font-bold transition-all duration-300 hover:scale-105 focus:outline-none disabled:opacity-70 disabled:scale-100"
        >
          {loading ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <Play className="mr-2 h-5 w-5 fill-current" />
          )}
          <span>{loading ? "시스템 진단 중..." : "전체 시스템 기능 진단 시작"}</span>
        </button>
      </div>

      {error && (
        <div className="rounded-xl bg-rose-500/10 p-4 text-rose-600 dark:text-rose-400 flex items-center gap-3 border border-rose-500/30">
          <AlertTriangle className="h-5 w-5" />
          {error}
        </div>
      )}

      {results && (
        <div className="grid gap-4">
          {results.map((res, idx) => (
            <div
              key={idx}
              data-testid="system-test-result"
              data-status={res.status}
              data-test-name={res.name}
              className="overflow-hidden rounded-2xl shadow-sm transition-all duration-500 animate-in fade-in slide-in-from-bottom-2"
              style={{
                backgroundColor: "var(--surface)",
                border: "1px solid var(--border)",
                animationDelay: `${idx * 100}ms`,
              }}
            >
              <div
                className="flex items-center justify-between p-5 cursor-pointer transition-colors"
                onClick={() => toggleExpand(idx)}
              >
                <div className="flex items-center gap-4">
                  {res.status === 'PASS' ? (
                    <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-full">
                      <CheckCircle className="h-6 w-6" />
                    </div>
                  ) : (
                    <div className="p-2 bg-rose-500/10 text-rose-500 rounded-full">
                      <XCircle className="h-6 w-6" />
                    </div>
                  )}
                  <div>
                    <div className="font-bold text-lg flex items-center gap-2" style={{ color: "var(--foreground)" }}>
                      {res.name}
                      <span
                        className="text-xs font-normal px-2 py-0.5 rounded"
                        style={{ backgroundColor: "var(--surface-2)", color: "var(--muted)" }}
                      >
                        {expandedIndex === idx ? "접기" : "상세보기"}
                      </span>
                    </div>
                    {res.message && (
                      <div
                        className={`text-sm mt-1 font-medium ${
                          res.status === "PASS" ? "text-emerald-500" : "text-rose-500"
                        }`}
                      >
                        {res.message}
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-base font-bold ${res.status === 'PASS' ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {res.status}
                  </div>
                  {res.latency !== undefined && (
                    <div className="text-xs font-mono mt-1" style={{ color: "var(--muted)" }}>{res.latency}ms</div>
                  )}
                </div>
              </div>

              {expandedIndex === idx && res.details && (
                <div className="px-5 pb-5 animate-in slide-in-from-top-2 duration-200">
                  <div
                    className="p-4 rounded-xl font-mono text-xs md:text-sm text-emerald-500 max-h-60 overflow-y-auto"
                    style={{ backgroundColor: "var(--surface-2)", border: "1px solid var(--border)" }}
                  >
                    {res.details.map((log, i) => (
                      <div key={i} className="mb-1 last:mb-0 break-all">
                        <span className="mr-2" style={{ color: "var(--muted)" }}>$</span>
                        {log}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
