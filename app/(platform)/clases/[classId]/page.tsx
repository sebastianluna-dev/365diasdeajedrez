import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ClassAheadSection } from "@/components/platform/sections/classes/class-detail/class-ahead.section";
import { ClassReviewSection } from "@/components/platform/sections/classes/class-detail/class-review.section";
import { ClassJoinBar } from "@/components/platform/shared/class-join-bar/class-join-bar.comp";
import { meetingJoinState } from "@/components/platform/shared/meeting-join-card/meeting-join-card.comp";
import { readNotice } from "@/constants/platform/class-messages.const";
import { studentErrorMessage } from "@/constants/platform/student-messages.const";
import { platformRoutes } from "@/lib/platform-routes";
import { saveClassGameToStudy } from "@/services/classes/classes.actions";
import { getClassById } from "@/services/classes/classes.service";
import { getOwnStudyOptions } from "@/services/studies/studies.service";
import "./class-page.css";

interface ClassPageProps {
  params: Promise<{ classId: string }>;
  searchParams: Promise<{ aviso?: string; error?: string }>;
}

export async function generateMetadata({ params }: ClassPageProps): Promise<Metadata> {
  const { classId } = await params;
  const classDetail = await getClassById(classId);
  return classDetail ? { title: classDetail.title } : {};
}

/**
 * The student's class page: ahead of time, how to join and what to prepare
 * (ALU-2); once the link closes, the review (ALU-3). With the link open,
 * the bar to enter is a sibling of the page (D20).
 */
export default async function ClassPage({ params, searchParams }: ClassPageProps) {
  const { classId } = await params;
  const [classDetail, { aviso, error }] = await Promise.all([getClassById(classId), searchParams]);
  if (!classDetail) notFound();

  const joinOpen = ["open", "live", "tail"].includes(meetingJoinState(classDetail.join));
  const errorMessage = studentErrorMessage(error);
  const notice = readNotice(aviso);

  if (classDetail.view === "ahead") {
    return (
      <>
        <div
          className={`platform-page platform-page_width_wide class-page${joinOpen ? " platform-page_foot_join-bar" : ""}`}
        >
          <ClassAheadSection classDetail={classDetail} errorMessage={errorMessage} />
        </div>
        {joinOpen && <ClassJoinBar {...classDetail.join} audience="student" />}
      </>
    );
  }

  const studies = await getOwnStudyOptions();
  const saved =
    notice?.code === "gameSaved" && notice.args[0] && notice.args[1]
      ? {
          text: `Partida guardada en «${studies.find((study) => study.id === notice.args[0])?.name ?? "tu estudio"}».`,
          link: { href: platformRoutes.gameDetail(notice.args[0], notice.args[1]), label: "Ver la copia" },
        }
      : null;

  return (
    <div className="platform-page platform-page_width_wide class-page">
      <ClassReviewSection
        classDetail={classDetail}
        saveGame={{ studies, action: saveClassGameToStudy }}
        notice={saved?.text ?? notice?.text ?? undefined}
        noticeLink={saved?.link}
        errorMessage={errorMessage}
      />
    </div>
  );
}
