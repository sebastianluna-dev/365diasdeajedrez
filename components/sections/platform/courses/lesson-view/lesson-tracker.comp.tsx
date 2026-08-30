"use client";

import { useEffect, useRef } from "react";
import { touchLesson } from "@/services/courses/courses.actions";

interface LessonTrackerProps {
  lessonId: string;
}

/**
 * Marca la lección como abierta (IN_PROGRESS + punto de retorno del curso) al
 * montarse. Las escrituras nunca ocurren durante el render del servidor: se
 * disparan aquí, una sola vez por lección.
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
