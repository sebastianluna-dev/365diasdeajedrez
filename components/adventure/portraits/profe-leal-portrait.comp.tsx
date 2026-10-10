import { useId } from "react";

// Original artwork drawn for this project (the version-2 mockup of proposal B, «El
// cuaderno del viajero»), exported by scripts/adventure-art.ts: edit the mockup
// and run `npm run adventure:art` again instead of editing this file by hand.
//
// The engraved portrait of profe-leal, drawn inside a 100 x 112 box: the host
// provides the <svg> (and may crop it). Its clip paths and patterns take ids
// from `useId`, so the same portrait can be on a page twice.

export function ProfeLealPortrait() {
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
          <path d="M50 23.5C52.5 23.5 58.7 25.3 60.4 26.9C62 28.5 63.5 34.4 64 36.7C64.5 39.1 64.2 43.6 64.2 46.5C64.2 49.5 64.8 58.3 64.2 61.2C63.6 64.2 61.2 69.7 59.5 71.1C57.8 72.5 52.3 72.5 50 72.5C47.7 72.5 42.2 72.5 40.5 71.1C38.8 69.7 36.4 64.2 35.8 61.2C35.2 58.3 35.8 49.5 35.8 46.5C35.8 43.6 35.5 39.1 36 36.7C36.5 34.4 38 28.5 39.6 26.9C41.3 25.3 47.5 23.5 50 23.5Z" />
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
        <circle cx="50" cy="55" r="42" fill="#8ab17d" />
        <circle cx="50" cy="55" r="37.5" fill="none" stroke="#f4ecd8" strokeWidth=".9" opacity=".5" />
        <circle cx="50" cy="55" r="33.5" fill="none" stroke="#f4ecd8" strokeWidth=".7" opacity=".35" />
        <g transform="translate(0 -4)">
          <path d="M6 118V112C8 97 20 87 37 82.5L44 80H56L63 82.5C80 87 92 97 94 112V118Z" fill="#5f8a5a" />
          <g clipPath={`url(#${id}-t)`}>
            <path d="M6 118V112C8 97 20 87 37 82.5L44 80H56L63 82.5C80 87 92 97 94 112V118Z" fill="#f3efe4" />
            <path d="M6 118V112C8 97 20 87 37 82.5L44 80.6L49.2 118Z" fill="#5f8a5a" />
            <path d="M94 118V112C92 97 80 87 63 82.5L56 80.6L50.8 118Z" fill="#5f8a5a" />
            <path d="M44.4 80.2L48.6 84.8L46.4 87.6ZM55.6 80.2L51.4 84.8L53.6 87.6Z" fill="#fbf8f0" />
            <circle cx="47.6" cy="96" r="1.1" fill="#1e2130" />
            <circle cx="48.4" cy="103" r="1.1" fill="#1e2130" />
            <rect x="30" y="96" width="8" height="1.6" fill="#476844" />
            <rect x="33.4" y="90" width="1.6" height="6.6" fill="#d6a24a" />
            <path d="M33.4 90l.8 -2 .8 2z" fill="#1e2130" />
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
        <path d="M43 63.5V80Q50 83 57 80V63.5Z" fill="#a87454" />
        <path d="M43 66.5Q50 76.5 57 66.5V72.5Q50 80.5 43 72.5Z" fill="#865d43" />
        <ellipse cx="35.2" cy="48.4" rx="3.4" ry="5.6" fill="#a87454" />
        <path
          d="M36 45.8q-1.8 2.6 0 5.4"
          fill="none"
          stroke="#1e2130"
          strokeWidth="0.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity=".6"
        />
        <ellipse cx="64.8" cy="48.4" rx="3.4" ry="5.6" fill="#a87454" />
        <path
          d="M64 45.8q1.8 2.6 0 5.4"
          fill="none"
          stroke="#1e2130"
          strokeWidth="0.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity=".6"
        />
        <path
          d="M50 23.5C52.5 23.5 58.7 25.3 60.4 26.9C62 28.5 63.5 34.4 64 36.7C64.5 39.1 64.2 43.6 64.2 46.5C64.2 49.5 64.8 58.3 64.2 61.2C63.6 64.2 61.2 69.7 59.5 71.1C57.8 72.5 52.3 72.5 50 72.5C47.7 72.5 42.2 72.5 40.5 71.1C38.8 69.7 36.4 64.2 35.8 61.2C35.2 58.3 35.8 49.5 35.8 46.5C35.8 43.6 35.5 39.1 36 36.7C36.5 34.4 38 28.5 39.6 26.9C41.3 25.3 47.5 23.5 50 23.5Z"
          fill="#a87454"
        />
        <g clipPath={`url(#${id}-f)`}>
          <path
            d="M59 51.5l3 15M61.2 51.5l3 15M63.4 51.5l3 15M65.6 51.5l3 15M67.8 51.5l3 15M70 51.5l3 15"
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
        </g>
        <path
          d="M47.2 42.6Q42.6 40.4 37.6 42.6"
          fill="none"
          stroke="#1e2130"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M39 47.5Q42.6 44.9 46.2 47.5Q42.6 49.1 39 47.5Z" fill="#1e2130" />
        <circle cx="43.2" cy="47.1" r="0.6" fill="#f4ecd8" />
        <path
          d="M52.8 42.6Q57.4 40.4 62.4 42.6"
          fill="none"
          stroke="#1e2130"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M53.8 47.5Q57.4 44.9 61 47.5Q57.4 49.1 53.8 47.5Z" fill="#1e2130" />
        <circle cx="58" cy="47.1" r="0.6" fill="#f4ecd8" />
        <path
          d="M50.6 48.7Q49.6 53.9 47.8 56.1Q50 57.9 52.2 56.3"
          fill="none"
          stroke="#1e2130"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M42.4 57.8Q41 62.2 43.6 65.4M57.6 57.8Q59 62.2 56.4 65.4"
          fill="none"
          stroke="#1e2130"
          strokeWidth="0.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity=".5"
        />
        <path d="M43.6 61.4Q50 59.2 56.4 61.4L56.6 66.8Q55.6 73.1 50 73.3Q44.4 73.1 43.4 66.8Z" fill="#3b2a20" />
        <path d="M45.4 63.2Q50 64.2 54.6 63.2Q50 67.2 45.4 63.2Z" fill="#a87454" />
        <path
          d="M46 69.5l.6 2M50 70.5v2M54 69.5l-.6 2"
          fill="none"
          stroke="#f4ecd8"
          strokeWidth="0.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity=".6"
        />
        <path
          d="M45.6 64Q50 64.8 54.4 64"
          fill="none"
          stroke="#1e2130"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M35.2 45.5C34.4 29.5 43 21.9 50 21.9C57 21.9 65.6 29.5 64.8 45.5L62.4 44.5C62 37.5 60 32.5 57.4 33.5C54 32.1 52 30.1 50 30.9C48 30.1 46 32.1 42.6 33.5C40 32.5 38 37.5 37.6 44.5Z"
          fill="#3b2a20"
        />
        <path
          d="M44 25.5Q50 23.1 56 25.5M37 29.5q2 -3 5 -4"
          fill="none"
          stroke="#f4ecd8"
          strokeWidth="0.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity=".5"
        />
        <rect
          x="37.4"
          y="44.3"
          width="10.4"
          height="7"
          rx="1.6"
          fill="rgba(255,255,255,.14)"
          stroke="#1e2130"
          strokeWidth="1.6"
        />
        <rect
          x="52.2"
          y="44.3"
          width="10.4"
          height="7"
          rx="1.6"
          fill="rgba(255,255,255,.14)"
          stroke="#1e2130"
          strokeWidth="1.6"
        />
        <path
          d="M47.8 46.7Q50 45.3 52.2 46.7M37.4 45.9L35 45.3M62.6 45.9L65 45.3"
          fill="none"
          stroke="#1e2130"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <rect x="0" y="0" width="100" height="112" fill={`url(#${id}-tx-grano)`} opacity=".55" />
      </g>
      <rect x=".5" y=".5" width="99" height="111" fill="none" stroke="#1e2130" strokeWidth=".9" opacity=".55" />
    </>
  );
}
