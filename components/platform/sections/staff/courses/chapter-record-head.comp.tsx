import type { ChapterAdminDetail } from "@/services/staff-courses/staff-courses.types";
import { StaffEditorHead } from "./staff-editor.comp";
import { StaffTabs } from "@/components/platform/shared/staff-tabs/staff-tabs.comp";
import { chapterTabs } from "@/components/platform/shared/staff-tabs/staff-tabs.const";

interface ChapterRecordHeadProps {
  chapter: ChapterAdminDetail;
  /** How many games its collection has; the «Partidas» tab says it. */
  gameCount: number;
}

/**
 * How a chapter names itself on its three pages: its name, where it sits and
 * the tabs. Drawn by the record's LAYOUT, like the course's, for the same two
 * reasons: the three pages cannot drift apart, and the header does not blink
 * when one moves between them.
 */
export function ChapterRecordHead({ chapter, gameCount }: ChapterRecordHeadProps) {
  return (
    <>
      <StaffEditorHead
        title={chapter.name}
        meta={
          <>
            <span>Capítulo {chapter.order}</span>
            <span>{chapter.courseName}</span>
            {chapter.isPriority && <span className="platform-tag platform-tag_variant_accent">Prioridad</span>}
          </>
        }
      />

      <StaffTabs
        tabs={chapterTabs({
          courseId: chapter.courseId,
          chapterId: chapter.id,
          lessonCount: chapter.lessons.length,
          gameCount,
        })}
      />
    </>
  );
}
