import { useId } from "react";

// Original artwork drawn for this project (the version-2 mockup of proposal B, «El
// cuaderno del viajero»), exported by scripts/adventure-art.ts: edit the mockup
// and run `npm run adventure:art` again instead of editing this file by hand.
//
// The engraved portrait of chayo-rios, drawn inside a 100 x 112 box: the host
// provides the <svg> (and may crop it). Its clip paths and patterns take ids
// from `useId`, so the same portrait can be on a page twice.

export function ChayoRiosPortrait() {
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
          <path d="M49.6 21.5C52.5 21.5 56.8 22.9 58.9 25.3C60.9 27.8 61.4 32.6 62 36.2C62.6 39.8 62.7 42.6 62.4 47.1C62.1 51.7 61.4 59.2 60 63.5C58.5 67.7 55.6 70.5 53.9 72.6C52.1 74.7 50.7 76 49.4 76C48.2 76 47.8 74.7 46.3 72.6C44.8 70.5 41.7 67.7 40.4 63.5C39 59.2 38.3 51.7 38 47.1C37.7 42.6 37.8 39.8 38.4 36.2C39 32.6 39.6 27.8 41.4 25.3C43.3 22.9 46.7 21.5 49.6 21.5Z" />
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
        <circle cx="50" cy="55" r="42" fill="#f4a261" />
        <circle cx="50" cy="55" r="37.5" fill="none" stroke="#f4ecd8" strokeWidth=".9" opacity=".5" />
        <circle cx="50" cy="55" r="33.5" fill="none" stroke="#f4ecd8" strokeWidth=".7" opacity=".35" />
        <path
          d="M56 24.5C61 15.5 72 14.5 76 22.5C80 31.5 78.5 45.5 72.5 57.5C72 47.5 71 38.5 66 32.5C63 29.5 60 28.5 56 29.5Z"
          fill="#1d1a1c"
        />
        <path
          d="M60 20.5Q69 17.5 73.6 25.5M64 25.1Q72 29.5 72 43.5"
          fill="none"
          stroke="#f4ecd8"
          strokeWidth="0.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity=".55"
        />
        <g transform="translate(0 -4)">
          <path d="M6 118V112C8 97 20 87 37 82.5L44 80H56L63 82.5C80 87 92 97 94 112V118Z" fill="#e8b83e" />
          <g clipPath={`url(#${id}-t)`}>
            <path
              d="M35.4 84.6C37.6 79.6 43.4 78.4 50 80.2C56.6 78.4 62.4 79.6 64.6 84.6C58.6 88.6 41.4 88.6 35.4 84.6Z"
              fill="#ae8a2f"
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
        <path d="M44.3 67V80Q49.3 83 54.3 80V67Z" fill="#c68b62" />
        <path d="M44.3 70Q49.3 80 54.3 70V76Q49.3 84 44.3 76Z" fill="#9e6f4e" />
        <ellipse cx="37.4" cy="48.4" rx="3.4" ry="5.6" fill="#c68b62" />
        <path
          d="M38.2 45.8q-1.8 2.6 0 5.4"
          fill="none"
          stroke="#1e2130"
          strokeWidth="0.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity=".6"
        />
        <ellipse cx="63" cy="48.4" rx="3.4" ry="5.6" fill="#c68b62" />
        <path
          d="M62.2 45.8q1.8 2.6 0 5.4"
          fill="none"
          stroke="#1e2130"
          strokeWidth="0.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity=".6"
        />
        <path
          d="M49.6 21.5C52.5 21.5 56.8 22.9 58.9 25.3C60.9 27.8 61.4 32.6 62 36.2C62.6 39.8 62.7 42.6 62.4 47.1C62.1 51.7 61.4 59.2 60 63.5C58.5 67.7 55.6 70.5 53.9 72.6C52.1 74.7 50.7 76 49.4 76C48.2 76 47.8 74.7 46.3 72.6C44.8 70.5 41.7 67.7 40.4 63.5C39 59.2 38.3 51.7 38 47.1C37.7 42.6 37.8 39.8 38.4 36.2C39 32.6 39.6 27.8 41.4 25.3C43.3 22.9 46.7 21.5 49.6 21.5Z"
          fill="#c68b62"
        />
        <g clipPath={`url(#${id}-f)`}>
          <path
            d="M58.3 49.5l3 15M60.5 49.5l3 15M62.7 49.5l3 15M64.9 49.5l3 15M67.1 49.5l3 15M69.3 49.5l3 15"
            fill="none"
            stroke="#1e2130"
            strokeWidth="0.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.34"
          />
          <path
            d="M60.3 27.5l2 9M62.5 27.5l2 9M64.7 27.5l2 9M66.9 27.5l2 9"
            fill="none"
            stroke="#1e2130"
            strokeWidth="0.55"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.2"
          />
        </g>
        <path
          d="M47.3 39.2Q42.5 38.2 37.3 40.9"
          fill="none"
          stroke="#1e2130"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M40.1 45.5Q43.1 42.5 46.1 45.5Q43.1 47.4 40.1 45.5Z" fill="#1e2130" />
        <circle cx="43.7" cy="45.1" r="0.6" fill="#f4ecd8" />
        <path
          d="M51.3 39.2Q56.1 38.2 61.3 40.9"
          fill="none"
          stroke="#1e2130"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M52.3 45.5Q56.1 42.5 59.9 45.5Q56.1 47.4 52.3 45.5Z" fill="#1e2130" />
        <circle cx="56.7" cy="45.1" r="0.6" fill="#f4ecd8" />
        <path
          d="M49.7 47.3Q48.1 53 46.9 54.8Q48.7 56.3 50.3 54.8"
          fill="none"
          stroke="#1e2130"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M44.7 64.3Q48.9 62.9 53.2 64.3Q48.9 67.5 44.7 64.3Z" fill="#a8453c" opacity=".85" />
        <path
          d="M44.7 64.9Q48.9 66.7 53.2 63.1"
          fill="none"
          stroke="#1e2130"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M37.4 43.5C36.6 28.5 41 21.5 50 21.5C59 21.5 63.4 28.5 62.6 43.5C60.8 35.5 57.4 30.5 50 30.5C42.6 30.5 39.2 35.5 37.4 43.5Z"
          fill="#1d1a1c"
        />
        <path
          d="M40 30.5Q45 25.1 52 24.9M48 29.1Q54 26.1 60 28.5"
          fill="none"
          stroke="#f4ecd8"
          strokeWidth="0.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity=".55"
        />
        <path
          d="M37.6 34.5Q50 21.1 62.4 34.5"
          fill="none"
          stroke="#c8463a"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <rect x="0" y="0" width="100" height="112" fill={`url(#${id}-tx-grano)`} opacity=".55" />
      </g>
      <rect x=".5" y=".5" width="99" height="111" fill="none" stroke="#1e2130" strokeWidth=".9" opacity=".55" />
    </>
  );
}
