"use client";

import type { ElementType } from "react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  BarChart3,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Copy,
  Download,
  FileClock,
  FileText,
  FolderKanban,
  Gauge,
  History,
  LoaderCircle,
  Newspaper,
  RefreshCcw,
  Save,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
  Workflow,
} from "lucide-react";
import type {
  ExecutiveReport,
  ExecutiveReportMetrics,
  ExecutiveReportSnapshotDto,
  ReportDimension,
  ReportEvidence,
  ReportRange,
  ReportRecommendation,
} from "@/lib/executive-report";

type ReportResponse = {
  ok: true;
  live: ExecutiveReport;
  snapshots: ExecutiveReportSnapshotDto[];
};

type Notice = {
  tone: "success" | "error";
  message: string;
};

const rangeOptions: Array<{ value: ReportRange; label: string }> = [
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "90d", label: "90 days" },
  { value: "all", label: "All time" },
];

const severityStyles: Record<ReportEvidence["severity"], string> = {
  critical: "bg-rose-500",
  attention: "bg-amber-400",
  watch: "bg-[#8B7CFF]",
  positive: "bg-emerald-400",
};

const priorityStyles: Record<ReportRecommendation["priority"], string> = {
  Now: "border-rose-200 bg-rose-50 text-rose-700",
  Next: "border-amber-200 bg-amber-50 text-amber-700",
  Maintain: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

function formatMoment(value: string, withTime = false) {
  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(withTime
      ? {
          hour: "2-digit",
          minute: "2-digit",
        }
      : {}),
  }).format(new Date(value));
}

function formatSigned(value: number) {
  if (value > 0) return `+${value}`;
  return String(value);
}

function buildBrief(report: ExecutiveReport) {
  const lines = [
    "MORROW · EXECUTIVE INTELLIGENCE BRIEF",
    `${report.rangeLabel} · Generated ${formatMoment(report.generatedAt, true)}`,
    "",
    `${report.score}/100 · ${report.signal}`,
    report.summary,
    "",
    "COMMAND DIMENSIONS",
    ...report.dimensions.map(
      (dimension) =>
        `${dimension.label}: ${dimension.score}/100 — ${dimension.note}`
    ),
    "",
    "PRIORITY DECISIONS",
    ...report.recommendations.map(
      (item) =>
        `[${item.priority}] ${item.title} — ${item.detail} (${item.module})`
    ),
    "",
    "EVIDENCE LEDGER",
    ...(report.evidence.length > 0
      ? report.evidence.map(
          (item) =>
            `${item.module}: ${item.title} — ${item.detail} [${item.status}]`
        )
      : ["No urgent evidence signal is currently visible."]),
    "",
    report.methodology,
  ];

  return lines.join("\n");
}

export function ReportsCommandClient() {
  const [range, setRange] = useState<ReportRange>("30d");
  const [data, setData] = useState<ReportResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedSnapshotId, setSelectedSnapshotId] = useState("");
  const [notice, setNotice] = useState<Notice | null>(null);

  async function loadReport(nextRange: ReportRange, quiet = false) {
    if (quiet) setRefreshing(true);
    else setLoading(true);

    try {
      const response = await fetch(`/api/reports?range=${nextRange}`, {
        cache: "no-store",
      });
      const payload = (await response.json()) as
        | ReportResponse
        | { ok: false; message?: string };

      if (!response.ok || payload.ok !== true) {
        throw new Error(
          "message" in payload
            ? payload.message
            : "Morrow could not load this report."
        );
      }

      setData(payload);
      setSelectedSnapshotId((current) => {
        if (payload.snapshots.some((snapshot) => snapshot.id === current)) {
          return current;
        }
        return (
          payload.snapshots.find((snapshot) => snapshot.range === nextRange)?.id ??
          payload.snapshots[0]?.id ??
          ""
        );
      });
      if (quiet) {
        setNotice({ tone: "success", message: "Command picture refreshed." });
      }
    } catch (error) {
      setNotice({
        tone: "error",
        message:
          error instanceof Error
            ? error.message
            : "Morrow could not load this report.",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    void loadReport(range);
  }, [range]);

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(null), 2600);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  const selectedSnapshot = useMemo(
    () =>
      data?.snapshots.find((snapshot) => snapshot.id === selectedSnapshotId) ??
      null,
    [data?.snapshots, selectedSnapshotId]
  );

  async function saveSnapshot() {
    if (!data) return;
    setSaving(true);
    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ range }),
      });
      const payload = (await response.json()) as {
        ok: boolean;
        snapshot?: ExecutiveReportSnapshotDto;
        message?: string;
      };

      if (!response.ok || !payload.ok || !payload.snapshot) {
        throw new Error(payload.message || "Morrow could not save this snapshot.");
      }

      setData((current) =>
        current
          ? {
              ...current,
              snapshots: [payload.snapshot!, ...current.snapshots],
            }
          : current
      );
      setSelectedSnapshotId(payload.snapshot.id);
      setNotice({
        tone: "success",
        message: "Immutable executive snapshot preserved.",
      });
    } catch (error) {
      setNotice({
        tone: "error",
        message:
          error instanceof Error
            ? error.message
            : "Morrow could not save this snapshot.",
      });
    } finally {
      setSaving(false);
    }
  }

  async function copyBrief() {
    if (!data) return;
    await navigator.clipboard.writeText(buildBrief(data.live));
    setNotice({ tone: "success", message: "Executive brief copied." });
  }

  function downloadBrief() {
    if (!data) return;
    const blob = new Blob([buildBrief(data.live)], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `morrow-executive-brief-${new Date()
      .toISOString()
      .slice(0, 10)}.txt`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    setNotice({ tone: "success", message: "Executive brief downloaded." });
  }

  if (loading && !data) {
    return <ReportLoading />;
  }

  if (!data) {
    return (
      <div className="devon-glass rounded-[2rem] p-8 text-center">
        <CircleAlert className="mx-auto text-rose-500" size={24} />
        <h2 className="mt-4 text-xl font-semibold text-[#0B0D12]">
          The command picture is unavailable.
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Your saved records are safe. Ask Morrow to try the read again.
        </p>
        <button
          onClick={() => void loadReport(range)}
          className="mt-5 rounded-2xl bg-[#0B0D12] px-5 py-3 text-sm font-semibold text-white"
        >
          Try again
        </button>
      </div>
    );
  }

  const { live, snapshots } = data;
  const scoreDelta = selectedSnapshot
    ? live.score - selectedSnapshot.score
    : null;

  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-[2.6rem] border border-white/10 bg-[#090A0F] text-white shadow-[0_40px_120px_rgba(11,13,18,0.2)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_18%,rgba(130,112,255,0.28),transparent_27%),radial-gradient(circle_at_12%_90%,rgba(238,190,78,0.12),transparent_30%)]" />
        <div className="pointer-events-none absolute -right-24 -top-48 h-[32rem] w-[32rem] rounded-full border border-white/[0.055]" />
        <div className="pointer-events-none absolute -right-6 -top-32 h-[25rem] w-[25rem] rounded-full border border-white/[0.055]" />

        <div className="relative grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.2fr_0.8fr] lg:p-10">
          <div className="flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/58">
                  <Activity size={13} className="text-[#A99EFF]" />
                  Live command picture
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-400/[0.08] px-3.5 py-2 text-[11px] font-semibold text-emerald-200">
                  <ShieldCheck size={13} />
                  Saved records only
                </span>
              </div>

              <p className="mt-8 text-sm font-medium text-white/42">
                {live.rangeLabel} · refreshed {formatMoment(live.generatedAt, true)}
              </p>
              <h2 className="mt-3 max-w-3xl text-4xl font-semibold tracking-[-0.055em] sm:text-5xl lg:text-[4rem] lg:leading-[0.98]">
                The truth, before
                <br />
                the meeting starts.
              </h2>
              <p className="mt-6 max-w-2xl text-base leading-7 text-white/55">
                {live.summary}
              </p>
            </div>

            <div className="mt-9 flex flex-wrap gap-3">
              <button
                onClick={() => void saveSnapshot()}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-[#0B0D12] transition hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-70"
              >
                {saving ? (
                  <LoaderCircle size={16} className="animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                Preserve snapshot
              </button>
              <button
                onClick={() => void loadReport(range, true)}
                disabled={refreshing}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/12 bg-white/[0.06] px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.1] disabled:opacity-60"
              >
                <RefreshCcw
                  size={16}
                  className={refreshing ? "animate-spin" : ""}
                />
                Refresh truth
              </button>
              <button
                onClick={downloadBrief}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/12 bg-white/[0.06] px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.1]"
              >
                <Download size={16} />
                Download brief
              </button>
            </div>
          </div>

          <div className="rounded-[2.15rem] border border-white/10 bg-white/[0.065] p-5 backdrop-blur-xl sm:p-7">
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.23em] text-white/40">
                  Command health
                </p>
                <p className="mt-2 text-xl font-semibold">{live.signal}</p>
              </div>
              <ScoreRing score={live.score} />
            </div>

            <div className="mt-7 space-y-4">
              {live.dimensions.map((dimension) => (
                <DimensionBar
                  key={dimension.key}
                  dimension={dimension}
                  previous={selectedSnapshot?.dimensions.find(
                    (item) => item.key === dimension.key
                  )}
                />
              ))}
            </div>

            <div className="mt-7 grid grid-cols-3 divide-x divide-white/10 rounded-2xl border border-white/10 bg-black/15 py-4 text-center">
              <HeroStat label="Tracked" value={live.metrics.totals.records} />
              <HeroStat label="Touched" value={live.metrics.totals.activity} />
              <HeroStat
                label="Attention"
                value={live.metrics.totals.needsAttention}
                warning={live.metrics.totals.needsAttention > 0}
              />
            </div>
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-3 rounded-[1.7rem] border border-slate-950/[0.07] bg-white/65 p-3 shadow-[0_16px_55px_rgba(15,23,42,0.04)] backdrop-blur-xl md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 gap-1 overflow-x-auto">
          {rangeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setRange(option.value)}
              className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                range === option.value
                  ? "bg-[#0B0D12] text-white shadow-lg"
                  : "text-slate-500 hover:bg-white hover:text-[#0B0D12]"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        <p className="px-2 text-xs leading-5 text-slate-400">
          The range controls activity context; health always reflects current
          record status.
        </p>
      </div>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
        <div className="devon-glass min-w-0 rounded-[2.2rem] p-6 sm:p-7">
          <SectionHeading
            eyebrow="Operational map"
            title="Every command surface, one read."
            detail="Current totals and the clearest completion or risk signal in each module."
            icon={Gauge}
          />
          <ModuleGrid metrics={live.metrics} />
        </div>

        <div className="devon-glass min-w-0 rounded-[2.2rem] p-6 sm:p-7">
          <SectionHeading
            eyebrow="Movement"
            title={
              selectedSnapshot ? "What changed since the last read." : "A baseline worth keeping."
            }
            detail={
              selectedSnapshot
                ? `Compared with “${selectedSnapshot.title}” from ${formatMoment(
                    selectedSnapshot.createdAt,
                    true
                  )}.`
                : "Preserve a snapshot to unlock exact, point-in-time comparison."
            }
            icon={TrendingUp}
          />

          {selectedSnapshot ? (
            <div className="space-y-4">
              <div className="rounded-[1.7rem] border border-slate-950/[0.07] bg-[#0B0D12] p-5 text-white">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/38">
                      Health movement
                    </p>
                    <p className="mt-2 text-3xl font-semibold tracking-[-0.05em]">
                      {formatSigned(scoreDelta ?? 0)} points
                    </p>
                  </div>
                  <MovementIcon value={scoreDelta ?? 0} />
                </div>
              </div>
              <ComparisonRows
                live={live.metrics}
                snapshot={selectedSnapshot.metrics}
              />
            </div>
          ) : (
            <button
              onClick={() => void saveSnapshot()}
              disabled={saving}
              className="flex min-h-64 w-full flex-col items-center justify-center rounded-[1.8rem] border border-dashed border-slate-300 bg-white/45 p-8 text-center transition hover:border-[#8B7CFF]/45 hover:bg-[#F8F7FF]"
            >
              <FileClock size={28} className="text-[#7466F5]" />
              <span className="mt-4 text-base font-semibold text-[#0B0D12]">
                Preserve the first baseline
              </span>
              <span className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                Future reports will show precise movement against this moment.
              </span>
            </button>
          )}
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <div className="devon-glass min-w-0 rounded-[2.2rem] p-6 sm:p-7">
          <SectionHeading
            eyebrow="Decision queue"
            title="What deserves your attention."
            detail="Rules-based priorities derived directly from status, due dates, and readiness."
            icon={Workflow}
          />
          <div className="space-y-3">
            {live.recommendations.map((item, index) => (
              <RecommendationRow key={item.id} item={item} index={index} />
            ))}
          </div>
        </div>

        <div className="devon-glass min-w-0 rounded-[2.2rem] p-6 sm:p-7">
          <SectionHeading
            eyebrow="Evidence ledger"
            title="Every conclusion can be opened."
            detail="No black box: follow a signal back to the Morrow record behind it."
            icon={ShieldCheck}
          />
          <div className="max-h-[34rem] space-y-2.5 overflow-y-auto pr-1">
            {live.evidence.length > 0 ? (
              live.evidence.map((item) => (
                <EvidenceRow key={item.id} item={item} />
              ))
            ) : (
              <div className="rounded-[1.7rem] border border-emerald-200 bg-emerald-50/70 p-6">
                <CheckCircle2 className="text-emerald-600" size={22} />
                <p className="mt-4 font-semibold text-emerald-950">
                  No urgent evidence signal.
                </p>
                <p className="mt-2 text-sm leading-6 text-emerald-800/70">
                  Morrow found no overdue or high-pressure record in the current
                  operational picture.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <div className="devon-glass min-w-0 rounded-[2.2rem] p-6 sm:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <SectionHeading
              eyebrow="Executive brief"
              title="Ready to carry into the room."
              detail="A concise decision document built from the same verified command state."
              icon={FileText}
              compact
            />
            <button
              onClick={() => void copyBrief()}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-[#0B0D12] px-4 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5"
            >
              <Copy size={15} />
              Copy brief
            </button>
          </div>

          <div className="mt-6 rounded-[1.8rem] border border-slate-950/[0.07] bg-white/72 p-5 sm:p-6">
            <div className="flex items-center justify-between gap-4 border-b border-slate-950/[0.07] pb-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#7466F5]">
                  Morrow executive intelligence
                </p>
                <p className="mt-1 text-sm font-semibold text-[#0B0D12]">
                  {live.rangeLabel}
                </p>
              </div>
              <span className="rounded-full bg-slate-950/[0.05] px-3 py-1.5 text-xs font-semibold text-slate-500">
                v1 · deterministic
              </span>
            </div>
            <p className="mt-5 text-lg font-medium leading-8 tracking-[-0.015em] text-slate-700">
              {live.summary}
            </p>
            <div className="mt-6 space-y-3">
              {live.recommendations.slice(0, 3).map((item) => (
                <div key={item.id} className="flex gap-3 text-sm leading-6 text-slate-600">
                  <Check
                    size={16}
                    className="mt-1 shrink-0 text-[#7466F5]"
                  />
                  <span>
                    <strong className="font-semibold text-[#0B0D12]">
                      {item.title}.
                    </strong>{" "}
                    {item.detail}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-6 border-t border-slate-950/[0.07] pt-4 text-xs leading-5 text-slate-400">
              {live.methodology}
            </p>
          </div>
        </div>

        <div className="devon-glass min-w-0 rounded-[2.2rem] p-6 sm:p-7">
          <SectionHeading
            eyebrow="Snapshot vault"
            title="A memory the dashboard cannot rewrite."
            detail={`${snapshots.length} immutable point-in-time ${
              snapshots.length === 1 ? "record" : "records"
            } preserved.`}
            icon={History}
          />

          <div className="space-y-2.5">
            {snapshots.length > 0 ? (
              snapshots.slice(0, 8).map((snapshot) => {
                const active = snapshot.id === selectedSnapshotId;
                return (
                  <button
                    key={snapshot.id}
                    onClick={() => setSelectedSnapshotId(snapshot.id)}
                    className={`flex w-full items-center gap-4 rounded-[1.4rem] border p-4 text-left transition ${
                      active
                        ? "border-[#8B7CFF]/30 bg-[#F3F0FF] shadow-[0_14px_42px_rgba(91,93,245,0.09)]"
                        : "border-slate-950/[0.07] bg-white/58 hover:bg-white"
                    }`}
                  >
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                        active
                          ? "bg-[#0B0D12] text-white"
                          : "bg-slate-950/[0.05] text-slate-500"
                      }`}
                    >
                      <span className="text-sm font-semibold">{snapshot.score}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-[#0B0D12]">
                        {snapshot.title}
                      </p>
                      <p className="mt-1 truncate text-xs text-slate-400">
                        {snapshot.range.toUpperCase()} · {snapshot.createdBy} ·{" "}
                        {formatMoment(snapshot.createdAt, true)}
                      </p>
                    </div>
                    {active ? (
                      <CheckCircle2 size={17} className="text-[#7466F5]" />
                    ) : (
                      <ChevronRight size={17} className="text-slate-300" />
                    )}
                  </button>
                );
              })
            ) : (
              <div className="rounded-[1.7rem] border border-dashed border-slate-300 bg-white/42 p-7 text-center">
                <History className="mx-auto text-slate-300" size={24} />
                <p className="mt-3 text-sm font-semibold text-slate-600">
                  No snapshots yet
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-400">
                  Preserve today’s command picture to start a defensible history.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {notice ? (
        <div
          className={`fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full border px-4 py-3 text-sm font-semibold shadow-2xl backdrop-blur-xl ${
            notice.tone === "success"
              ? "border-emerald-200 bg-emerald-50/95 text-emerald-800"
              : "border-rose-200 bg-rose-50/95 text-rose-800"
          }`}
        >
          {notice.tone === "success" ? (
            <CheckCircle2 size={16} />
          ) : (
            <CircleAlert size={16} />
          )}
          {notice.message}
        </div>
      ) : null}
    </div>
  );
}

function ScoreRing({ score }: { score: number }) {
  const radius = 47;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative h-28 w-28 shrink-0">
      <svg className="-rotate-90" viewBox="0 0 112 112" aria-hidden="true">
        <circle
          cx="56"
          cy="56"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.09)"
          strokeWidth="8"
        />
        <circle
          cx="56"
          cy="56"
          r={radius}
          fill="none"
          stroke="url(#report-score)"
          strokeLinecap="round"
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
        <defs>
          <linearGradient id="report-score" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="55%" stopColor="#B9AFFF" />
            <stop offset="100%" stopColor="#E8C76A" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-3xl font-semibold tracking-[-0.06em]">{score}</span>
      </div>
    </div>
  );
}

function DimensionBar({
  dimension,
  previous,
}: {
  dimension: ReportDimension;
  previous?: ReportDimension;
}) {
  const delta = previous ? dimension.score - previous.score : null;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-4">
        <div>
          <span className="text-sm font-semibold text-white/82">
            {dimension.label}
          </span>
          <span className="ml-2 text-xs text-white/32">{dimension.note}</span>
        </div>
        <div className="flex items-center gap-2">
          {delta !== null && delta !== 0 ? (
            <span
              className={`text-[10px] font-semibold ${
                delta > 0 ? "text-emerald-300" : "text-rose-300"
              }`}
            >
              {formatSigned(delta)}
            </span>
          ) : null}
          <span className="text-xs font-semibold text-white/60">
            {dimension.score}
          </span>
        </div>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-white via-[#B8AEFF] to-[#8070FF] transition-[width] duration-700"
          style={{ width: `${dimension.score}%` }}
        />
      </div>
    </div>
  );
}

function HeroStat({
  label,
  value,
  warning,
}: {
  label: string;
  value: number;
  warning?: boolean;
}) {
  return (
    <div>
      <p
        className={`text-xl font-semibold tracking-[-0.04em] ${
          warning ? "text-amber-300" : "text-white"
        }`}
      >
        {value}
      </p>
      <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/32">
        {label}
      </p>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  detail,
  icon: Icon,
  compact = false,
}: {
  eyebrow: string;
  title: string;
  detail: string;
  icon: ElementType;
  compact?: boolean;
}) {
  return (
    <div className={compact ? "" : "mb-6"}>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#EFEDFF] text-[#6658E8]">
          <Icon size={18} />
        </div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#7466F5]">
          {eyebrow}
        </p>
      </div>
      <h3 className="mt-4 text-2xl font-semibold tracking-[-0.035em] text-[#0B0D12]">
        {title}
      </h3>
      <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">{detail}</p>
    </div>
  );
}

function ModuleGrid({ metrics }: { metrics: ExecutiveReportMetrics }) {
  const modules = [
    {
      label: "Projects",
      value: metrics.projects.total,
      detail: `${metrics.projects.completed} completed`,
      alert: metrics.projects.overdue,
      icon: FolderKanban,
      href: "/projects",
    },
    {
      label: "KPI",
      value: metrics.kpis.total,
      detail: `${metrics.kpis.completed} completed`,
      alert: metrics.kpis.overdue + metrics.kpis.delayed,
      icon: Target,
      href: "/kpi",
    },
    {
      label: "Social",
      value: metrics.content.total,
      detail: `${metrics.content.posted} published`,
      alert: metrics.content.needsReview,
      icon: Sparkles,
      href: "/social",
    },
    {
      label: "Assets",
      value: metrics.assets.total,
      detail: `${metrics.assets.ready} ready`,
      alert: Math.max(0, metrics.assets.total - metrics.assets.ready),
      icon: FileText,
      href: "/assets",
    },
    {
      label: "Events",
      value: metrics.events.total,
      detail: `${metrics.events.upcoming30} within 30 days`,
      alert: 0,
      icon: CalendarDays,
      href: "/events",
    },
    {
      label: "People",
      value: metrics.people.total,
      detail: `${metrics.people.upcoming30} birthdays soon`,
      alert: 0,
      icon: Users,
      href: "/birthdays",
    },
    {
      label: "Approvals",
      value: metrics.approvals.total,
      detail: `${metrics.approvals.approved} approved`,
      alert: metrics.approvals.overdue,
      icon: ShieldCheck,
      href: "/approvals",
    },
    {
      label: "Intelligence",
      value: metrics.intelligence.total,
      detail: `${metrics.intelligence.recent} recent signals`,
      alert: metrics.intelligence.highRelevance,
      icon: Newspaper,
      href: "/news",
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {modules.map((module) => {
        const Icon = module.icon;
        return (
          <Link
            key={module.label}
            href={module.href}
            className="group rounded-[1.55rem] border border-slate-950/[0.07] bg-white/64 p-4 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_18px_48px_rgba(15,23,42,0.07)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950/[0.045] text-slate-600 transition group-hover:bg-[#EFEDFF] group-hover:text-[#6658E8]">
                <Icon size={17} />
              </div>
              <ArrowRight
                size={15}
                className="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-[#7466F5]"
              />
            </div>
            <div className="mt-5 flex items-end justify-between gap-3">
              <div>
                <p className="text-3xl font-semibold tracking-[-0.055em] text-[#0B0D12]">
                  {module.value}
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-600">
                  {module.label}
                </p>
              </div>
              <div className="text-right">
                {module.alert > 0 ? (
                  <p className="text-xs font-semibold text-rose-600">
                    {module.alert} watch
                  </p>
                ) : null}
                <p className="mt-1 text-[11px] text-slate-400">{module.detail}</p>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

function MovementIcon({ value }: { value: number }) {
  if (value > 0) {
    return (
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400/12 text-emerald-300">
        <TrendingUp size={21} />
      </div>
    );
  }
  if (value < 0) {
    return (
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-400/12 text-rose-300">
        <TrendingDown size={21} />
      </div>
    );
  }
  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-white/60">
      <Activity size={21} />
    </div>
  );
}

function ComparisonRows({
  live,
  snapshot,
}: {
  live: ExecutiveReportMetrics;
  snapshot: ExecutiveReportMetrics;
}) {
  const rows = [
    {
      label: "Tracked records",
      current: live.totals.records,
      previous: snapshot.totals.records,
    },
    {
      label: "Attention signals",
      current: live.totals.needsAttention,
      previous: snapshot.totals.needsAttention,
      inverse: true,
    },
    {
      label: "Completed KPIs",
      current: live.kpis.completed,
      previous: snapshot.kpis.completed,
    },
    {
      label: "Ready assets",
      current: live.assets.ready,
      previous: snapshot.assets.ready,
    },
  ];

  return (
    <div className="space-y-2">
      {rows.map((row) => {
        const delta = row.current - row.previous;
        const positive = row.inverse ? delta < 0 : delta > 0;
        return (
          <div
            key={row.label}
            className="flex items-center justify-between rounded-[1.25rem] border border-slate-950/[0.07] bg-white/60 px-4 py-3.5"
          >
            <div>
              <p className="text-sm font-semibold text-slate-700">{row.label}</p>
              <p className="mt-1 text-xs text-slate-400">
                was {row.previous}, now {row.current}
              </p>
            </div>
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                delta === 0
                  ? "bg-slate-100 text-slate-500"
                  : positive
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-rose-50 text-rose-700"
              }`}
            >
              {formatSigned(delta)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function RecommendationRow({
  item,
  index,
}: {
  item: ReportRecommendation;
  index: number;
}) {
  return (
    <Link
      href={item.href}
      className="group flex gap-4 rounded-[1.55rem] border border-slate-950/[0.07] bg-white/64 p-4 transition hover:bg-white hover:shadow-[0_16px_45px_rgba(15,23,42,0.06)]"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#0B0D12] text-sm font-semibold text-white">
        {String(index + 1).padStart(2, "0")}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${priorityStyles[item.priority]}`}
          >
            {item.priority}
          </span>
          <span className="text-xs font-medium text-slate-400">{item.module}</span>
        </div>
        <p className="mt-3 text-sm font-semibold text-[#0B0D12]">{item.title}</p>
        <p className="mt-1 text-xs leading-5 text-slate-500">{item.detail}</p>
      </div>
      <ArrowRight
        size={16}
        className="mt-1 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-[#7466F5]"
      />
    </Link>
  );
}

function EvidenceRow({ item }: { item: ReportEvidence }) {
  return (
    <Link
      href={item.href}
      className="group flex items-center gap-3 rounded-[1.35rem] border border-slate-950/[0.07] bg-white/60 p-3.5 transition hover:bg-white"
    >
      <span
        className={`h-2.5 w-2.5 shrink-0 rounded-full ${severityStyles[item.severity]}`}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400">
            {item.module}
          </span>
          <span className="text-[10px] text-slate-300">·</span>
          <span className="truncate text-[10px] font-medium text-slate-400">
            {item.status}
          </span>
        </div>
        <p className="mt-1 truncate text-sm font-semibold text-[#0B0D12]">
          {item.title}
        </p>
        <p className="mt-1 truncate text-xs text-slate-400">{item.detail}</p>
      </div>
      <ArrowRight
        size={15}
        className="shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-[#7466F5]"
      />
    </Link>
  );
}

function ReportLoading() {
  return (
    <div className="space-y-5">
      <div className="relative min-h-[31rem] overflow-hidden rounded-[2.6rem] bg-[#090A0F]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(130,112,255,0.24),transparent_30%)]" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
          <div className="relative flex h-24 w-24 items-center justify-center">
            <div className="absolute inset-0 animate-ping rounded-full border border-[#A99EFF]/25" />
            <div className="absolute inset-3 animate-pulse rounded-full border border-white/15" />
            <BarChart3 size={25} className="text-white" />
          </div>
          <p className="mt-7 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/42">
            Reading the command
          </p>
          <p className="mt-3 text-lg font-semibold">
            Building a defensible picture…
          </p>
        </div>
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        {[0, 1].map((item) => (
          <div
            key={item}
            className="h-80 animate-pulse rounded-[2.2rem] border border-slate-950/[0.06] bg-white/55"
          />
        ))}
      </div>
    </div>
  );
}
