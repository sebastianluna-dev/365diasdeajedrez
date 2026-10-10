import { useId } from "react";
import type { KeepsakeDrawing, KeepsakeDrawingProps } from "@/components/adventure/keepsakes/keepsake-drawing.types";

// Original artwork drawn for this project (the version-2 mockup of proposal B, «El
// cuaderno del viajero»), exported by scripts/adventure-art.ts: edit the mockup
// and run `npm run adventure:art` again instead of editing this file by hand.
//
// The keepsakes of «cuaderno-del-viajero»: one small drawing per rival, by the rival's
// order, each in its own viewBox. The membership card writes the person's name.

function Keepsake1Drawing() {
  return (
    <>
      <path
        d="M24 0L21.2 3.2L22.9 7.1L19.3 9.3L19.8 13.5L15.7 14.6L15 18.8L10.7 18.5L8.8 22.3L4.8 20.9L1.8 23.9L-1.6 21.3L-5.3 23.4L-7.8 19.9L-12 20.8L-13.3 16.7L-17.6 16.3L-17.7 12.1L-21.6 10.4L-20.4 6.3L-23.7 3.6L-21.4 0L-23.7 -3.6L-20.4 -6.3L-21.6 -10.4L-17.7 -12.1L-17.6 -16.3L-13.3 -16.7L-12 -20.8L-7.8 -19.9L-5.3 -23.4L-1.6 -21.3L1.8 -23.9L4.8 -20.9L8.8 -22.3L10.7 -18.5L15 -18.8L15.7 -14.6L19.8 -13.5L19.3 -9.3L22.9 -7.1L21.2 -3.2Z"
        fill="rgba(42,28,14,.3)"
        transform="translate(1.6 2.6)"
      />
      <path
        d="M24 0L21.2 3.2L22.9 7.1L19.3 9.3L19.8 13.5L15.7 14.6L15 18.8L10.7 18.5L8.8 22.3L4.8 20.9L1.8 23.9L-1.6 21.3L-5.3 23.4L-7.8 19.9L-12 20.8L-13.3 16.7L-17.6 16.3L-17.7 12.1L-21.6 10.4L-20.4 6.3L-23.7 3.6L-21.4 0L-23.7 -3.6L-20.4 -6.3L-21.6 -10.4L-17.7 -12.1L-17.6 -16.3L-13.3 -16.7L-12 -20.8L-7.8 -19.9L-5.3 -23.4L-1.6 -21.3L1.8 -23.9L4.8 -20.9L8.8 -22.3L10.7 -18.5L15 -18.8L15.7 -14.6L19.8 -13.5L19.3 -9.3L22.9 -7.1L21.2 -3.2Z"
        fill="#b23a2c"
      />
      <circle cx="0" cy="0" r="18.6" fill="#c9483a" />
      <circle r="15.4" fill="none" stroke="#f3e6cc" strokeWidth="2.4" />
      <path d="M0 -7.6L1.9 -2.6L7.2 -2.3L3 1L4.5 6.1L0 3.2L-4.5 6.1L-3 1L-7.2 -2.3L-1.9 -2.6Z" fill="#f3e6cc" />
      <path
        d="M-12 -12a17 17 0 0 1 14 -6"
        fill="none"
        stroke="rgba(255,255,255,.45)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="6" cy="9" r="2" fill="rgba(0,0,0,.12)" />
    </>
  );
}

function Keepsake2Drawing() {
  return (
    <>
      <path
        d="M-56 -7H56A7 7 0 0 1 56 7H-56A7 7 0 0 1 -56 -7Z"
        fill="rgba(42,28,14,.28)"
        transform="translate(1.4 2.2)"
      />
      <path d="M-56 -7H56A7 7 0 0 1 56 7H-56A7 7 0 0 1 -56 -7Z" fill="#e6c793" />
      <path d="M24 -7H56A7 7 0 0 1 56 7H24Z" fill="#9a5a34" opacity=".55" />
      <path
        d="M-50 -3H18M-46 2.6H10"
        fill="none"
        stroke="#c9a46c"
        strokeWidth="0.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <text
        x="-14"
        y="4.6"
        textAnchor="middle"
        fontFamily="Caveat, cursive"
        fontSize="14"
        fontWeight="700"
        fill="#2b2a6f"
      >
        ¡jaque!
      </text>
    </>
  );
}

function Keepsake3Drawing({ name }: KeepsakeDrawingProps) {
  return (
    <>
      <rect x="-50" y="-32" width="100" height="64" fill="rgba(42,28,14,.28)" transform="translate(1.6 2.6)" rx="3" />
      <rect x="-50" y="-32" width="100" height="64" rx="3" fill="#fbf6ea" />
      <path d="M-50 -29a3 3 0 0 1 3 -3H47a3 3 0 0 1 3 3V-18H-50Z" fill="#a83a2a" />
      <text
        x="-6"
        y="-21.6"
        textAnchor="middle"
        fontFamily="IBM Plex Mono, monospace"
        fontSize="7.6"
        fontWeight="600"
        fill="#fbf6ea"
        letterSpacing="1.2"
      >
        CLUB LA TORRE
      </text>
      <g transform="translate(40 -25) scale(.42)">
        <path d="M-12 0h24l-2 -6h-20zM-9 -6V-30H9V-6ZM-11 -30v-12h5v4h3v-4h6v4h3v-4h5v12z" fill="#fbf6ea" />
      </g>
      <rect x="-43" y="-11" width="28" height="34" fill="#d8cdb8" />
      <circle cx="-29" cy="0" r="7.4" fill="#a8794f" />
      <path d="M-40 23C-40 13 -35 9 -29 9C-23 9 -18 13 -18 23Z" fill="#3e5079" />
      <path
        d="M-41 -13l7 4M-36 -13l6 4"
        fill="none"
        stroke="#8d949b"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M-8 -6H40M-8 3H34M-8 12H28"
        fill="none"
        stroke="rgba(35,49,79,.35)"
        strokeWidth="0.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <text x="-8" y="-8" fontFamily="Caveat, cursive" fontSize="9" fontWeight="700" fill="#26344f">{`${name}`}</text>
      <text x="-8" y="1" fontFamily="IBM Plex Mono, monospace" fontSize="5.6" fill="#5d5a55">
        SOCIO N.º 0365
      </text>
      <text x="-8" y="10" fontFamily="IBM Plex Mono, monospace" fontSize="5.6" fill="#5d5a55">
        DESDE SEP 2026
      </text>
    </>
  );
}

function Keepsake4Drawing() {
  return (
    <>
      <rect x="-30" y="-38" width="60" height="78" rx="4" fill="rgba(42,28,14,.28)" transform="translate(1.4 2.4)" />
      <rect x="-30" y="-38" width="60" height="78" rx="4" fill="#fbf8f0" />
      <rect x="-26" y="-34" width="52" height="56" rx="2" fill="#4f9a5a" />
      <path
        d="M-26 -6H26M-26 10H26"
        fill="none"
        stroke="#5fae6a"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="0" cy="-6" r="9" fill="none" stroke="#e6f2e0" strokeWidth=".8" opacity=".7" />
      <circle cx="0" cy="-16" r="6.4" fill="#c68b62" />
      <path d="M-6.4 -17.6Q0 -26 6.4 -17.6Q4 -21 0 -21Q-4 -21 -6.4 -17.6Z" fill="#1d1a1c" />
      <path d="M-13 22C-13 4 -7 -4 0 -4C7 -4 13 4 13 22Z" fill="#f3c64a" />
      <rect x="-2.2" y="-5.4" width="4.4" height="4" fill="#c68b62" />
      <path
        d="M-4 4h8M-4 9h8"
        fill="none"
        stroke="#d6a52f"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="16" cy="14" r="4.6" fill="#fbf8f0" />
      <path
        d="M13.4 12l2.6 1.6 2.6 -1.6M16 13.6v3.4"
        fill="none"
        stroke="#1e2130"
        strokeWidth="0.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="-26" y="25" width="52" height="11" fill="#2f3d5c" />
      <text
        x="0"
        y="33"
        textAnchor="middle"
        fontFamily="IBM Plex Mono, monospace"
        fontSize="7"
        fontWeight="600"
        fill="#fbf8f0"
        letterSpacing=".8"
      >
        N.º 87
      </text>
      <text
        x="20"
        y="-28"
        textAnchor="middle"
        fontFamily="Caveat, cursive"
        fontSize="8"
        fontWeight="700"
        fill="#a83a2a"
        transform="rotate(12 20 -28)"
      >
        repe
      </text>
    </>
  );
}

function Keepsake5Drawing() {
  const id = useId();
  return (
    <>
      <defs>
        <pattern id={`${id}-tx-kraft`} width="90" height="90" patternUnits="userSpaceOnUse">
          <circle cx="60.9" cy="66.8" r="1" fill="rgba(255,240,210,.35)" />
          <circle cx="47.2" cy="75.6" r="0.6" fill="rgba(70,40,15,.16)" />
          <circle cx="73.3" cy="82.2" r="1.2" fill="rgba(70,40,15,.16)" />
          <circle cx="52.3" cy="74.3" r="0.9" fill="rgba(70,40,15,.16)" />
          <circle cx="20.9" cy="73.8" r="0.4" fill="rgba(255,240,210,.35)" />
          <circle cx="89.9" cy="38.4" r="0.9" fill="rgba(70,40,15,.16)" />
          <circle cx="65.6" cy="14.2" r="0.5" fill="rgba(70,40,15,.16)" />
          <circle cx="59.5" cy="80.4" r="0.8" fill="rgba(70,40,15,.16)" />
          <circle cx="64.5" cy="36.8" r="0.5" fill="rgba(255,240,210,.35)" />
          <circle cx="65.5" cy="44.3" r="0.8" fill="rgba(70,40,15,.16)" />
          <circle cx="23" cy="82.7" r="0.8" fill="rgba(70,40,15,.16)" />
          <circle cx="56.9" cy="10.3" r="0.9" fill="rgba(70,40,15,.16)" />
          <circle cx="31.8" cy="4" r="0.4" fill="rgba(255,240,210,.35)" />
          <circle cx="54.9" cy="31.1" r="0.5" fill="rgba(70,40,15,.16)" />
          <circle cx="20.4" cy="45.2" r="1.1" fill="rgba(70,40,15,.16)" />
          <circle cx="7.7" cy="32.5" r="1.2" fill="rgba(70,40,15,.16)" />
          <circle cx="69" cy="16" r="0.5" fill="rgba(255,240,210,.35)" />
          <circle cx="62.9" cy="11.5" r="1" fill="rgba(70,40,15,.16)" />
          <circle cx="16.8" cy="46.2" r="0.8" fill="rgba(70,40,15,.16)" />
          <circle cx="20.4" cy="40.4" r="0.6" fill="rgba(70,40,15,.16)" />
          <circle cx="85" cy="10.2" r="1.1" fill="rgba(255,240,210,.35)" />
          <circle cx="37.3" cy="76.3" r="0.5" fill="rgba(70,40,15,.16)" />
          <circle cx="31.9" cy="6.5" r="1" fill="rgba(70,40,15,.16)" />
          <circle cx="54.1" cy="62.9" r="0.7" fill="rgba(70,40,15,.16)" />
          <circle cx="33" cy="85.2" r="0.8" fill="rgba(255,240,210,.35)" />
          <circle cx="7" cy="83.9" r="0.8" fill="rgba(70,40,15,.16)" />
          <circle cx="19.1" cy="12.5" r="0.6" fill="rgba(70,40,15,.16)" />
          <circle cx="27.2" cy="54.1" r="1" fill="rgba(70,40,15,.16)" />
          <circle cx="74" cy="55.7" r="0.8" fill="rgba(255,240,210,.35)" />
          <circle cx="38.3" cy="8.7" r="0.9" fill="rgba(70,40,15,.16)" />
          <circle cx="69.2" cy="4.8" r="0.9" fill="rgba(70,40,15,.16)" />
          <circle cx="53.3" cy="23.1" r="1.1" fill="rgba(70,40,15,.16)" />
          <circle cx="17" cy="12.7" r="0.4" fill="rgba(255,240,210,.35)" />
          <circle cx="65.7" cy="9.7" r="1.1" fill="rgba(70,40,15,.16)" />
          <circle cx="69" cy="47.5" r="0.4" fill="rgba(70,40,15,.16)" />
          <circle cx="58.8" cy="88.9" r="0.5" fill="rgba(70,40,15,.16)" />
          <circle cx="13.1" cy="20.4" r="1.2" fill="rgba(255,240,210,.35)" />
          <circle cx="58.1" cy="86.5" r="0.9" fill="rgba(70,40,15,.16)" />
          <circle cx="3.8" cy="3.6" r="1" fill="rgba(70,40,15,.16)" />
          <circle cx="80.1" cy="67.5" r="0.9" fill="rgba(70,40,15,.16)" />
          <circle cx="78.2" cy="66.1" r="0.5" fill="rgba(255,240,210,.35)" />
          <circle cx="41.1" cy="50.3" r="0.9" fill="rgba(70,40,15,.16)" />
          <circle cx="57.9" cy="5.9" r="1.1" fill="rgba(70,40,15,.16)" />
          <circle cx="79.2" cy="78" r="1" fill="rgba(70,40,15,.16)" />
          <circle cx="3.4" cy="86.9" r="0.5" fill="rgba(255,240,210,.35)" />
          <circle cx="27.8" cy="76.5" r="0.5" fill="rgba(70,40,15,.16)" />
          <circle cx="53.5" cy="8.6" r="1.2" fill="rgba(70,40,15,.16)" />
          <circle cx="34" cy="34.7" r="1" fill="rgba(70,40,15,.16)" />
          <circle cx="43.2" cy="73.1" r="1.1" fill="rgba(255,240,210,.35)" />
          <circle cx="87.1" cy="66.6" r="1" fill="rgba(70,40,15,.16)" />
          <circle cx="54.4" cy="88" r="1.1" fill="rgba(70,40,15,.16)" />
          <circle cx="75.4" cy="68.8" r="0.4" fill="rgba(70,40,15,.16)" />
          <circle cx="55.3" cy="56.6" r="0.9" fill="rgba(255,240,210,.35)" />
          <circle cx="11.1" cy="50.3" r="0.6" fill="rgba(70,40,15,.16)" />
          <circle cx="6.1" cy="0.6" r="0.7" fill="rgba(70,40,15,.16)" />
          <circle cx="80.2" cy="52.3" r="0.9" fill="rgba(70,40,15,.16)" />
          <circle cx="5.3" cy="71.9" r="1.1" fill="rgba(255,240,210,.35)" />
          <circle cx="27.1" cy="62.6" r="0.5" fill="rgba(70,40,15,.16)" />
          <circle cx="28.5" cy="10.9" r="1.2" fill="rgba(70,40,15,.16)" />
          <circle cx="40.4" cy="35.4" r="0.8" fill="rgba(70,40,15,.16)" />
          <circle cx="3.6" cy="50.1" r="0.8" fill="rgba(255,240,210,.35)" />
          <circle cx="67.6" cy="49.8" r="1.2" fill="rgba(70,40,15,.16)" />
          <circle cx="44.8" cy="79.3" r="1.1" fill="rgba(70,40,15,.16)" />
          <circle cx="32.9" cy="60.8" r="0.6" fill="rgba(70,40,15,.16)" />
          <circle cx="8.4" cy="42" r="0.8" fill="rgba(255,240,210,.35)" />
          <circle cx="83.4" cy="12.5" r="1.2" fill="rgba(70,40,15,.16)" />
          <circle cx="32.4" cy="28.4" r="1.2" fill="rgba(70,40,15,.16)" />
          <circle cx="67.2" cy="14.5" r="0.6" fill="rgba(70,40,15,.16)" />
          <circle cx="26.4" cy="19.7" r="1.1" fill="rgba(255,240,210,.35)" />
          <circle cx="1.3" cy="46.4" r="0.5" fill="rgba(70,40,15,.16)" />
          <circle cx="70.5" cy="75.2" r="1.2" fill="rgba(70,40,15,.16)" />
          <circle cx="59.6" cy="28.5" r="0.4" fill="rgba(70,40,15,.16)" />
          <circle cx="30.5" cy="74.9" r="0.7" fill="rgba(255,240,210,.35)" />
          <circle cx="76.9" cy="34.9" r="0.6" fill="rgba(70,40,15,.16)" />
          <circle cx="38.1" cy="8.9" r="0.6" fill="rgba(70,40,15,.16)" />
          <circle cx="53" cy="83.3" r="0.7" fill="rgba(70,40,15,.16)" />
          <circle cx="61.5" cy="45" r="0.6" fill="rgba(255,240,210,.35)" />
          <circle cx="20.2" cy="46.5" r="0.9" fill="rgba(70,40,15,.16)" />
          <circle cx="37" cy="41.9" r="1.2" fill="rgba(70,40,15,.16)" />
          <circle cx="39.4" cy="23.7" r="0.4" fill="rgba(70,40,15,.16)" />
          <circle cx="15.7" cy="64.9" r="0.7" fill="rgba(255,240,210,.35)" />
          <circle cx="0.5" cy="30.3" r="0.6" fill="rgba(70,40,15,.16)" />
          <circle cx="50.6" cy="52.8" r="0.8" fill="rgba(70,40,15,.16)" />
          <circle cx="42.6" cy="60" r="0.6" fill="rgba(70,40,15,.16)" />
          <circle cx="7.9" cy="72.9" r="0.9" fill="rgba(255,240,210,.35)" />
          <circle cx="79.6" cy="23" r="0.6" fill="rgba(70,40,15,.16)" />
          <circle cx="49" cy="40.5" r="0.5" fill="rgba(70,40,15,.16)" />
          <circle cx="45.8" cy="6.3" r="1.3" fill="rgba(70,40,15,.16)" />
          <circle cx="28.1" cy="35.8" r="1" fill="rgba(255,240,210,.35)" />
          <circle cx="2.5" cy="45.8" r="0.7" fill="rgba(70,40,15,.16)" />
          <path
            d="M34.6 81l-6 0.4"
            fill="none"
            stroke="rgba(70,40,15,.14)"
            strokeWidth="0.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M55.4 6.1l-5.8 1.6"
            fill="none"
            stroke="rgba(70,40,15,.14)"
            strokeWidth="0.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M54.1 50.4l0.9 5.9"
            fill="none"
            stroke="rgba(70,40,15,.14)"
            strokeWidth="0.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M84.9 9l3.9 4.6"
            fill="none"
            stroke="rgba(70,40,15,.14)"
            strokeWidth="0.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M51.1 61.9l-5.1 3.2"
            fill="none"
            stroke="rgba(70,40,15,.14)"
            strokeWidth="0.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M79.6 83l5.8 1.6"
            fill="none"
            stroke="rgba(70,40,15,.14)"
            strokeWidth="0.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M70.2 38.2l-5.9 1.2"
            fill="none"
            stroke="rgba(70,40,15,.14)"
            strokeWidth="0.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M78.7 18.9l-5.9 1.2"
            fill="none"
            stroke="rgba(70,40,15,.14)"
            strokeWidth="0.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M56.6 52l0.2 6"
            fill="none"
            stroke="rgba(70,40,15,.14)"
            strokeWidth="0.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M43.8 63.6l6 0"
            fill="none"
            stroke="rgba(70,40,15,.14)"
            strokeWidth="0.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M22.9 19l-3.2 5.1"
            fill="none"
            stroke="rgba(70,40,15,.14)"
            strokeWidth="0.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M85.4 75.6l0.9 5.9"
            fill="none"
            stroke="rgba(70,40,15,.14)"
            strokeWidth="0.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M55.8 41.7l5.3 2.8"
            fill="none"
            stroke="rgba(70,40,15,.14)"
            strokeWidth="0.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M14.3 66.5l1.7 5.8"
            fill="none"
            stroke="rgba(70,40,15,.14)"
            strokeWidth="0.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </pattern>
      </defs>
      <rect x="-16" y="-66" width="32" height="124" rx="2" fill="rgba(42,28,14,.28)" transform="translate(1.4 2.4)" />
      <rect x="-16" y="-66" width="32" height="124" rx="2" fill="#f1e2bd" />
      <rect x="-16" y="-66" width="32" height="124" rx="2" fill={`url(#${id}-tx-kraft)`} opacity=".5" />
      <circle cx="0" cy="-58" r="2.6" fill="#efe4cc" />
      <circle cx="0" cy="-58" r="2.6" fill="none" stroke="#a47c4f" strokeWidth=".8" />
      <path
        d="M0 -58C-4 -66 -10 -70 -12 -74"
        fill="none"
        stroke="#a83a2a"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M-15 -74L-9 -74L-8 -62L-16 -62Z" fill="#a83a2a" transform="rotate(-24 -12 -68)" />
      <path
        d="M-12 -44V-20M-12 -44H12M-8 -44V-20M-12 -40H12M-4 -44V-20M-12 -36H12M0 -44V-20M-12 -32H12M4 -44V-20M-12 -28H12M8 -44V-20M-12 -24H12M12 -44V-20M-12 -20H12"
        fill="none"
        stroke="#6f6a63"
        strokeWidth="0.45"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity=".8"
      />
      <path
        d="M-12 -40h4v4h-4zM-12 -32h4v4h-4zM-12 -24h4v4h-4zM-8 -44h4v4h-4zM-8 -36h4v4h-4zM-8 -28h4v4h-4zM-4 -40h4v4h-4zM-4 -32h4v4h-4zM-4 -24h4v4h-4zM0 -44h4v4h-4zM0 -36h4v4h-4zM0 -28h4v4h-4zM4 -40h4v4h-4zM4 -32h4v4h-4zM4 -24h4v4h-4zM8 -44h4v4h-4zM8 -36h4v4h-4zM8 -28h4v4h-4z"
        fill="#6f6a63"
        opacity=".28"
      />
      <circle cx="-6" cy="-38" r="1.4" fill="#3a3733" />
      <circle cx="2" cy="-30" r="1.4" fill="#3a3733" />
      <circle cx="6" cy="-26" r="1.4" fill="none" stroke="#3a3733" strokeWidth=".7" />
      <path
        d="M-6 -38L2 -30"
        fill="none"
        stroke="#3a3733"
        strokeWidth="0.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity=".7"
      />
      <text x="0" y="-8" textAnchor="middle" fontFamily="Caveat, cursive" fontSize="9" fontWeight="700" fill="#3a3733">
        1974
      </text>
      <path
        d="M-11 4H11M-11 12H8M-11 20H10"
        fill="none"
        stroke="#6f6a63"
        strokeWidth="0.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity=".6"
      />
      <text
        x="0"
        y="46"
        textAnchor="middle"
        fontFamily="IBM Plex Mono, monospace"
        fontSize="4.6"
        fontWeight="600"
        fill="#8f6440"
        letterSpacing=".6"
      >
        BIBLIOTECA
      </text>
    </>
  );
}

function Keepsake6Drawing() {
  return (
    <>
      <path
        d="M-14 -62L-4 -34M14 -62L4 -34"
        fill="none"
        stroke="#3e5079"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M-14 -62L-4 -34M14 -62L4 -34"
        fill="none"
        stroke="#5b6fa3"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity=".6"
      />
      <rect x="-8" y="-36" width="16" height="6" fill="#8d949b" />
      <rect x="-8" y="-36" width="16" height="6" fill="rgba(255,255,255,.35)" transform="scale(1 .4)" />
      <rect x="-30" y="-30" width="60" height="82" rx="4" fill="rgba(42,28,14,.28)" transform="translate(1.6 2.6)" />
      <rect x="-30" y="-30" width="60" height="82" rx="4" fill="#fbf6ea" />
      <path d="M-30 -26a4 4 0 0 1 4 -4H26a4 4 0 0 1 4 4V-12H-30Z" fill="#26344f" />
      <text
        x="0"
        y="-21"
        textAnchor="middle"
        fontFamily="IBM Plex Mono, monospace"
        fontSize="5"
        fontWeight="600"
        fill="#fbf6ea"
        letterSpacing=".4"
      >
        UNIVERSITARIO
      </text>
      <text
        x="0"
        y="-15"
        textAnchor="middle"
        fontFamily="IBM Plex Mono, monospace"
        fontSize="4.6"
        fill="#c3cbe3"
        letterSpacing=".6"
      >
        TORNEO · 1994
      </text>
      <g transform="translate(0 15) scale(.2)">
        <path
          d="M-22 0h44l-3 -8h-38zM-17 -8h34l-3 -7h-28zM-14 -15C-15 -30 -10 -42 -2 -50C-11 -52 -19 -56 -22 -63C-24 -69 -20 -73 -14 -71C-6 -79 2 -87 9 -90L11 -97L15 -90C25 -86 29 -71 27 -55C25 -37 19 -24 17 -15Z"
          fill="#a83a2a"
        />
      </g>
      <text x="0" y="22" textAnchor="middle" fontFamily="Caveat, cursive" fontSize="11" fontWeight="700" fill="#26344f">
        I. Cárdenas
      </text>
      <text
        x="0"
        y="32"
        textAnchor="middle"
        fontFamily="IBM Plex Mono, monospace"
        fontSize="5"
        fontWeight="600"
        fill="#a83a2a"
        letterSpacing="1"
      >
        CAPITANA
      </text>
      <path
        d="M-20 40H20M-20 45H12"
        fill="none"
        stroke="rgba(35,49,79,.35)"
        strokeWidth="0.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  );
}

function Keepsake7Drawing() {
  return (
    <>
      <path
        d="M0 26C-18 26 -32 12 -32 -2C-32 -16 -18 -26 0 -26C18 -26 32 -16 32 -2C32 12 18 26 0 26Z"
        fill="rgba(42,28,14,.28)"
        transform="translate(1.6 2.6)"
      />
      <path d="M0 26C-18 26 -32 12 -32 -2C-32 -16 -18 -26 0 -26C18 -26 32 -16 32 -2C32 12 18 26 0 26Z" fill="#f0d3c0" />
      <path d="M-30 -2C-28 -14 -16 -24 0 -24C16 -24 28 -14 30 -2C20 -8 -20 -8 -30 -2Z" fill="#f7e6da" />
      <path
        d="M-7.5 24Q-25 4 -29 -22M-6 24Q-20 4 -23.2 -22M-4.5 24Q-15 4 -17.4 -22M-3 24Q-10 4 -11.6 -22M-1.5 24Q-5 4 -5.8 -22M0 24Q0 4 0 -22M1.5 24Q5 4 5.8 -22M3 24Q10 4 11.6 -22M4.5 24Q15 4 17.4 -22M6 24Q20 4 23.2 -22M7.5 24Q25 4 29 -22"
        fill="none"
        stroke="#c98f78"
        strokeWidth="1.1"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity=".75"
      />
      <path d="M-12 28H12L9 33H-9Z" fill="#d4a68f" />
      <text
        x="0"
        y="8"
        textAnchor="middle"
        fontFamily="Caveat, cursive"
        fontSize="15"
        fontWeight="700"
        fill="#3e5079"
        transform="rotate(-6)"
      >
        1.e4 e6
      </text>
    </>
  );
}

function Keepsake8Drawing() {
  return (
    <>
      <path
        d="M-34 8C-34 -16 -8 -22 0 -4C8 14 34 12 34 -8C34 -22 14 -22 6 -6C-2 10 -34 22 -34 8Z"
        fill="none"
        stroke="rgba(42,28,14,.28)"
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
        transform="translate(1.4 2.4)"
      />
      <path
        d="M-34 8C-34 -16 -8 -22 0 -4C8 14 34 12 34 -8C34 -22 14 -22 6 -6C-2 10 -34 22 -34 8Z"
        fill="none"
        stroke="#8f2a20"
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M-34 8C-34 -16 -8 -22 0 -4C8 14 34 12 34 -8C34 -22 14 -22 6 -6C-2 10 -34 22 -34 8Z"
        fill="none"
        stroke="#b23a2c"
        strokeWidth="6.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M-34 8C-34 -16 -8 -22 0 -4C8 14 34 12 34 -8C34 -22 14 -22 6 -6C-2 10 -34 22 -34 8Z"
        fill="none"
        stroke="#d3695a"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="2.4 3.2"
        opacity=".8"
      />
      <path
        d="M-38 14C-44 22 -40 26 -34 24"
        fill="none"
        stroke="#b23a2c"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M38 -12C44 -20 40 -26 34 -24"
        fill="none"
        stroke="#b23a2c"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="0" cy="-4" r="6.4" fill="#8f2a20" />
      <circle cx="0" cy="-4" r="4.4" fill="#b23a2c" />
    </>
  );
}

function Keepsake9Drawing() {
  return (
    <>
      <rect x="-32" y="-44" width="64" height="88" rx="1.5" fill="rgba(42,28,14,.28)" transform="translate(1.4 2.4)" />
      <rect x="-32" y="-44" width="64" height="88" rx="1.5" fill="#f4ecd4" />
      <text
        x="0"
        y="-33"
        textAnchor="middle"
        fontFamily="IBM Plex Mono, monospace"
        fontSize="5.2"
        fontWeight="600"
        fill="#26344f"
        letterSpacing=".4"
      >
        FINAL 1994
      </text>
      <path
        d="M-26 -28H26"
        fill="none"
        stroke="#26344f"
        strokeWidth="0.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M0 -28V32M-26 -22H26M-26 -15.6H26M-26 -9.2H26M-26 -2.799999999999997H26M-26 3.6000000000000014H26M-26 10H26M-26 16.400000000000006H26M-26 22.800000000000004H26M-26 29.200000000000003H26"
        fill="none"
        stroke="rgba(35,49,79,.4)"
        strokeWidth="0.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <text x="-24" y="-17.6" fontFamily="Caveat, cursive" fontSize="6.4" fontWeight="700" fill="#3a3733">
        1. e4
      </text>
      <text x="3" y="-17.6" fontFamily="Caveat, cursive" fontSize="6.4" fontWeight="700" fill="#3a3733">
        e5
      </text>
      <text x="-24" y="-11.200000000000001" fontFamily="Caveat, cursive" fontSize="6.4" fontWeight="700" fill="#3a3733">
        2. Cf3
      </text>
      <text x="3" y="-11.200000000000001" fontFamily="Caveat, cursive" fontSize="6.4" fontWeight="700" fill="#3a3733">
        Cc6
      </text>
      <text x="-24" y="-4.800000000000001" fontFamily="Caveat, cursive" fontSize="6.4" fontWeight="700" fill="#3a3733">
        3. Ab5
      </text>
      <text x="3" y="-4.800000000000001" fontFamily="Caveat, cursive" fontSize="6.4" fontWeight="700" fill="#3a3733">
        a6
      </text>
      <text x="-24" y="1.6000000000000014" fontFamily="Caveat, cursive" fontSize="6.4" fontWeight="700" fill="#3a3733">
        4. Aa4
      </text>
      <text x="3" y="1.6000000000000014" fontFamily="Caveat, cursive" fontSize="6.4" fontWeight="700" fill="#3a3733">
        Cf6
      </text>
      <text x="-24" y="8" fontFamily="Caveat, cursive" fontSize="6.4" fontWeight="700" fill="#3a3733">
        5. O-O
      </text>
      <text x="3" y="8" fontFamily="Caveat, cursive" fontSize="6.4" fontWeight="700" fill="#3a3733">
        Ae7
      </text>
      <text x="-24" y="14.399999999999999" fontFamily="Caveat, cursive" fontSize="6.4" fontWeight="700" fill="#3a3733">
        6. Te1
      </text>
      <text x="3" y="14.399999999999999" fontFamily="Caveat, cursive" fontSize="6.4" fontWeight="700" fill="#3a3733">
        b5
      </text>
      <text x="-24" y="20.800000000000004" fontFamily="Caveat, cursive" fontSize="6.4" fontWeight="700" fill="#3a3733">
        7. Ab3
      </text>
      <text x="3" y="20.800000000000004" fontFamily="Caveat, cursive" fontSize="6.4" fontWeight="700" fill="#3a3733">
        d6
      </text>
      <text x="-24" y="27.200000000000003" fontFamily="Caveat, cursive" fontSize="6.4" fontWeight="700" fill="#3a3733">
        8. c3
      </text>
      <text x="3" y="27.200000000000003" fontFamily="Caveat, cursive" fontSize="6.4" fontWeight="700" fill="#3a3733">
        O-O
      </text>
      <text x="-24" y="38" fontFamily="IBM Plex Mono, monospace" fontSize="4.6" fill="#5d5a55" letterSpacing=".5">
        RESULTADO
      </text>
      <text x="8" y="39" fontFamily="Caveat, cursive" fontSize="13" fontWeight="700" fill="#a83a2a">
        ?
      </text>
      <path
        d="M-6 40H26"
        fill="none"
        stroke="rgba(35,49,79,.45)"
        strokeWidth="0.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  );
}

function Keepsake10Drawing() {
  return (
    <>
      <path
        d="M-38 -9A9 9 0 1 0 -38 9A9 9 0 1 0 -38 -9ZM-30 -2H34V2H30V9H26V2H22V7H18V2H-30Z"
        fill="rgba(42,28,14,.3)"
        transform="translate(1.6 2.6)"
        fillRule="evenodd"
      />
      <path
        d="M-38 -9A9 9 0 1 0 -38 9A9 9 0 1 0 -38 -9ZM-30 -2H34V2H30V9H26V2H22V7H18V2H-30Z"
        fill="#c9a24a"
        fillRule="evenodd"
      />
      <path d="M-30 -2H34V0H-30Z" fill="#ebd08a" opacity=".7" />
      <circle cx="-38" cy="0" r="4" fill="rgba(0,0,0,.25)" />
      <circle cx="-38" cy="0" r="3" fill="#efe5cf" />
      <g transform="translate(-4 8) rotate(-12)">
        <rect x="-12" y="-3" width="24" height="15" rx="2" fill="rgba(42,28,14,.28)" transform="translate(1.2 2)" />
        <rect x="-12" y="-3" width="24" height="15" rx="2" fill="#f1e2bd" />
        <circle cx="0" cy="0" r="1.2" fill="#8f6440" />
        <text
          x="0"
          y="9.4"
          textAnchor="middle"
          fontFamily="IBM Plex Mono, monospace"
          fontSize="8"
          fontWeight="600"
          fill="#7e2519"
        >
          64
        </text>
      </g>
    </>
  );
}

function Keepsake11Drawing() {
  return (
    <>
      <rect x="-32" y="-32" width="64" height="66" rx="1.5" fill="rgba(42,28,14,.28)" transform="translate(1.6 2.6)" />
      <rect x="-32" y="-32" width="64" height="66" rx="1.5" fill="#fbf8f0" />
      <rect x="-27" y="-27" width="54" height="46" fill="#7c8896" />
      <rect x="-27" y="-27" width="54" height="22" fill="#9aa5b1" />
      <rect x="-27" y="6" width="54" height="13" fill="#6a7480" />
      <path d="M-27 6H27V19H-27Z" fill="#8a6a4a" opacity=".55" />
      <g transform="translate(-6 -2)">
        <path d="M-9 24C-9 8 -4 2 1 2C6 2 11 8 11 24Z" fill="#3e4a63" />
        <circle cx="1" cy="-6" r="6.4" fill="#c9a27e" />
        <path d="M-5.8 -8Q1 -17 7.8 -8Q5 -12 1 -12Q-3 -12 -5.8 -8Z" fill="#2a2420" />
      </g>
      <path d="M6 8H26L24 15H8Z" fill="#d8cdb8" />
      <rect x="8" y="8" width="18" height="7" fill="#4a4036" opacity=".55" />
      <path
        d="M8 8h1.8v3.5h-1.8zM9.8 11.5h1.8v3.5h-1.8zM11.6 8h1.8v3.5h-1.8zM13.4 11.5h1.8v3.5h-1.8zM15.2 8h1.8v3.5h-1.8zM17 11.5h1.8v3.5h-1.8zM18.8 8h1.8v3.5h-1.8zM20.6 11.5h1.8v3.5h-1.8zM22.4 8h1.8v3.5h-1.8zM24.200000000000003 11.5h1.8v3.5h-1.8z"
        fill="#efe5cf"
        opacity=".8"
      />
      <text
        x="0"
        y="29.4"
        textAnchor="middle"
        fontFamily="Caveat, cursive"
        fontSize="9"
        fontWeight="700"
        fill="#26344f"
      >
        J., 1994
      </text>
    </>
  );
}

function Keepsake12Drawing() {
  return (
    <>
      <rect x="-36" y="-48" width="72" height="96" rx="1.5" fill="rgba(42,28,14,.28)" transform="translate(1.6 2.6)" />
      <rect x="-36" y="-48" width="72" height="96" rx="1.5" fill="#f3e8cc" />
      <path
        d="M-36 -34H36M-36 -25H36M-36 -16H36M-36 -7H36M-36 2H36M-36 11H36M-36 20H36M-36 29H36M-36 38H36M-36 47H36"
        fill="none"
        stroke="rgba(90,120,160,.3)"
        strokeWidth="0.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M-26 -48V48"
        fill="none"
        stroke="rgba(200,80,70,.5)"
        strokeWidth="0.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M-36 -48V48"
        fill="none"
        stroke="rgba(255,255,255,.4)"
        strokeWidth="0.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="-36" cy="-40" r="2.1" fill="#8d949b" />
      <circle cx="-36" cy="-40" r="1.2" fill="rgba(0,0,0,.35)" />
      <circle cx="-36" cy="-26.6" r="2.1" fill="#8d949b" />
      <circle cx="-36" cy="-26.6" r="1.2" fill="rgba(0,0,0,.35)" />
      <circle cx="-36" cy="-13.2" r="2.1" fill="#8d949b" />
      <circle cx="-36" cy="-13.2" r="1.2" fill="rgba(0,0,0,.35)" />
      <circle cx="-36" cy="0.2" r="2.1" fill="#8d949b" />
      <circle cx="-36" cy="0.2" r="1.2" fill="rgba(0,0,0,.35)" />
      <circle cx="-36" cy="13.6" r="2.1" fill="#8d949b" />
      <circle cx="-36" cy="13.6" r="1.2" fill="rgba(0,0,0,.35)" />
      <circle cx="-36" cy="27" r="2.1" fill="#8d949b" />
      <circle cx="-36" cy="27" r="1.2" fill="rgba(0,0,0,.35)" />
      <circle cx="-36" cy="40.4" r="2.1" fill="#8d949b" />
      <circle cx="-36" cy="40.4" r="1.2" fill="rgba(0,0,0,.35)" />
      <text
        x="4"
        y="-24"
        textAnchor="middle"
        fontFamily="Caveat, cursive"
        fontSize="10"
        fontWeight="700"
        fill="#4a2f1d"
      >
        para quien
      </text>
      <text
        x="4"
        y="-15"
        textAnchor="middle"
        fontFamily="Caveat, cursive"
        fontSize="10"
        fontWeight="700"
        fill="#4a2f1d"
      >
        la termine
      </text>
      <path
        d="M-18 4C-12 -4 -6 12 0 2C6 -6 10 10 20 0"
        fill="none"
        stroke="#26344f"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <text
        x="14"
        y="30"
        textAnchor="middle"
        fontFamily="Caveat, cursive"
        fontSize="14"
        fontWeight="700"
        fill="#26344f"
        transform="rotate(-6 14 30)"
      >
        J.
      </text>
      <path
        d="M2 36C10 34 20 36 28 32"
        fill="none"
        stroke="#26344f"
        strokeWidth="0.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  );
}

/** The drawings of «cuaderno-del-viajero»'s keepsakes by the order of the rival that leaves them. */
export const CUADERNO_DEL_VIAJERO_KEEPSAKES: Readonly<Record<number, KeepsakeDrawing>> = {
  1: { viewBox: "-30 -30 60 60", Drawing: Keepsake1Drawing },
  2: { viewBox: "-62 -14 124 28", Drawing: Keepsake2Drawing },
  3: { viewBox: "-56 -38 112 76", Drawing: Keepsake3Drawing },
  4: { viewBox: "-34 -42 68 84", Drawing: Keepsake4Drawing },
  5: { viewBox: "-24 -74 48 148", Drawing: Keepsake5Drawing },
  6: { viewBox: "-40 -64 80 116", Drawing: Keepsake6Drawing },
  7: { viewBox: "-36 -32 72 64", Drawing: Keepsake7Drawing },
  8: { viewBox: "-44 -30 88 60", Drawing: Keepsake8Drawing },
  9: { viewBox: "-38 -50 76 100", Drawing: Keepsake9Drawing },
  10: { viewBox: "-56 -24 112 48", Drawing: Keepsake10Drawing },
  11: { viewBox: "-38 -38 76 74", Drawing: Keepsake11Drawing },
  12: { viewBox: "-42 -54 84 108", Drawing: Keepsake12Drawing },
};
