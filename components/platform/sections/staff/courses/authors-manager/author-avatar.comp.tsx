import Image from "next/image";
import { isDisplayableImage } from "@/lib/remote-image";
import { authorInitials, authorTone } from "@/services/staff-courses/author-rules";
import "./author-avatar.comp.css";

interface AuthorAvatarProps {
  /** The author's name: the initials and the tone of the tile come from it. */
  name: string;
  /** URL of the photo; without one, or with one that cannot be drawn, the initials. */
  photo?: string;
  size?: "small" | "medium" | "large";
  /** A rounded tile in the lists; a circle next to a course's author. */
  shape?: "tile" | "circle";
}

const PIXELS = { small: 36, medium: 46, large: 56 } as const;

/**
 * An author's face: their photo, or their initials on a tile when they have
 * none. Decorative: the name is always written next to it, so it is hidden
 * from the accessibility tree instead of being read twice.
 */
export function AuthorAvatar({ name, photo, size = "medium", shape = "tile" }: AuthorAvatarProps) {
  const hasPhoto = isDisplayableImage(photo);
  const className = [
    "author-avatar",
    `author-avatar_size_${size}`,
    `author-avatar_shape_${shape}`,
    hasPhoto ? "author-avatar_kind_photo" : `author-avatar_tone_${authorTone(name)}`,
  ].join(" ");

  return (
    <span className={className} aria-hidden="true">
      {hasPhoto ? (
        <Image src={photo} alt="" fill sizes={`${PIXELS[size]}px`} className="author-avatar__image" />
      ) : (
        authorInitials(name)
      )}
    </span>
  );
}
