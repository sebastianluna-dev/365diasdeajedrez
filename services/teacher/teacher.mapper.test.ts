import { describe, expect, it } from "vitest";
import { CLASS_STATUS } from "@/constants/platform/class-codes.const";
import { formatSpanishDate } from "@/lib/format-spanish-date";
import { formatSpanishTime } from "@/lib/format-spanish-time";
import { mapTeacherClassBrief, type TeacherClassBriefRow } from "./teacher.mapper";

describe("mapTeacherClassBrief", () => {
  it("resume la clase con su fecha, hora, estado, inscritos y enlace al panel", () => {
    const when = new Date(Date.UTC(2026, 8, 22, 17));
    const row = {
      id: "c1",
      title: "Aperturas",
      scheduledAt: when,
      durationMin: 90,
      status: { code: CLASS_STATUS.COMPLETED, label: "Terminada" },
      _count: { participants: 4 },
    } as unknown as TeacherClassBriefRow;

    expect(mapTeacherClassBrief(row)).toEqual({
      id: "c1",
      title: "Aperturas",
      scheduledAtIso: when.toISOString(),
      dateLabel: formatSpanishDate(when),
      timeLabel: formatSpanishTime(when),
      durationMin: 90,
      statusCode: CLASS_STATUS.COMPLETED,
      statusLabel: "Terminada",
      participantCount: 4,
      href: "/profesor/clases/c1",
    });
  });
});
