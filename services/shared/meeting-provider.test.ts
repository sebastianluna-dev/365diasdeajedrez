import { describe, expect, it } from "vitest";
import { MEETING_PROVIDER } from "@/constants/platform/class-codes.const";
import { storedMeetingProvider } from "./meeting-provider";

describe("storedMeetingProvider", () => {
  it("reconoce Zoom y Meet por el enlace, con subdominios y sin ruta", () => {
    expect(storedMeetingProvider("https://zoom.us/j/11111111111")).toBe(MEETING_PROVIDER.ZOOM);
    expect(storedMeetingProvider("https://us02web.zoom.us/j/1?pwd=x")).toBe(MEETING_PROVIDER.ZOOM);
    expect(storedMeetingProvider("https://ZOOM.US")).toBe(MEETING_PROVIDER.ZOOM);
    expect(storedMeetingProvider("https://meet.google.com/abc-defg-hij")).toBe(MEETING_PROVIDER.MEET);
  });

  it("cualquier otro enlace es «otro», y sin enlace no hay plataforma", () => {
    expect(storedMeetingProvider("https://teams.microsoft.com/l/meetup")).toBe(MEETING_PROVIDER.OTHER);
    expect(storedMeetingProvider("https://notzoom.us/j/1")).toBe(MEETING_PROVIDER.OTHER);
    expect(storedMeetingProvider("https://zoom.us.evil.com/")).toBe(MEETING_PROVIDER.OTHER);
    expect(storedMeetingProvider(null)).toBeNull();
    expect(storedMeetingProvider("   ")).toBeNull();
    expect(storedMeetingProvider(undefined)).toBeNull();
  });
});
