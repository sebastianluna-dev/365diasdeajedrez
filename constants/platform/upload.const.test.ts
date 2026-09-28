import { describe, expect, it } from "vitest";
import {
  IMAGE_ACCEPT,
  IMAGE_ALLOWED_FORMATS,
  IMAGE_LIMITS_TEXT,
  IMAGE_MAX_BYTES,
  IMAGE_MAX_MB,
  IMAGE_MIME_TYPES,
  isAllowedImageType,
} from "./upload.const";

describe("the limits of an uploaded image", () => {
  it("caps a file at 1 MB", () => {
    expect(IMAGE_MAX_BYTES).toBe(1024 * 1024);
    expect(IMAGE_MAX_MB).toBe(1);
  });

  it("says the same figure it checks, so the tip cannot drift from the error", () => {
    expect(IMAGE_LIMITS_TEXT).toContain(`${IMAGE_MAX_MB} MB`);
  });

  it("names in its text the same four formats it admits", () => {
    for (const format of IMAGE_ALLOWED_FORMATS.split(",")) {
      expect(IMAGE_LIMITS_TEXT.toLowerCase(), format).toContain(format);
    }
    expect(IMAGE_MIME_TYPES).toHaveLength(IMAGE_ALLOWED_FORMATS.split(",").length);
  });

  it("admits those four and nothing else, the file picker included", () => {
    expect(isAllowedImageType("image/png")).toBe(true);
    expect(isAllowedImageType("image/avif")).toBe(true);
    // A GIF animates and a SVG carries scripts: neither is a cover.
    expect(isAllowedImageType("image/gif")).toBe(false);
    expect(isAllowedImageType("image/svg+xml")).toBe(false);
    expect(IMAGE_ACCEPT).toBe(IMAGE_MIME_TYPES.join(","));
  });
});
