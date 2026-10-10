import { useId } from "react";

// Original artwork drawn for this project (the version-2 mockup of proposal B, «El
// cuaderno del viajero»), exported by scripts/adventure-art.ts: edit the mockup
// and run `npm run adventure:art` again instead of editing this file by hand.
//
// The engraved portrait of valeria-soto, drawn inside a 100 x 112 box: the host
// provides the <svg> (and may crop it). Its clip paths and patterns take ids
// from `useId`, so the same portrait can be on a page twice.

export function ValeriaSotoPortrait() {
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
          <path d="M50 24C53.1 24 57.2 25.2 59.3 27.4C61.4 29.6 62 33.9 62.6 37.1C63.2 40.3 63.5 42.8 63.2 46.8C62.9 50.8 62.4 57.4 61 61.3C59.6 65.3 56.8 68.4 55 70.3C53.2 72.2 51.7 72.5 50 72.5C48.3 72.5 46.8 72.2 45 70.3C43.2 68.4 40.4 65.3 39 61.3C37.6 57.4 37.1 50.8 36.8 46.8C36.5 42.8 36.8 40.3 37.4 37.1C38 33.9 38.6 29.6 40.7 27.4C42.8 25.2 46.9 24 50 24Z" />
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
        <circle cx="50" cy="55" r="42" fill="#e76f51" />
        <circle cx="50" cy="55" r="37.5" fill="none" stroke="#f4ecd8" strokeWidth=".9" opacity=".5" />
        <circle cx="50" cy="55" r="33.5" fill="none" stroke="#f4ecd8" strokeWidth=".7" opacity=".35" />
        <path
          d="M31.9 46C30.9 28 40 20 50 20C60 20 69.1 28 68.1 46L69.4 63.5C67.1 67.5 60 68 58 66V52H42V66C40 68 32.9 67.5 30.6 63.5Z"
          fill="#6b4630"
        />
        <g transform="translate(0 -4)">
          <path d="M6 118V112C8 97 20 87 37 82.5L44 80H56L63 82.5C80 87 92 97 94 112V118Z" fill="#c8432f" />
          <g clipPath={`url(#${id}-t)`}>
            <path d="M41.6 80C44 83.8 56 83.8 58.4 80L60.6 84.4C57 88.2 43 88.2 39.4 84.4Z" fill="#903022" />
            <path
              d="M50 87.4V118"
              fill="none"
              stroke="#1e2130"
              strokeWidth="0.9"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity=".55"
            />
            <rect x="48.8" y="89" width="2.4" height="4" fill="#d9d2c3" />
            <g transform="translate(63 99) scale(.8)">
              <path
                d="M-4 0h8l-.6 -2h-6.8zM-3 -2V-7h6V-2ZM-3.6 -7v-3h1.4v1.4h1.4V-10h1.6v1.4h1.4V-10h1.4v3z"
                fill="#f6efe0"
              />
            </g>
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
        <path d="M44.6 63.5V80Q50 83 55.4 80V63.5Z" fill="#d4a07a" />
        <path d="M44.6 66.5Q50 76.5 55.4 66.5V72.5Q50 80.5 44.6 72.5Z" fill="#aa8062" />
        <ellipse cx="36.2" cy="48.4" rx="3.4" ry="5.6" fill="#d4a07a" />
        <path
          d="M37 45.8q-1.8 2.6 0 5.4"
          fill="none"
          stroke="#1e2130"
          strokeWidth="0.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity=".6"
        />
        <ellipse cx="63.8" cy="48.4" rx="3.4" ry="5.6" fill="#d4a07a" />
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
          d="M50 24C53.1 24 57.2 25.2 59.3 27.4C61.4 29.6 62 33.9 62.6 37.1C63.2 40.3 63.5 42.8 63.2 46.8C62.9 50.8 62.4 57.4 61 61.3C59.6 65.3 56.8 68.4 55 70.3C53.2 72.2 51.7 72.5 50 72.5C48.3 72.5 46.8 72.2 45 70.3C43.2 68.4 40.4 65.3 39 61.3C37.6 57.4 37.1 50.8 36.8 46.8C36.5 42.8 36.8 40.3 37.4 37.1C38 33.9 38.6 29.6 40.7 27.4C42.8 25.2 46.9 24 50 24Z"
          fill="#d4a07a"
        />
        <g clipPath={`url(#${id}-f)`}>
          <path
            d="M59 51.4l3 15M61.2 51.4l3 15M63.4 51.4l3 15M65.6 51.4l3 15M67.8 51.4l3 15M70 51.4l3 15"
            fill="none"
            stroke="#1e2130"
            strokeWidth="0.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.34"
          />
          <path
            d="M61 30l2 9M63.2 30l2 9M65.4 30l2 9M67.6 30l2 9"
            fill="none"
            stroke="#1e2130"
            strokeWidth="0.55"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.2"
          />
        </g>
        <path
          d="M47.6 43.6Q43 40.2 38 41.9"
          fill="none"
          stroke="#1e2130"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M39.4 47.6L46.6 46.9Q43 49.5 39.4 47.6Z" fill="#1e2130" />
        <circle cx="43.4" cy="47.5" r="0.6" fill="#f4ecd8" />
        <path
          d="M52.4 43.6Q57 40.2 62 41.9"
          fill="none"
          stroke="#1e2130"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M53.4 47.6L60.6 46.9Q57 49.5 53.4 47.6Z" fill="#1e2130" />
        <circle cx="57.4" cy="47.5" r="0.6" fill="#f4ecd8" />
        <path
          d="M50.4 49.2Q49.4 54 48.2 55.8Q50 57.3 51.6 55.8"
          fill="none"
          stroke="#1e2130"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M45.6 63.6Q50 62.2 54.4 63.6Q50 66.8 45.6 63.6Z" fill="#a8453c" opacity=".85" />
        <path
          d="M45.6 64Q50 64.8 54.4 64"
          fill="none"
          stroke="#1e2130"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M37 41.5C37 30.5 42.4 25 50 25C57.6 25 63 30.5 63 41.5C61 38.8 58.2 37.6 55.6 38.6C53 36.4 49.6 36 46.6 37.4C43.4 36.2 39.6 37.8 37 41.5Z"
          fill="#6b4630"
        />
        <path
          d="M34.4 47Q33.6 56 35 62M65.6 47Q66.4 56 65 62M41 30Q46 26.6 52 27M45 37.4l1.6 -6M50 36.6l.4 -7M55.6 38.4l-1 -6.4"
          fill="none"
          stroke="#f4ecd8"
          strokeWidth="0.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity=".55"
        />
        <rect x="0" y="0" width="100" height="112" fill={`url(#${id}-tx-grano)`} opacity=".55" />
      </g>
      <rect x=".5" y=".5" width="99" height="111" fill="none" stroke="#1e2130" strokeWidth=".9" opacity=".55" />
    </>
  );
}
