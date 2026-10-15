// A student's attendance mark, as data: the services map a seat to it and
// the rows draw it, the same words for the staff and for the teacher.

export interface AttendanceStudent {
  id: string;
  displayName: string;
}

export interface AttendanceMarkView {
  /** Null is «Sin pasar lista». */
  attended: boolean | null;
  /** The first mark: «Marcó GM Profesor Demo · mié 14 oct, 20:12». */
  markedLine?: string;
  /** The staff's change after a report: «Cambió Staff Demo · jue 15 oct, 10:05 · «Faltó» → «Asistió»: «motivo»». */
  changedLine?: string;
  /** The teacher may no longer change it: the staff did (D3). */
  locked?: boolean;
  /** The seat was given another date: «Faltó · reprogramada al vie 16 oct», with a link to the new class. */
  moved?: { label: string; href?: string };
  /** This seat is where a moved one went: «Reposición de su clase del mié 14 oct». */
  replacesLabel?: string;
}
