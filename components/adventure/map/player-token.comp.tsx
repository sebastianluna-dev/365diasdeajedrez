// Original artwork drawn for this project (the version-2 mockup of proposal B, «El
// cuaderno del viajero»), exported by scripts/adventure-art.ts: edit the mockup
// and run `npm run adventure:art` again instead of editing this file by hand.

interface PlayerTokenProps {
  /** The person's initials, written on the token's head. */
  initials: string;
}

/** The person's token: a red pawn with their initials, standing on the origin (drawn upward, 60 x 94 around it). */
export function PlayerToken({ initials }: PlayerTokenProps) {
  return (
    <>
      <ellipse cx="0" cy="1" rx="26" ry="6" fill="rgba(42,28,14,.22)" />
      <path
        d="M-20 0H20L17 -8H-17ZM-15 -8C-12 -22 -9 -32 -11 -40H11C9 -32 12 -22 15 -8ZM-14 -40H14V-46H-14ZM0 -76A15 15 0 1 0 .1 -76Z"
        fill="#6e1d14"
        transform="translate(1.6 2.4)"
      />
      <path
        d="M-20 0H20L17 -8H-17ZM-15 -8C-12 -22 -9 -32 -11 -40H11C9 -32 12 -22 15 -8ZM-14 -40H14V-46H-14ZM0 -76A15 15 0 1 0 .1 -76Z"
        fill="#a93c2b"
      />
      <path d="M0 -76A15 15 0 0 1 10 -50L4 -46H14V-40H11C9 -32 12 -22 15 -8H17L20 0H6Z" fill="rgba(0,0,0,.14)" />
      <circle cx="0" cy="-58" r="12.5" fill="#fbf6ea" />
      <text
        x="0"
        y="-54"
        textAnchor="middle"
        fontFamily="IBM Plex Mono, monospace"
        fontSize="11.5"
        fontWeight="600"
        fill="#82281c"
      >{`${initials}`}</text>
    </>
  );
}
