"use client";

import { useEffect, useRef } from "react";
import { touchLesson } from "@/services/courses/courses.actions";

interface LessonTrackerProps {
  lessonId: string;
}

/**
 * Marks the lesson as opened (IN_PROGRESS + the course's return point) on
 * mount. The writes never happen during the server render: they fire here,
 * once per lesson.
 */
export function LessonTracker({ lessonId }: LessonTrackerProps) {
  const trackedRef = useRef<string | null>(null);

  useEffect(() => {
    if (trackedRef.current === lessonId) return;
    trackedRef.current = lessonId;
    void touchLesson(lessonId);
  }, [lessonId]);

  return null;
}
