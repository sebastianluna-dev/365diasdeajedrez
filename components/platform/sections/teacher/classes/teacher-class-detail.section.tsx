import Link from "next/link";
import { WhatsappIcon } from "@/components/icons/whatsapp-icon.comp";
import { AttendanceRow } from "@/components/platform/shared/attendance-row/attendance-row.comp";
import { MeetingJoinCard } from "@/components/platform/shared/meeting-join-card/meeting-join-card.comp";
import { PlatformNotice } from "@/components/platform/shared/platform-notice/platform-notice.comp";
import { formatClassHours } from "@/lib/format-class-when";
import {
  addClassBlock,
  deleteClassBlock,
  fetchReferencePgn,
  reorderClassBlocks,
  updateClassAfterNotes,
  updateClassBlock,
} from "@/services/teacher-classes/teacher-classes.actions";
import type {
  PickableExercise,
  ReferenceableGameGroup,
  TeacherClassDetail,
} from "@/services/teacher-classes/teacher-classes.types";
import { AfterNotesButton } from "./after-notes-popup/after-notes-popup.comp";
import { ClassBlockList } from "./class-block-list/class-block-list.comp";
import "./teacher-class-detail.section.css";

interface TeacherClassDetailSectionProps {
  classDetail: TeacherClassDetail;
  games: ReferenceableGameGroup[];
  /** What an exercise block may hold (D29): the teacher's usable exercises and the library's. */
  exercises: PickableExercise[];
  /** A game chosen elsewhere («Usar en una clase»): the block popup opens on it. */
  initialGameId?: string;
  notice?: string;
  errorMessage?: string;
}

/**
 * The teacher's record of a class (PROF-2): the material to prepare, by
 * section, as the student sees it; and the lane with the meeting, the
 * students and their marks (with the staff's changes), what was written
 * after the class, and the staff's facts. A Server Component: it imports
 * the actions and hands them to the client pieces as props.
 */
export function TeacherClassDetailSection({
  classDetail,
  games,
  exercises,
  initialGameId,
  notice,
  errorMessage,
}: TeacherClassDetailSectionProps) {
  const { timeZone, editable, students, afterNotes, join } = classDetail;
  const endHour = formatClassHours(new Date(classDetail.endIso), 0, timeZone).split("–")[0] ?? "";
  const studentLabel = classDetail.isGroup ? "tus alumnos" : (students[0]?.displayName ?? "el alumno");
  const seated = students.filter((student) => !student.mark.moved);
  const moved = students.filter((student) => student.mark.moved);

  return (
    <div className="teacher-class">
      <div className="teacher-class__main">
        {errorMessage && <PlatformNotice message={errorMessage} />}
        {notice && <PlatformNotice message={notice} variant="success" />}
        {classDetail.cancellation && (
          <PlatformNotice
            variant="info"
            message={`Administración canceló esta clase${classDetail.cancellation.reason ? `: «${classDetail.cancellation.reason}»` : "."}${classDetail.cancellation.note ? ` Mensaje a los alumnos: «${classDetail.cancellation.note}»` : ""}`}
          />
        )}
        {classDetail.timeZoneMissing && (
          <PlatformNotice
            variant="info"
            message="Las horas se muestran en la hora de Ciudad de México. Elige tu zona en «Mi ficha»."
          />
        )}
        <section className="platform-card">
          <ClassBlockList
            classId={classDetail.id}
            blocks={classDetail.blocks}
            views={classDetail.views}
            phase={classDetail.phase}
            editable={editable.content}
            studentLabel={studentLabel.charAt(0).toUpperCase() + studentLabel.slice(1)}
            groupSize={seated.length}
            endHour={endHour}
            options={{ games, exercises }}
            initialGameId={initialGameId}
            actions={{ addClassBlock, updateClassBlock, deleteClassBlock, reorderClassBlocks, fetchReferencePgn }}
          />
        </section>
      </div>

      <aside className="teacher-class__lane" aria-label="La clase">
        <section className="teacher-class__fact">
          <h2 className="teacher-class__fact-label">Reunión</h2>
          <MeetingJoinCard {...join} audience="teacher" density="compact" />
          {classDetail.meetingVisibleLine && (
            <p className="teacher-class__fact-line">{classDetail.meetingVisibleLine}</p>
          )}
        </section>

        <section className="teacher-class__fact">
          <h2 className="teacher-class__fact-label">{classDetail.isGroup ? "Alumnos" : "Alumno"}</h2>
          <div className="teacher-class__students">
            {[...seated, ...moved].map((student) => (
              <div key={student.userId} className="teacher-class__student">
                <AttendanceRow
                  student={{ id: student.userId, displayName: student.displayName }}
                  details={student.isAssigned ? [] : ["No es tu alumno: ves su nombre, no su ficha"]}
                  mark={student.mark}
                  mode="read"
                />
                {student.href && (
                  <Link href={student.href} className="teacher-class__student-link">
                    Ver su ficha
                  </Link>
                )}
              </div>
            ))}
            {students.length === 0 && <p className="teacher-class__fact-line">Sin alumnos todavía.</p>}
          </div>
        </section>

        <section className="teacher-class__fact">
          <div className="teacher-class__fact-head">
            <h2 className="teacher-class__fact-label">Después de la clase</h2>
            {editable.afterNotes && (
              <AfterNotesButton
                classId={classDetail.id}
                summary={afterNotes.summary}
                recordingUrl={afterNotes.recordingUrl}
                updateClassAfterNotes={updateClassAfterNotes}
              />
            )}
          </div>
          {afterNotes.closedAtLabel ? (
            <>
              <p className="teacher-class__fact-line">
                Finalizada {afterNotes.closedByName ? `por ${afterNotes.closedByName} ` : ""}el{" "}
                {afterNotes.closedAtLabel.replace(", ", " a las ")}
              </p>
              <dl className="teacher-class__after">
                <div>
                  <dt>Resumen</dt>
                  <dd>{afterNotes.summary ?? "Sin resumen"}</dd>
                </div>
                <div>
                  <dt>Grabación</dt>
                  <dd>
                    {afterNotes.recordingUrl ? (
                      <a href={afterNotes.recordingUrl} target="_blank" rel="noreferrer">
                        {afterNotes.recordingUrl.replace(/^https?:\/\//, "")}
                      </a>
                    ) : (
                      "Sin grabación"
                    )}
                  </dd>
                </div>
              </dl>
            </>
          ) : (
            <p className="teacher-class__fact-line">Al finalizar la clase dejarás aquí el resumen y la grabación.</p>
          )}
        </section>

        <section className="teacher-class__fact">
          <h2 className="teacher-class__fact-label">Datos de administración</h2>
          <p className="teacher-class__fact-line">{classDetail.adminLine}</p>
          <p className="teacher-class__fact-line">
            ¿Hay que cambiar la hora o el alumno?{" "}
            <a href={classDetail.whatsappHref} target="_blank" rel="noreferrer" className="teacher-class__whatsapp">
              <WhatsappIcon className="teacher-class__whatsapp-icon" />
              Escribe a administración
            </a>
            .
          </p>
        </section>
      </aside>
    </div>
  );
}
