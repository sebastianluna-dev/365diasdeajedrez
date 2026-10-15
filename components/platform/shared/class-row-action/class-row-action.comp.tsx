"use client";

import Link from "next/link";
import { MeetingLinkButton } from "@/components/platform/shared/meeting-link-popup/meeting-link-popup.comp";
import type { ClassRowActionData, ClassRowData, ClassRowServerActions } from "../class-row/class-row.types";

interface ClassRowActionProps {
  action: Exclude<ClassRowActionData, { kind: "link" }>;
  row: Pick<ClassRowData, "href" | "title" | "timeZone" | "nowIso">;
  serverActions?: ClassRowServerActions;
}

/**
 * The action of a `ClassRow` that opens a popup instead of leading
 * somewhere: the meeting link (the staff's agenda). The only client leaf of
 * a row, so the row and the agenda stay on the server. Without the server
 * action the row leads to the class instead, where the same popup is.
 */
export function ClassRowAction({ action, row, serverActions }: ClassRowActionProps) {
  if (action.kind === "meeting" && serverActions?.setMeeting) {
    return (
      <MeetingLinkButton
        label={action.label}
        classId={action.classId}
        classTitle={row.title}
        current={action.current}
        timeZone={row.timeZone}
        nowIso={row.nowIso}
        setMeeting={serverActions.setMeeting}
      />
    );
  }
  return (
    <Link href={row.href} className="platform-row-action">
      {action.label}
    </Link>
  );
}
