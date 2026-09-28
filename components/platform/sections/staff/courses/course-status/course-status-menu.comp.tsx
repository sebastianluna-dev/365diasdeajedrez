"use client";

import { useTransition } from "react";
import { PlatformSelect } from "@/components/platform/shared/platform-select/platform-select.comp";
import { COURSE_STATUS, type CourseStatusCode } from "@/constants/platform/course-codes.const";
import { archiveCourse, publishCourse } from "@/services/staff-courses/staff-courses.actions";
import type { CatalogOption } from "@/services/staff-courses/staff-courses.types";
import "./course-status-menu.comp.css";

interface CourseStatusMenuProps {
  courseId: string;
  /** The status the course has. */
  statusCode: CourseStatusCode;
  /** The statuses a course can have, in catalog order. */
  statuses: CatalogOption[];
  /** It meets the minimum to be published: a chapter with a lesson that has content. */
  canPublish: boolean;
}

/**
 * The course's status next to its title, as a pill that is also the way to
 * change it: a dot, the status and a caret, in the colour of the status.
 *
 * It offers what the server does. A course is published (when it has the
 * minimum content) and archived; nothing takes it back to draft, so «Borrador»
 * can only be read, not chosen. The pill shows what the course HAS, not what
 * was picked: if the action refuses, it stays where it was and the page says why.
 */
export function CourseStatusMenu({ courseId, statusCode, statuses, canPublish }: CourseStatusMenuProps) {
  const [isChanging, startChange] = useTransition();

  const canChoose = (code: string): boolean => {
    if (code === statusCode) return true;
    if (code === COURSE_STATUS.PUBLISHED) return canPublish;
    return code === COURSE_STATUS.ARCHIVED;
  };

  const change = (code: string) => {
    if (code === statusCode) return;
    startChange(async () => {
      if (code === COURSE_STATUS.PUBLISHED) await publishCourse(courseId);
      else if (code === COURSE_STATUS.ARCHIVED) await archiveCourse(courseId);
    });
  };

  return (
    <div className="course-status-menu">
      <PlatformSelect
        className={`course-status-menu__pill course-status-menu__pill_state_${statusCode.toLowerCase()}`}
        value={statusCode}
        onValueChange={change}
        options={statuses.map((status) => ({
          value: status.code,
          label: status.label,
          disabled: !canChoose(status.code),
        }))}
        disabled={isChanging}
        aria-label="Estado de publicación del curso"
      />
    </div>
  );
}
