import type { Metadata } from "next";
import { CoursesListSection } from "@/components/sections/platform/courses/courses-list/courses-list.section";
import { StudyGoalAside } from "@/components/sections/platform/courses/courses-list/study-goal.comp";
import { getUserCourses } from "@/services/courses/courses.service";
import { getStudyGoal } from "@/services/study-goal/study-goal.service";
import "./courses-page.css";

export const metadata: Metadata = {
  title: "Mis cursos",
};

export default async function CoursesPage() {
  // Border of the private area: both go through getCurrentUser, so this first
  // await acts as the session check as well as fetching the data.
  const [courses, goal] = await Promise.all([getUserCourses(), getStudyGoal()]);

  // The summary comes out of the same list: no second query is needed to count
  // what is already in memory.
  const doneLessons = courses.reduce((total, course) => total + course.progress.completedLessons, 0);

  return (
    <div className="platform-page courses-page">
      <header className="courses-page__head">
        <div className="platform-page__head">
          <h1 className="platform-page__title">Mis cursos</h1>
          <p className="platform-page__subtitle">Tu camino de estudio, curso a curso.</p>
        </div>

        {courses.length > 0 && (
          <dl className="courses-page__stats">
            <div className="courses-page__stat">
              <dd className="courses-page__stat-value">{courses.length}</dd>
              <dt className="courses-page__stat-label">{courses.length === 1 ? "Curso" : "Cursos"}</dt>
            </div>

            <span className="courses-page__stat-divider" aria-hidden="true" />

            <div className="courses-page__stat">
              <dd className="courses-page__stat-value courses-page__stat-value_tone_accent">{doneLessons}</dd>
              <dt className="courses-page__stat-label">{doneLessons === 1 ? "Lección hecha" : "Lecciones hechas"}</dt>
            </div>
          </dl>
        )}
      </header>

      <div className="courses-page__layout">
        <CoursesListSection courses={courses} />
        <StudyGoalAside goal={goal} />
      </div>
    </div>
  );
}
