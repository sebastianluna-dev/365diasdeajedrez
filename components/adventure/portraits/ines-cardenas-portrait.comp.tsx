import { useId } from "react";

// Original artwork drawn for this project (the version-2 mockup of proposal B, «El
// cuaderno del viajero»), exported by scripts/adventure-art.ts: edit the mockup
// and run `npm run adventure:art` again instead of editing this file by hand.
//
// The engraved portrait of ines-cardenas, drawn inside a 100 x 112 box: the host
// provides the <svg> (and may crop it). Its clip paths and patterns take ids
// from `useId`, so the same portrait can be on a page twice.

export function InesCardenasPortrait() {
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
          <path d="M50 23.5C53.1 23.5 57.2 24.7 59.3 26.9C61.4 29.1 62 33.5 62.6 36.7C63.2 40 63.5 42.4 63.2 46.5C62.9 50.6 62.2 57.3 60.8 61.2C59.4 65.2 56.8 68.4 55 70.3C53.2 72.2 51.7 72.5 50 72.5C48.3 72.5 46.8 72.2 45 70.3C43.2 68.4 40.6 65.2 39.2 61.2C37.8 57.3 37.1 50.6 36.8 46.5C36.5 42.4 36.8 40 37.4 36.7C38 33.5 38.6 29.1 40.7 26.9C42.8 24.7 46.9 23.5 50 23.5Z" />
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
        <circle cx="50" cy="55" r="42" fill="#6d8fb5" />
        <circle cx="50" cy="55" r="37.5" fill="none" stroke="#f4ecd8" strokeWidth=".9" opacity=".5" />
        <circle cx="50" cy="55" r="33.5" fill="none" stroke="#f4ecd8" strokeWidth=".7" opacity=".35" />
        <path d="M60.6 38C67.6 43 67.6 53 64 58L60.6 51Z" fill="#a4532e" />
        <g transform="translate(0 -4)">
          <path d="M6 118V112C8 97 20 87 37 82.5L44 80H56L63 82.5C80 87 92 97 94 112V118Z" fill="#2c3c66" />
          <g clipPath={`url(#${id}-t)`}>
            <path
              d="M35.4 84.6C37.6 79.6 43.4 78.4 50 80.2C56.6 78.4 62.4 79.6 64.6 84.6C58.6 88.6 41.4 88.6 35.4 84.6Z"
              fill="#212d4d"
            />
            <path
              d="M46.4 86.6V97M53.6 86.6V97"
              fill="none"
              stroke="#f4ecd8"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="46.4" cy="97.6" r="1" fill="#f4ecd8" />
            <circle cx="53.6" cy="97.6" r="1" fill="#f4ecd8" />
            <path
              d="M33.5 94v5.5a3.2 3.2 0 0 0 6.4 0v-5.5"
              fill="none"
              stroke="#f4ecd8"
              strokeWidth="1.6"
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
        <path d="M44.6 63.5V80Q50 83 55.4 80V63.5Z" fill="#b07850" />
        <path d="M44.6 66.5Q50 76.5 55.4 66.5V72.5Q50 80.5 44.6 72.5Z" fill="#8d6040" />
        <ellipse cx="36.2" cy="48.4" rx="3.4" ry="5.6" fill="#b07850" />
        <path
          d="M37 45.8q-1.8 2.6 0 5.4"
          fill="none"
          stroke="#1e2130"
          strokeWidth="0.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity=".6"
        />
        <ellipse cx="63.8" cy="48.4" rx="3.4" ry="5.6" fill="#b07850" />
        <path
          d="M63 45.8q1.8 2.6 0 5.4"
          fill="none"
          stroke="#1e2130"
          strokeWidth="0.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity=".6"
        />
        <path
          d="M50 23.5C53.1 23.5 57.2 24.7 59.3 26.9C61.4 29.1 62 33.5 62.6 36.7C63.2 40 63.5 42.4 63.2 46.5C62.9 50.6 62.2 57.3 60.8 61.2C59.4 65.2 56.8 68.4 55 70.3C53.2 72.2 51.7 72.5 50 72.5C48.3 72.5 46.8 72.2 45 70.3C43.2 68.4 40.6 65.2 39.2 61.2C37.8 57.3 37.1 50.6 36.8 46.5C36.5 42.4 36.8 40 37.4 36.7C38 33.5 38.6 29.1 40.7 26.9C42.8 24.7 46.9 23.5 50 23.5Z"
          fill="#b07850"
        />
        <g clipPath={`url(#${id}-f)`}>
          <path
            d="M59 51l3 15M61.2 51l3 15M63.4 51l3 15M65.6 51l3 15M67.8 51l3 15M70 51l3 15"
            fill="none"
            stroke="#1e2130"
            strokeWidth="0.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.34"
          />
          <path
            d="M61 29.5l2 9M63.2 29.5l2 9M65.4 29.5l2 9M67.6 29.5l2 9"
            fill="none"
            stroke="#1e2130"
            strokeWidth="0.55"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.2"
          />
          <circle cx="39.8" cy="51.6" r="0.5" fill="#7a3f22" opacity=".75" />
          <circle cx="57.3" cy="52.5" r="0.5" fill="#7a3f22" opacity=".75" />
          <circle cx="40.2" cy="51.6" r="0.5" fill="#7a3f22" opacity=".75" />
          <circle cx="53.2" cy="53.6" r="0.5" fill="#7a3f22" opacity=".75" />
          <circle cx="46.7" cy="55.8" r="0.5" fill="#7a3f22" opacity=".75" />
          <circle cx="54.7" cy="52.6" r="0.5" fill="#7a3f22" opacity=".75" />
          <circle cx="40.5" cy="53.6" r="0.5" fill="#7a3f22" opacity=".75" />
          <circle cx="53.4" cy="55" r="0.5" fill="#7a3f22" opacity=".75" />
          <circle cx="40.7" cy="53.5" r="0.5" fill="#7a3f22" opacity=".75" />
          <circle cx="56" cy="54.2" r="0.5" fill="#7a3f22" opacity=".75" />
          <circle cx="43.2" cy="53.1" r="0.5" fill="#7a3f22" opacity=".75" />
          <circle cx="56.1" cy="55.1" r="0.5" fill="#7a3f22" opacity=".75" />
          <circle cx="41" cy="55.1" r="0.5" fill="#7a3f22" opacity=".75" />
          <circle cx="53.1" cy="54.9" r="0.5" fill="#7a3f22" opacity=".75" />
          <circle cx="42.3" cy="53.6" r="0.5" fill="#7a3f22" opacity=".75" />
          <circle cx="57.9" cy="53.1" r="0.5" fill="#7a3f22" opacity=".75" />
        </g>
        <path
          d="M47.6 42.6Q43 39.8 38 41.8"
          fill="none"
          stroke="#1e2130"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M39.4 47.2L46.6 46.5Q43 49.1 39.4 47.2Z" fill="#1e2130" />
        <circle cx="43.4" cy="47.1" r="0.6" fill="#f4ecd8" />
        <path
          d="M52.4 42.6Q57 39.8 62 41.8"
          fill="none"
          stroke="#1e2130"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M53.4 47.2L60.6 46.5Q57 49.1 53.4 47.2Z" fill="#1e2130" />
        <circle cx="57.4" cy="47.1" r="0.6" fill="#f4ecd8" />
        <path
          d="M50.4 48.8Q49.4 53.5 48.2 55.3Q50 56.8 51.6 55.3"
          fill="none"
          stroke="#1e2130"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M45.6 63.4Q50 62 54.4 63.4Q50 66.6 45.6 63.4Z" fill="#a8453c" opacity=".85" />
        <path
          d="M45.6 63.8Q50 64.6 54.4 63.8"
          fill="none"
          stroke="#1e2130"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M36.8 46C35.8 31 41 22.9 50 22.9C59 22.9 64.2 31 63.2 46C61.8 39.6 60.2 35.2 55.4 33.6C52.6 32.8 50 33.6 47.6 35C44 33.6 38.4 36.8 36.8 46Z"
          fill="#a4532e"
        />
        <path
          d="M39 36Q42 29 49 27M52 27.6Q59 28.6 62 36"
          fill="none"
          stroke="#f4ecd8"
          strokeWidth="0.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity=".55"
        />
        <ellipse
          cx="61.9"
          cy="56"
          rx="3.7"
          ry="4.6"
          fill="#a4532e"
          stroke="#1e2130"
          strokeWidth=".55"
          strokeOpacity=".5"
          transform="rotate(-28 61.9 56)"
        />
        <ellipse
          cx="64.8"
          cy="61.4"
          rx="3.7"
          ry="4.6"
          fill="#a4532e"
          stroke="#1e2130"
          strokeWidth=".55"
          strokeOpacity=".5"
          transform="rotate(28 64.8 61.4)"
        />
        <ellipse
          cx="63.3"
          cy="66.8"
          rx="3.7"
          ry="4.6"
          fill="#a4532e"
          stroke="#1e2130"
          strokeWidth=".55"
          strokeOpacity=".5"
          transform="rotate(-28 63.3 66.8)"
        />
        <ellipse
          cx="66.2"
          cy="72.2"
          rx="3.7"
          ry="4.6"
          fill="#a4532e"
          stroke="#1e2130"
          strokeWidth=".55"
          strokeOpacity=".5"
          transform="rotate(28 66.2 72.2)"
        />
        <ellipse
          cx="64.7"
          cy="77.6"
          rx="3.7"
          ry="4.6"
          fill="#a4532e"
          stroke="#1e2130"
          strokeWidth=".55"
          strokeOpacity=".5"
          transform="rotate(-28 64.7 77.6)"
        />
        <ellipse
          cx="67.6"
          cy="83"
          rx="3.7"
          ry="4.6"
          fill="#a4532e"
          stroke="#1e2130"
          strokeWidth=".55"
          strokeOpacity=".5"
          transform="rotate(28 67.6 83)"
        />
        <ellipse
          cx="66.1"
          cy="88.4"
          rx="3.7"
          ry="4.6"
          fill="#a4532e"
          stroke="#1e2130"
          strokeWidth=".55"
          strokeOpacity=".5"
          transform="rotate(-28 66.1 88.4)"
        />
        <ellipse
          cx="69"
          cy="93.8"
          rx="3.7"
          ry="4.6"
          fill="#a4532e"
          stroke="#1e2130"
          strokeWidth=".55"
          strokeOpacity=".5"
          transform="rotate(28 69 93.8)"
        />
        <rect x="65.6" y="97.4" width="4.6" height="2.2" fill="#d4a440" />
        <path d="M66 99.6l-1.6 6.4 3.4 -1.4 2 1.2 -.8 -6.2z" fill="#a4532e" />
        <circle cx="36" cy="54.6" r="1.4" fill="#d4a440" />
        <circle cx="64" cy="54.6" r="1.4" fill="#d4a440" />
        <rect x="0" y="0" width="100" height="112" fill={`url(#${id}-tx-grano)`} opacity=".55" />
      </g>
      <rect x=".5" y=".5" width="99" height="111" fill="none" stroke="#1e2130" strokeWidth=".9" opacity=".55" />
    </>
  );
}
