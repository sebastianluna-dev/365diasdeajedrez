import { useId } from "react";

// Original artwork drawn for this project (the version-2 mockup of proposal B, «El
// cuaderno del viajero»), exported by scripts/adventure-art.ts: edit the mockup
// and run `npm run adventure:art` again instead of editing this file by hand.
//
// The engraved portrait of capitan-olmo, drawn inside a 100 x 112 box: the host
// provides the <svg> (and may crop it). Its clip paths and patterns take ids
// from `useId`, so the same portrait can be on a page twice.

export function CapitanOlmoPortrait() {
  const id = useId();
  return (
    <>
      <defs>
        <pattern id={`${id}-tx-grano`} width="40" height="40" patternUnits="userSpaceOnUse">
          <circle cx="39.8" cy="0.4" r="0.4" fill="rgba(250,244,230,.55)" />
          <circle cx="18.4" cy="32.4" r="0.5" fill="rgba(250,244,230,.55)" />
          <circle cx="5.2" cy="30.9" r="0.8" fill="rgba(250,244,230,.55)" />
          <circle cx="21.3" cy="38.5" r="0.6" fill="rgba(250,244,230,.55)" />
          <circle cx="9.6" cy="34.3" r="0.5" fill="rgba(250,244,230,.55)" />
          <circle cx="22.6" cy="7.3" r="0.5" fill="rgba(250,244,230,.55)" />
          <circle cx="15.3" cy="37.3" r="0.6" fill="rgba(250,244,230,.55)" />
          <circle cx="34.9" cy="39" r="0.9" fill="rgba(250,244,230,.55)" />
          <circle cx="33.2" cy="15.9" r="0.5" fill="rgba(250,244,230,.55)" />
          <circle cx="19" cy="27.9" r="0.5" fill="rgba(250,244,230,.55)" />
          <circle cx="29.3" cy="29.1" r="0.6" fill="rgba(250,244,230,.55)" />
          <circle cx="26.4" cy="36.3" r="0.6" fill="rgba(250,244,230,.55)" />
          <circle cx="28.3" cy="19.3" r="0.8" fill="rgba(250,244,230,.55)" />
          <circle cx="37.3" cy="1.9" r="0.6" fill="rgba(250,244,230,.55)" />
          <circle cx="29.1" cy="5.5" r="0.5" fill="rgba(250,244,230,.55)" />
          <circle cx="8.1" cy="33.1" r="0.8" fill="rgba(250,244,230,.55)" />
          <circle cx="38.7" cy="37.6" r="0.6" fill="rgba(250,244,230,.55)" />
          <circle cx="29.6" cy="23.2" r="0.7" fill="rgba(250,244,230,.55)" />
          <circle cx="6" cy="4.2" r="0.8" fill="rgba(250,244,230,.55)" />
          <circle cx="13.9" cy="21.1" r="0.4" fill="rgba(250,244,230,.55)" />
          <circle cx="9.4" cy="32.5" r="0.6" fill="rgba(250,244,230,.55)" />
          <circle cx="36.1" cy="12.7" r="0.6" fill="rgba(250,244,230,.55)" />
          <circle cx="23.2" cy="8.2" r="0.6" fill="rgba(250,244,230,.55)" />
          <circle cx="34.8" cy="17.5" r="0.4" fill="rgba(250,244,230,.55)" />
          <circle cx="33.4" cy="20.2" r="0.8" fill="rgba(250,244,230,.55)" />
          <circle cx="17.2" cy="29.1" r="0.6" fill="rgba(250,244,230,.55)" />
          <circle cx="35.7" cy="6.2" r="0.6" fill="rgba(250,244,230,.55)" />
          <circle cx="9" cy="20.4" r="0.9" fill="rgba(250,244,230,.55)" />
          <circle cx="3.3" cy="5.5" r="0.5" fill="rgba(250,244,230,.55)" />
          <circle cx="34.8" cy="6.2" r="0.6" fill="rgba(250,244,230,.55)" />
          <circle cx="29.4" cy="10.4" r="0.6" fill="rgba(250,244,230,.55)" />
          <circle cx="10.1" cy="15.2" r="0.7" fill="rgba(250,244,230,.55)" />
          <circle cx="33.8" cy="14" r="0.6" fill="rgba(250,244,230,.55)" />
          <circle cx="27.6" cy="0.4" r="0.9" fill="rgba(250,244,230,.55)" />
          <circle cx="32.6" cy="24.2" r="0.4" fill="rgba(250,244,230,.55)" />
          <circle cx="13.5" cy="34.7" r="0.7" fill="rgba(250,244,230,.55)" />
          <circle cx="38.2" cy="26.4" r="0.6" fill="rgba(250,244,230,.55)" />
          <circle cx="27.7" cy="28.6" r="0.8" fill="rgba(250,244,230,.55)" />
          <circle cx="15.8" cy="11" r="0.3" fill="rgba(250,244,230,.55)" />
          <circle cx="5.2" cy="13.6" r="0.7" fill="rgba(250,244,230,.55)" />
        </pattern>
      </defs>
      <defs>
        <clipPath id={`${id}-v`}>
          <rect width="100" height="112" />
        </clipPath>
        <clipPath id={`${id}-f`}>
          <path d="M50.8 26C54.2 26 57.9 27.1 60 29.1C62.2 31.1 62.8 34.9 63.6 37.9C64.3 40.8 64.7 43 64.7 46.7C64.7 50.3 64.9 56.4 63.6 59.9C62.2 63.4 58.9 66.1 56.8 67.8C54.7 69.5 53.4 70 51 70C48.7 70 45.4 69.5 42.8 67.8C40.2 66.1 37 63.4 35.6 59.9C34.2 56.4 34.3 50.3 34.3 46.7C34.3 43 34.7 40.8 35.6 37.9C36.4 34.9 36.8 31.1 39.3 29.1C41.9 27.1 47.3 26 50.8 26Z" />
        </clipPath>
        <clipPath id={`${id}-t`}>
          <path d="M6 118V112C8 97 20 87 37 82.5L44 80H56L63 82.5C80 87 92 97 94 112V118Z" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id}-v)`}>
        <rect x="0" y="0" width="100" height="112" fill="#f4ecd8" />
        <path
          d="M0 2H100M0 5H100M0 8H100M0 11H100M0 14H100M0 17H100M0 20H100M0 23H100M0 26H100M0 29H100M0 32H100M0 35H100M0 38H100M0 41H100M0 44H100M0 47H100M0 50H100M0 53H100M0 56H100M0 59H100M0 62H100M0 65H100M0 68H100M0 71H100M0 74H100M0 77H100M0 80H100M0 83H100M0 86H100M0 89H100M0 92H100M0 95H100M0 98H100M0 101H100M0 104H100M0 107H100M0 110H100"
          fill="none"
          stroke="#1e2130"
          strokeWidth="0.45"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity=".26"
        />
        <circle cx="50" cy="55" r="42" fill="#5fa8b5" />
        <circle cx="50" cy="55" r="37.5" fill="none" stroke="#f4ecd8" strokeWidth=".9" opacity=".5" />
        <circle cx="50" cy="55" r="33.5" fill="none" stroke="#f4ecd8" strokeWidth=".7" opacity=".35" />
        <g transform="translate(0 -4)">
          <path d="M6 118V112C8 97 20 87 37 82.5L44 80H56L63 82.5C80 87 92 97 94 112V118Z" fill="#26365a" />
          <g clipPath={`url(#${id}-t)`}>
            <path d="M42 80.6L50 92L45 97L36 86ZM58 80.6L50 92L55 97L64 86Z" fill="#1b263f" />
            <circle cx="44.4" cy="101" r="1.5" fill="#d4a440" />
            <circle cx="55.6" cy="101" r="1.5" fill="#d4a440" />
            <circle cx="44.4" cy="108" r="1.5" fill="#d4a440" />
            <circle cx="55.6" cy="108" r="1.5" fill="#d4a440" />
            <path
              d="M58 80l-14 32M61 80l-14 32M64 80l-14 32M67 80l-14 32M70 80l-14 32M73 80l-14 32M76 80l-14 32M79 80l-14 32M82 80l-14 32M85 80l-14 32M88 80l-14 32M91 80l-14 32M94 80l-14 32M97 80l-14 32M100 80l-14 32M103 80l-14 32"
              fill="none"
              stroke="#1e2130"
              strokeWidth="0.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.3"
            />
          </g>
        </g>
        <path d="M45.3 61V80Q51.3 83 57.3 80V61Z" fill="#c08a64" />
        <path d="M45.3 64Q51.3 74 57.3 64V70Q51.3 78 45.3 70Z" fill="#9a6e50" />
        <path
          d="M39 79.4C44 83.6 56 83.6 61 79.4L62 85C56 89.4 44 89.4 38 85Z"
          fill="#b8432f"
          transform="translate(0 -4)"
        />
        <path d="M53 86L58.4 86.8L57 104L52.4 103Z" fill="#b8432f" transform="translate(0 -4)" />
        <path
          d="M53 92l5 .6M52.8 97l4.6 .6"
          fill="none"
          stroke="#f4ecd8"
          strokeWidth="0.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity=".6"
          transform="translate(0 -4)"
        />
        <ellipse cx="33.7" cy="48.4" rx="3.4" ry="5.6" fill="#c08a64" />
        <path
          d="M34.5 45.8q-1.8 2.6 0 5.4"
          fill="none"
          stroke="#1e2130"
          strokeWidth="0.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity=".6"
        />
        <path
          d="M50.8 26C54.2 26 57.9 27.1 60 29.1C62.2 31.1 62.8 34.9 63.6 37.9C64.3 40.8 64.7 43 64.7 46.7C64.7 50.3 64.9 56.4 63.6 59.9C62.2 63.4 58.9 66.1 56.8 67.8C54.7 69.5 53.4 70 51 70C48.7 70 45.4 69.5 42.8 67.8C40.2 66.1 37 63.4 35.6 59.9C34.2 56.4 34.3 50.3 34.3 46.7C34.3 43 34.7 40.8 35.6 37.9C36.4 34.9 36.8 31.1 39.3 29.1C41.9 27.1 47.3 26 50.8 26Z"
          fill="#c08a64"
        />
        <g clipPath={`url(#${id}-f)`}>
          <path
            d="M29.3 52l-3 15M31.5 52l-3 15M33.7 52l-3 15M35.9 52l-3 15M38.1 52l-3 15M40.3 52l-3 15"
            fill="none"
            stroke="#1e2130"
            strokeWidth="0.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.34"
          />
          <path
            d="M40.3 32l-2 9M42.5 32l-2 9M44.7 32l-2 9M46.9 32l-2 9"
            fill="none"
            stroke="#1e2130"
            strokeWidth="0.55"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.2"
          />
        </g>
        <path d="M48.5 43.6Q43.9 40 38.9 43.6L38.9 41.4Q43.9 37.8 48.5 41.6Z" fill="#6f6e69" />
        <path
          d="M42.3 39.6l-1 -1.6M44.9 39.4l.4 -1.8M38.9 42l-1.6 -1"
          fill="none"
          stroke="#6f6e69"
          strokeWidth="0.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M40.3 48Q43.9 46.6 47.5 48Q43.9 48.8 40.3 48Z" fill="#1e2130" />
        <path
          d="M40.3 49.6Q43.9 50.6 47.5 49.4"
          fill="none"
          stroke="#1e2130"
          strokeWidth="0.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity=".55"
        />
        <path d="M54.1 43.6Q58.7 40 63.7 43.6L63.7 41.4Q58.7 37.8 54.1 41.6Z" fill="#6f6e69" />
        <path
          d="M57.1 39.6l-1 -1.6M59.7 39.4l.4 -1.8M63.7 42l1.6 -1"
          fill="none"
          stroke="#6f6e69"
          strokeWidth="0.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M55.3 48Q58.1 46.6 60.9 48Q58.1 48.8 55.3 48Z" fill="#1e2130" />
        <path
          d="M55.3 49.6Q58.1 50.6 60.9 49.4"
          fill="none"
          stroke="#1e2130"
          strokeWidth="0.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity=".55"
        />
        <path
          d="M51.9 50.2Q52.1 54.6 49.1 57.6Q52.5 59.6 55.9 57.6"
          fill="none"
          stroke="#1e2130"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M50.1 57.4a1.1 .7 0 1 0 1.6 0z M53.3 57.4a1.1 .7 0 1 0 1.6 0z" fill="#1e2130" opacity=".7" />
        <path
          d="M43.7 57.4Q42.3 61.8 44.9 65M58.9 57.4Q60.3 61.8 57.7 65"
          fill="none"
          stroke="#1e2130"
          strokeWidth="0.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity=".5"
        />
        <path
          d="M44.3 37.6Q51.3 36 58.3 37.6M46.3 34.8Q51.3 33.6 56.3 34.8"
          fill="none"
          stroke="#1e2130"
          strokeWidth="0.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity=".45"
        />
        <path
          d="M38.9 47l-2 -1M38.9 48.6l-2.2 .2M38.9 50l-1.8 1.2"
          fill="none"
          stroke="#1e2130"
          strokeWidth="0.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.45"
        />
        <path
          d="M63.7 47l2 -1M63.7 48.6l2.2 .2M63.7 50l1.8 1.2"
          fill="none"
          stroke="#1e2130"
          strokeWidth="0.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.45"
        />
        <path
          d="M34.6 50C34 76 45.3 84 52.3 85C59.3 84 64.4 74 63.4 50C59.3 60.4 55.3 61.4 51.3 60.2C47.3 61.4 43.3 60.4 34.6 50Z"
          fill="#c2c1bb"
        />
        <path
          d="M39.3 64q-1.4 4 0 8M42.3 64.6q1.4 4 0 8M45.3 65.2q-1.4 4 0 8M48.3 65.8q1.4 4 0 8M51.3 66.4q-1.4 4 0 8M54.3 65.8q1.4 4 0 8M57.3 65.2q-1.4 4 0 8M60.3 64.6q1.4 4 0 8M63.3 64q-1.4 4 0 8"
          fill="none"
          stroke="#1e2130"
          strokeWidth="0.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity=".4"
        />
        <path
          d="M45.1 62C48.3 58.8 51.3 60.4 51.7 61.4C52.3 60.4 55.3 58.8 58.3 62.2C55.3 63.4 53.3 62.8 51.7 62.8C49.3 62.8 47.3 63.4 45.1 62Z"
          fill="#d1d1cc"
        />
        <path d="M48.3 64Q51.3 66 54.7 64Z" fill="#90684b" />
        <path
          d="M48.3 64.2Q51.3 65.2 54.7 64"
          fill="none"
          stroke="#1e2130"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M35.4 40C33.6 46 34 53 36.4 58L38.4 56C37.4 51 37.6 45 38.6 40.6Z" fill="#aaa9a5" />
        <path d="M64.6 40C66.4 46 66 53 63.6 58L61.6 56C62.6 51 62.4 45 61.4 40.6Z" fill="#aaa9a5" />
        <path
          d="M36 43l.4 9M64 43l-.4 9"
          fill="none"
          stroke="#1e2130"
          strokeWidth="0.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity=".4"
        />
        <path d="M31.2 31C30.4 22 39.2 15 50.8 15C62.4 15 71.2 22 70.4 31Z" fill="#f1ede2" />
        <path d="M50.8 15C62.4 15 71.2 22 70.4 31H58.8C59.8 23.6 56.8 17.6 50.8 15Z" fill="rgba(30,33,48,.12)" />
        <rect x="34.2" y="31" width="33.2" height="6.8" fill="#1f2b4a" />
        <path d="M33.8 37.6Q51.2 44 67.8 37.6L67 35.2Q50.8 40.6 34.6 35.2Z" fill="#1e2130" />
        <path
          d="M34.8 37Q50.8 40.8 66.8 37"
          fill="none"
          stroke="#d4a440"
          strokeWidth="0.9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="50.8" cy="34.2" r="3" fill="#d4a440" />
        <path
          d="M50.8 32.6v3.2M49.4 34.8h2.8"
          fill="none"
          stroke="#1e2130"
          strokeWidth="0.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <rect x="0" y="0" width="100" height="112" fill={`url(#${id}-tx-grano)`} opacity=".55" />
      </g>
      <rect x=".5" y=".5" width="99" height="111" fill="none" stroke="#1e2130" strokeWidth=".9" opacity=".55" />
    </>
  );
}
