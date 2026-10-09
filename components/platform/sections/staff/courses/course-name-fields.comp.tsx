"use client";

import { useRef } from "react";
import { PlatformFormField } from "@/components/platform/shared/platform-form/platform-form.comp";
import { slugAfterRename } from "@/lib/generate-slug";
import "./course-name-fields.comp.css";

/** What `updateCourse` accepts as a slug: lowercase words joined by single hyphens. */
const SLUG_PATTERN = "[a-z0-9]+(-[a-z0-9]+)*";

const SLUG_INFO = "Se actualiza al cambiar el nombre; puedes ajustarlo después. Minúsculas, números y guiones.";

/** What a slug may hold: the input's `title`, and what the field says when the pattern rejects it. */
const SLUG_FORMAT = "Minúsculas, números y guiones";

interface CourseNameFieldsProps {
  /** The course's saved name and slug: what the fields open with. */
  name: string;
  slug: string;
}

/**
 * The name and the slug of the course editor's metadata form, which is where
 * they submit: this piece renders the two fields and nothing else, so it has
 * to be mounted inside a `PlatformForm`.
 *
 * The slug follows the name. When the name loses focus having changed, the
 * slug is rewritten from it, whatever it was; leaving the name as it was
 * touches nothing, so tabbing through the field does not undo a slug typed by
 * hand. The slug can still be edited afterwards, until the next rename.
 *
 * What the slug is and how it behaves is said by the "i" inside its input and
 * not by a hint under it (`PlatformFormField`'s `info`).
 *
 * Uncontrolled, like the rest of the form: the only thing kept is the name
 * the field had when it took focus, to know whether it changed.
 */
export function CourseNameFields({ name, slug }: CourseNameFieldsProps) {
  const slugRef = useRef<HTMLInputElement>(null);
  const nameAtFocus = useRef(name);

  return (
    <div className="course-name-fields">
      <PlatformFormField name="name" label="Nombre">
        <input
          type="text"
          defaultValue={name}
          maxLength={160}
          required
          onFocus={(event) => {
            nameAtFocus.current = event.target.value;
          }}
          onBlur={(event) => {
            const field = slugRef.current;
            if (field) field.value = slugAfterRename(nameAtFocus.current, event.target.value, field.value);
          }}
        />
      </PlatformFormField>

      <PlatformFormField name="slug" label="Slug" info={SLUG_INFO} messages={{ patternMismatch: `${SLUG_FORMAT}.` }}>
        <input
          ref={slugRef}
          type="text"
          defaultValue={slug}
          maxLength={160}
          pattern={SLUG_PATTERN}
          title={SLUG_FORMAT}
          required
        />
      </PlatformFormField>
    </div>
  );
}
