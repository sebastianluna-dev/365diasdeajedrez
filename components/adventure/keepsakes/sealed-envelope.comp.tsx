// Original artwork drawn for this project (the version-2 mockup of proposal B, «El
// cuaderno del viajero»), exported by scripts/adventure-art.ts: edit the mockup
// and run `npm run adventure:art` again instead of editing this file by hand.

/** The sealed envelope of a keepsake still to win: it draws inside the box `-30 -22 60 44`. */
export const SEALED_ENVELOPE_VIEW_BOX = "-30 -22 60 44";

export function SealedEnvelope() {
  return (
    <>
      <rect x="-26" y="-18" width="52" height="36" fill="rgba(42,28,14,.25)" transform="translate(1.2 2)" />
      <rect x="-26" y="-18" width="52" height="36" fill="#f1e2bd" />
      <path
        d="M-26 -18L0 4L26 -18"
        fill="none"
        stroke="#a47c4f"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="0" cy="2" r="6.6" fill="#a83a2a" />
      <path
        d="M0 -3.4L0.9 -1.2L3.2 -1.1L1.4 0.5L2 2.8L0 1.5L-2 2.8L-1.4 0.5L-3.2 -1.1L-0.9 -1.2Z"
        fill="#f3e6cc"
        transform="translate(0 2)"
      />
    </>
  );
}
