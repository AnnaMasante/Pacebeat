import { Toast } from "@/app/components/ui/Toast";

interface AdjustedDurationNoticeProps {
  wasDurationAdjusted: boolean;
  achievedDurationMs: number;
  narrowRangeWarning: boolean;
  excludedTrackCount: number;
}

function formatMinutes(ms: number): string {
  return `${Math.round(ms / 60_000)} min`;
}

export function AdjustedDurationNotice({
  wasDurationAdjusted,
  achievedDurationMs,
  narrowRangeWarning,
  excludedTrackCount,
}: AdjustedDurationNoticeProps) {
  const notices: string[] = [];

  if (wasDurationAdjusted) {
    notices.push(
      `Ta bibliothèque ne permet pas d'atteindre la durée demandée : playlist ajustée à ${formatMinutes(achievedDurationMs)}.`,
    );
  }
  if (narrowRangeWarning) {
    notices.push("Tes morceaux ont des tempos proches : la progression d'intensité sera subtile.");
  }
  if (excludedTrackCount > 0) {
    notices.push(
      `${excludedTrackCount} morceau${excludedTrackCount > 1 ? "x" : ""} exclu${excludedTrackCount > 1 ? "s" : ""} (tempo introuvable).`,
    );
  }

  if (notices.length === 0) return null;

  return (
    <div className="flex flex-col gap-xs">
      {notices.map((notice) => (
        <Toast key={notice} variant="info">
          {notice}
        </Toast>
      ))}
    </div>
  );
}
