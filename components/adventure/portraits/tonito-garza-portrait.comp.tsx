import { useId } from "react";

// Original artwork drawn for this project (the version-2 mockup of proposal B, «El
// cuaderno del viajero»), exported by scripts/adventure-art.ts: edit the mockup
// and run `npm run adventure:art` again instead of editing this file by hand.
//
// The engraved portrait of tonito-garza, drawn inside a 100 x 112 box: the host
// provides the <svg> (and may crop it). Its clip paths and patterns take ids
// from `useId`, so the same portrait can be on a page twice.

export function TonitoGarzaPortrait() {
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
          <path d="M50 30C53.4 30 57.8 31.1 60.1 33.1C62.3 35.1 62.7 38.5 63.6 42C64.5 45.6 65.3 50.8 65.2 54.5C65.1 58.2 64.5 61.3 63.2 64.3C61.9 67.2 59.6 70.6 57.4 72.3C55.2 74 52.5 74.5 50 74.5C47.5 74.5 44.8 74 42.6 72.3C40.4 70.6 38.1 67.2 36.8 64.3C35.5 61.3 34.9 58.2 34.8 54.5C34.7 50.8 35.5 45.6 36.4 42C37.3 38.5 37.7 35.1 39.9 33.1C42.2 31.1 46.6 30 50 30Z" />
        </clipPath>
        <clipPath id={`${id}-t`}>
          <path d="M17 118V112C19 99 28 90 40 86.5L45 84.5H55L60 86.5C72 90 81 99 83 112V118Z" />
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
        <circle cx="50" cy="55" r="42" fill="#90be6d" />
        <circle cx="50" cy="55" r="37.5" fill="none" stroke="#f4ecd8" strokeWidth=".9" opacity=".5" />
        <circle cx="50" cy="55" r="33.5" fill="none" stroke="#f4ecd8" strokeWidth=".7" opacity=".35" />
        <g transform="translate(0 0)">
          <path d="M17 118V112C19 99 28 90 40 86.5L45 84.5H55L60 86.5C72 90 81 99 83 112V118Z" fill="#2f8a4c" />
          <g clipPath={`url(#${id}-t)`}>
            <path d="M40.6 85.6L50 94.4L59.4 85.6L57 84.4L50 90.6L43 84.4Z" fill="#f3efe4" />
            <rect x="24" y="99" width="52" height="3" fill="#f3efe4" opacity=".85" />
            <text
              x="38"
              y="112"
              textAnchor="middle"
              fontFamily="IBM Plex Mono, monospace"
              fontSize="8"
              fontWeight="600"
              fill="#f3efe4"
            >
              9
            </text>
            <path
              d="M60 104l3 -3 3 3-3 3z"
              fill="none"
              stroke="#f3efe4"
              strokeWidth="0.9"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M58 80l-14 32M61 80l-14 32M64 80l-14 32M67 80l-14 32M70 80l-14 32M73 80l-14 32M76 80l-14 32M79 80l-14 32M82 80l-14 32M85 80l-14 32M88 80l-14 32M91 80l-14 32M94 80l-14 32M97 80l-14 32M100 80l-14 32M103 80l-14 32"
              fill="none"
              stroke="#1e2130"
              strokeWidth="0.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.42"
            />
          </g>
        </g>
        <path d="M45 65.5V85Q50 87 55 85V65.5Z" fill="#d9a17b" />
        <path d="M45 68.5Q50 78.5 55 68.5V74.5Q50 82.5 45 74.5Z" fill="#ae8162" />
        <ellipse cx="34.2" cy="53" rx="4.2" ry="6" fill="#d9a17b" />
        <path
          d="M35 50.4q-1.8 2.6 0 5.4"
          fill="none"
          stroke="#1e2130"
          strokeWidth="0.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity=".6"
        />
        <ellipse cx="65.8" cy="53" rx="4.2" ry="6" fill="#d9a17b" />
        <path
          d="M65 50.4q1.8 2.6 0 5.4"
          fill="none"
          stroke="#1e2130"
          strokeWidth="0.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity=".6"
        />
        <path
          d="M50 30C53.4 30 57.8 31.1 60.1 33.1C62.3 35.1 62.7 38.5 63.6 42C64.5 45.6 65.3 50.8 65.2 54.5C65.1 58.2 64.5 61.3 63.2 64.3C61.9 67.2 59.6 70.6 57.4 72.3C55.2 74 52.5 74.5 50 74.5C47.5 74.5 44.8 74 42.6 72.3C40.4 70.6 38.1 67.2 36.8 64.3C35.5 61.3 34.9 58.2 34.8 54.5C34.7 50.8 35.5 45.6 36.4 42C37.3 38.5 37.7 35.1 39.9 33.1C42.2 31.1 46.6 30 50 30Z"
          fill="#d9a17b"
        />
        <g clipPath={`url(#${id}-f)`}>
          <path
            d="M59 56.2l3 15M61.2 56.2l3 15M63.4 56.2l3 15M65.6 56.2l3 15M67.8 56.2l3 15M70 56.2l3 15"
            fill="none"
            stroke="#1e2130"
            strokeWidth="0.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.34"
          />
          <path
            d="M61 36l2 9M63.2 36l2 9M65.4 36l2 9M67.6 36l2 9"
            fill="none"
            stroke="#1e2130"
            strokeWidth="0.55"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.2"
          />
          <circle cx="41.6" cy="60.8" r="3.6" fill="#e07a5f" opacity=".32" />
          <circle cx="58.4" cy="60.8" r="3.6" fill="#e07a5f" opacity=".32" />
        </g>
        <path
          d="M47.4 45Q43 44.2 38.2 47"
          fill="none"
          stroke="#1e2130"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <ellipse cx="43" cy="52.2" rx="3.6" ry="3.6" fill="#fbf8f0" />
        <ellipse cx="43" cy="52.2" rx="3.6" ry="3.6" fill="none" stroke="#1e2130" strokeWidth=".8" />
        <circle cx="43.3" cy="52.5" r="1.9" fill="#1e2130" />
        <circle cx="43.9" cy="51.7" r="0.7" fill="#f4ecd8" />
        <path
          d="M52.6 45Q57 44.2 61.8 47"
          fill="none"
          stroke="#1e2130"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <ellipse cx="57" cy="52.2" rx="3.6" ry="3.6" fill="#fbf8f0" />
        <ellipse cx="57" cy="52.2" rx="3.6" ry="3.6" fill="none" stroke="#1e2130" strokeWidth=".8" />
        <circle cx="57.3" cy="52.5" r="1.9" fill="#1e2130" />
        <circle cx="57.9" cy="51.7" r="0.7" fill="#f4ecd8" />
        <path
          d="M48.2 57.2Q50 59.4 51.8 57.2"
          fill="none"
          stroke="#1e2130"
          strokeWidth="1.1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="48.8" cy="57.4" r="0.5" fill="#1e2130" />
        <circle cx="51.2" cy="57.4" r="0.5" fill="#1e2130" />
        <path d="M45.2 65.2Q50 71.4 54.8 65.2Q50 66.2 45.2 65.2Z" fill="#1e2130" />
        <rect x="48" y="65.5" width="1.9" height="2.8" fill="#fbf8f0" />
        <rect x="50.1" y="65.5" width="1.9" height="2.8" fill="#fbf8f0" />
        <path
          d="M50 65.5v2.8"
          fill="none"
          stroke="#1e2130"
          strokeWidth="0.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <g transform="rotate(-14 50 55.6)">
          <rect x="44.4" y="54.2" width="11.2" height="2.8" fill="#e8c7a0" />
          <rect x="48.4" y="54.2" width="3.2" height="2.8" fill="#d9b088" />
          <circle cx="46.4" cy="55.6" r="0.4" fill="#a8825a" />
          <circle cx="53.6" cy="55.6" r="0.4" fill="#a8825a" />
        </g>
        <path
          d="M34 50L32.4 39L36 36L36.6 28L40 33L44 24.4L47 31L51 23.6L54 31.4L58 25.4L60 33L64 28.4L63 36L67.4 36.6L66 42L65.6 50C63 42 56 39 50 40.4C44 39 37 42 34 50Z"
          fill="#191617"
        />
        <path
          d="M44 33l3 -3M52 31l2 -3M58 34l2 -3"
          fill="none"
          stroke="#f4ecd8"
          strokeWidth="0.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity=".5"
        />
        <path d="M48 39.6l3 4 1 -4 3 3 0 -4z" fill="#191617" />
        <rect x="0" y="0" width="100" height="112" fill={`url(#${id}-tx-grano)`} opacity=".55" />
      </g>
      <rect x=".5" y=".5" width="99" height="111" fill="none" stroke="#1e2130" strokeWidth=".9" opacity=".55" />
    </>
  );
}
