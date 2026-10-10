// Original artwork drawn for this project (the version-2 mockup of proposal B, «El
// cuaderno del viajero»), exported by scripts/adventure-art.ts: edit the mockup
// and run `npm run adventure:art` again instead of editing this file by hand.

/** The needle that leads the seam: its point on the origin, pointing to the right. */
export function Needle() {
  return (
    <>
      <path d="M0 0L96 -9L98 -7L2 1Z" fill="rgba(42,28,14,.25)" transform="translate(2 4)" />
      <path d="M0 0L84 -8.6C90 -9.4 97 -9.6 98 -7.4C98.6 -5.4 92 -3.6 84 -3.4L0 0Z" fill="#8e959d" />
      <path d="M86 -7.6C89 -8 93 -7.9 94 -7C93.5 -6 90 -5.2 86 -5.1Z" fill="#3a3d45" />
      <path
        d="M8 -0.8L80 -7.2"
        fill="none"
        stroke="#eef1f4"
        strokeWidth="0.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  );
}
