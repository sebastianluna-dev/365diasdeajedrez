import { ClassPageEditor } from "@/components/platform/sections/teacher/classes/class-page-editor/class-page-editor.comp";
import { EDITOR_SAMPLE_OPTIONS } from "@/components/platform/sections/teacher/classes/class-page-editor/class-page-editor.sample";
import type { ClassTemplate } from "./class-templates.sample";

interface ClassTemplateSectionProps {
  template: ClassTemplate;
}

/**
 * One ready-made class (2026-10-19, front-only): its content in the class
 * editor, to read it as the student would or to try changes on it. The page's
 * head says its title; the editor says that nothing is stored.
 */
export function ClassTemplateSection({ template }: ClassTemplateSectionProps) {
  return <ClassPageEditor blocks={template.blocks} options={EDITOR_SAMPLE_OPTIONS} defaultMode="student" />;
}
