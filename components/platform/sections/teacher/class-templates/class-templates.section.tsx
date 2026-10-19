import Link from "next/link";
import { StaticDiagram } from "@/components/chess/static-diagram.comp";
import { PlatformNotice } from "@/components/platform/shared/platform-notice/platform-notice.comp";
import { teacherRoutes } from "@/lib/platform-routes";
import type { ClassTemplate } from "./class-templates.sample";
import "./class-templates.section.css";

interface ClassTemplatesSectionProps {
  templates: ClassTemplate[];
}

/**
 * «Clases prediseñadas» (2026-10-19, front-only): the academy's ready-made
 * classes, each a card with its board, its course and level, what it teaches
 * and how long it takes, opening on its content in the class editor. Nothing
 * is stored yet: the page says so.
 */
export function ClassTemplatesSection({ templates }: ClassTemplatesSectionProps) {
  return (
    <div className="class-templates">
      <PlatformNotice
        variant="info"
        message="Vista previa: estas clases son de ejemplo. Todavía no se guardan ni se pueden usar en una clase."
      />
      <ul className="class-templates__grid">
        {templates.map((template) => (
          <li key={template.slug}>
            <Link href={teacherRoutes.classTemplate(template.slug)} className="class-templates__card">
              <div className="class-templates__board">
                <StaticDiagram fen={template.preview.fen} orientation={template.preview.orientation} />
              </div>
              <div className="class-templates__text">
                <span className="class-templates__eyebrow">
                  {template.course} · {template.level}
                </span>
                <strong className="class-templates__title">{template.title}</strong>
                <span className="class-templates__summary">{template.summary}</span>
                <span className="class-templates__meta">
                  {template.durationMin} min · {template.blocks.length} bloques
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
