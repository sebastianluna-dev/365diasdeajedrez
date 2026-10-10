import { useId } from "react";

// Original artwork drawn for this project (the version-2 mockup of proposal B, «El
// cuaderno del viajero»), exported by scripts/adventure-art.ts: edit the mockup
// and run `npm run adventure:art` again instead of editing this file by hand.
//
// The engraved portrait of julian-esparza, drawn inside a 100 x 112 box: the host
// provides the <svg> (and may crop it). Its clip paths and patterns take ids
// from `useId`, so the same portrait can be on a page twice.

export function JulianEsparzaPortrait() {
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
          <path d="M49.6 23C52.9 23 57.6 24.3 59.9 26.5C62.2 28.8 62.7 33.3 63.4 36.6C64 40 64 42.5 63.8 46.7C63.6 50.9 63.3 57.8 62 61.9C60.7 66 58.2 69.4 56.1 71.3C54 73.2 51.5 73.5 49.5 73.5C47.5 73.5 45.9 73.2 44.1 71.3C42.2 69.4 39.6 66 38.4 61.9C37.1 57.8 36.8 50.9 36.6 46.7C36.4 42.5 36.4 40 37 36.6C37.6 33.3 38.3 28.8 40.4 26.5C42.5 24.3 46.4 23 49.6 23Z" />
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
        <circle cx="50" cy="55" r="42" fill="#2b2d42" />
        <circle cx="50" cy="55" r="37.5" fill="none" stroke="#f4ecd8" strokeWidth=".9" opacity=".5" />
        <circle cx="50" cy="55" r="33.5" fill="none" stroke="#f4ecd8" strokeWidth=".7" opacity=".35" />
        <path
          d="M62.2 34C68.2 40 71.2 52 71.2 66C71.2 74 68.2 80 65.2 84L63.2 82C66.2 70 65.2 54 61.2 44Z"
          fill="#f2eee5"
        />
        <path
          d="M66.2 48Q69.2 62 67.2 78M64.2 52Q66.2 64 65.2 74"
          fill="none"
          stroke="#1e2130"
          strokeWidth="0.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity=".35"
        />
        <rect x="63.8" y="60" width="5" height="3" fill="#7a5236" transform="rotate(14 60 61)" />
        <g transform="translate(0 -4)">
          <path d="M6 118V112C8 97 20 87 37 82.5L44 80H56L63 82.5C80 87 92 97 94 112V118Z" fill="#7a5236" />
          <g clipPath={`url(#${id}-t)`}>
            <path d="M41 80L50 95L44 99L35 86ZM59 80L50 95L56 99L65 86Z" fill="#5c3e29" />
            <path
              d="M50 95V118"
              fill="none"
              stroke="#1e2130"
              strokeWidth="0.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity=".5"
            />
            <circle cx="47" cy="104" r="1.3" fill="#3a2618" />
            <circle cx="47" cy="112" r="1.3" fill="#3a2618" />
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
          <g transform="rotate(-6 66 99)">
            <rect x="60" y="92" width="11" height="13" fill="#c9a274" />
            <rect x="60" y="92" width="11" height="13" fill={`url(#${id}-tx-kraft)`} />
            <rect x="68.6" y="92" width="1.4" height="13" fill="#a83a2a" />
            <path
              d="M62 95h5M62 97.6h4"
              fill="none"
              stroke="#6a4a36"
              strokeWidth="0.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
          <path d="M57 99H75L74 112H58Z" fill="#68462e" />
        </g>
        <path d="M43.8 64.5V80Q49.4 83 55 80V64.5Z" fill="#c9a27e" />
        <path d="M43.8 67.5Q49.4 77.5 55 67.5V73.5Q49.4 81.5 43.8 73.5Z" fill="#a18265" />
        <path d="M37.4 72C43.4 77 55.4 77 61.4 72L62.4 80C55.4 85 43.4 85 36.4 80Z" fill="#c9963f" />
        <path d="M52.4 82L59.4 82L61.4 100L54.4 101Z" fill="#c9963f" />
        <path
          d="M37.4 75.6C43.4 80 55.4 80 62 75.6M53.4 88h7M54 94h7"
          fill="none"
          stroke="#a83a2a"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M43.4 74.4v8M49.4 76v8M55.4 74.4v8M56.8 83v17"
          fill="none"
          stroke="#a83a2a"
          strokeWidth="0.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity=".75"
        />
        <path
          d="M54.8 101l-.6 3M56.8 101l-.2 3M58.8 101l.2 3M60.8 100.6l.6 3"
          fill="none"
          stroke="#c9963f"
          strokeWidth="0.9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <ellipse cx="36" cy="48.4" rx="3.4" ry="5.6" fill="#c9a27e" />
        <path
          d="M36.8 45.8q-1.8 2.6 0 5.4"
          fill="none"
          stroke="#1e2130"
          strokeWidth="0.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity=".6"
        />
        <ellipse cx="64.4" cy="48.4" rx="3.4" ry="5.6" fill="#c9a27e" />
        <path
          d="M63.6 45.8q1.8 2.6 0 5.4"
          fill="none"
          stroke="#1e2130"
          strokeWidth="0.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity=".6"
        />
        <path
          d="M49.6 23C52.9 23 57.6 24.3 59.9 26.5C62.2 28.8 62.7 33.3 63.4 36.6C64 40 64 42.5 63.8 46.7C63.6 50.9 63.3 57.8 62 61.9C60.7 66 58.2 69.4 56.1 71.3C54 73.2 51.5 73.5 49.5 73.5C47.5 73.5 45.9 73.2 44.1 71.3C42.2 69.4 39.6 66 38.4 61.9C37.1 57.8 36.8 50.9 36.6 46.7C36.4 42.5 36.4 40 37 36.6C37.6 33.3 38.3 28.8 40.4 26.5C42.5 24.3 46.4 23 49.6 23Z"
          fill="#c9a27e"
        />
        <g clipPath={`url(#${id}-f)`}>
          <path
            d="M58.4 51.6l3 15M60.6 51.6l3 15M62.8 51.6l3 15M65 51.6l3 15M67.2 51.6l3 15M69.4 51.6l3 15"
            fill="none"
            stroke="#1e2130"
            strokeWidth="0.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.34"
          />
          <path
            d="M60.4 29l2 9M62.6 29l2 9M64.8 29l2 9M67 29l2 9"
            fill="none"
            stroke="#1e2130"
            strokeWidth="0.55"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.2"
          />
        </g>
        <path
          d="M46.8 42.4Q42.2 40.2 37.2 42.4"
          fill="none"
          stroke="#c9c4b8"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M40 47.2Q42.8 49.6 45.6 47.2"
          fill="none"
          stroke="#1e2130"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M52 42.4Q56.6 40.2 61.6 42.4"
          fill="none"
          stroke="#c9c4b8"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M53 47.2Q56.6 49.6 60.2 47.2"
          fill="none"
          stroke="#1e2130"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M50 48.8Q48.5 55.5 46.7 57.7Q48.9 59.5 51.1 57.9"
          fill="none"
          stroke="#1e2130"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M41.8 58.6Q40.4 63 43 66.2M57 58.6Q58.4 63 55.8 66.2"
          fill="none"
          stroke="#1e2130"
          strokeWidth="0.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity=".5"
        />
        <path
          d="M42.4 37Q49.4 35.4 56.4 37M44.4 34.2Q49.4 33 54.4 34.2"
          fill="none"
          stroke="#1e2130"
          strokeWidth="0.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity=".45"
        />
        <path
          d="M37.2 46.6l-2 -1M37.2 48.2l-2.2 .2M37.2 49.6l-1.8 1.2"
          fill="none"
          stroke="#1e2130"
          strokeWidth="0.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.7"
        />
        <path
          d="M61.6 46.6l2 -1M61.6 48.2l2.2 .2M61.6 49.6l1.8 1.2"
          fill="none"
          stroke="#1e2130"
          strokeWidth="0.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.7"
        />
        <path
          d="M40.4 51Q42.4 52.2 44.8 51M58.4 51Q56.4 52.2 54 51"
          fill="none"
          stroke="#1e2130"
          strokeWidth="0.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity=".5"
        />
        <path
          d="M44.7 64Q49.1 67.6 53.5 64"
          fill="none"
          stroke="#1e2130"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M43.9 63.2l.6 1M54.3 63.2l-.6 1"
          fill="none"
          stroke="#1e2130"
          strokeWidth="0.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M36.2 44C35.4 29 41 22.6 50 22.6C59 22.6 64.6 29 63.8 44C62.6 35 58 30.6 52 30C47 29.6 42 31.6 37.4 37C36.8 39 36.6 41 36.2 44Z"
          fill="#f2eee5"
        />
        <path
          d="M42 30Q47 24.6 55 25M47 29Q53 25.4 60 28M53 29.4Q58 27.4 62 31"
          fill="none"
          stroke="#1e2130"
          strokeWidth="0.55"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity=".35"
        />
        <rect x="0" y="0" width="100" height="112" fill={`url(#${id}-tx-grano)`} opacity=".55" />
      </g>
      <rect x=".5" y=".5" width="99" height="111" fill="none" stroke="#1e2130" strokeWidth=".9" opacity=".55" />
    </>
  );
}
