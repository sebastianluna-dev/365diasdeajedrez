import { useId } from "react";

// Original artwork drawn for this project (the version-2 mockup of proposal B, «El
// cuaderno del viajero»), exported by scripts/adventure-art.ts: edit the mockup
// and run `npm run adventure:art` again instead of editing this file by hand.
//
// The engraved portrait of maestro-ibarra, drawn inside a 100 x 112 box: the host
// provides the <svg> (and may crop it). Its clip paths and patterns take ids
// from `useId`, so the same portrait can be on a page twice.

export function MaestroIbarraPortrait() {
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
          <path d="M49.5 21C51.9 21 57.7 22.9 59.5 24.9C61.3 26.9 62.4 33 62.9 36C63.4 38.9 63.3 43.4 63.2 47.1C63.1 50.8 62.9 60 62.1 63.7C61.2 67.5 58.2 73.4 56.5 75.1C54.8 76.8 51 76.5 49.3 76.5C47.6 76.5 45.2 76.8 43.7 75.1C42.3 73.4 39.3 67.5 38.5 63.7C37.6 60 37.5 50.8 37.4 47.1C37.3 43.4 37.2 38.9 37.7 36C38.1 33 39.3 26.9 40.9 24.9C42.4 22.9 47 21 49.5 21Z" />
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
        <circle cx="50" cy="55" r="42" fill="#9a8c98" />
        <circle cx="50" cy="55" r="37.5" fill="none" stroke="#f4ecd8" strokeWidth=".9" opacity=".5" />
        <circle cx="50" cy="55" r="33.5" fill="none" stroke="#f4ecd8" strokeWidth=".7" opacity=".35" />
        <g transform="translate(0 -4)">
          <path d="M6 118V112C8 97 20 87 37 82.5L44 80H56L63 82.5C80 87 92 97 94 112V118Z" fill="#7d7f86" />
          <g clipPath={`url(#${id}-t)`}>
            <path d="M43.6 80.6L50 96L56.4 80.6Z" fill="#f3eee2" />
            <path d="M43.6 80.6L50 96L46 99L38 86ZM56.4 80.6L50 96L54 99L62 86Z" fill="#5e5f65" />
            <path d="M63 97l6 -1.6 .6 2.6h-6z" fill="#f3eee2" />
            <circle cx="36" cy="93" r="1.4" fill="#d4a440" />
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
        <path d="M43.1 67.5V80Q49.1 83 55.1 80V67.5Z" fill="#d9a77f" />
        <path d="M43.1 70.5Q49.1 80.5 55.1 70.5V76.5Q49.1 84.5 43.1 76.5Z" fill="#ae8666" />
        <ellipse cx="63.8" cy="48.4" rx="3.4" ry="5.6" fill="#d9a77f" />
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
          d="M49.5 21C51.9 21 57.7 22.9 59.5 24.9C61.3 26.9 62.4 33 62.9 36C63.4 38.9 63.3 43.4 63.2 47.1C63.1 50.8 62.9 60 62.1 63.7C61.2 67.5 58.2 73.4 56.5 75.1C54.8 76.8 51 76.5 49.3 76.5C47.6 76.5 45.2 76.8 43.7 75.1C42.3 73.4 39.3 67.5 38.5 63.7C37.6 60 37.5 50.8 37.4 47.1C37.3 43.4 37.2 38.9 37.7 36C38.1 33 39.3 26.9 40.9 24.9C42.4 22.9 47 21 49.5 21Z"
          fill="#d9a77f"
        />
        <g clipPath={`url(#${id}-f)`}>
          <path
            d="M58.1 51.2l3 15M60.3 51.2l3 15M62.5 51.2l3 15M64.7 51.2l3 15M66.9 51.2l3 15M69.1 51.2l3 15"
            fill="none"
            stroke="#1e2130"
            strokeWidth="0.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.34"
          />
          <path
            d="M60.1 27l2 9M62.3 27l2 9M64.5 27l2 9M66.7 27l2 9"
            fill="none"
            stroke="#1e2130"
            strokeWidth="0.55"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.2"
          />
        </g>
        <path
          d="M46.3 44Q42.1 40.2 37.5 41.8"
          fill="none"
          stroke="#5e5b55"
          strokeWidth="2.9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M40.2 47.2Q42.7 45.1 45.2 47.2Q42.7 48.5 40.2 47.2Z" fill="#1e2130" />
        <circle cx="43.3" cy="46.8" r="0.6" fill="#f4ecd8" />
        <path
          d="M51.9 44Q56.1 40.2 60.7 41.8"
          fill="none"
          stroke="#5e5b55"
          strokeWidth="2.9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M52.9 47.2Q56.1 45.1 59.3 47.2Q56.1 48.5 52.9 47.2Z" fill="#1e2130" />
        <circle cx="56.7" cy="46.8" r="0.6" fill="#f4ecd8" />
        <path
          d="M49.1 48.4Q50.7 51.8 49.9 57.2Q49.5 59.4 47.7 58.8Q46.3 58.8 45.9 57.8"
          fill="none"
          stroke="#1e2130"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M41.5 61Q40.1 65.4 42.7 68.6M56.7 61Q58.1 65.4 55.5 68.6"
          fill="none"
          stroke="#1e2130"
          strokeWidth="0.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity=".5"
        />
        <path
          d="M42.1 37Q49.1 35.4 56.1 37M44.1 34.2Q49.1 33 54.1 34.2"
          fill="none"
          stroke="#1e2130"
          strokeWidth="0.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity=".45"
        />
        <path
          d="M37.5 46.2l-2 -1M37.5 47.8l-2.2 .2M37.5 49.2l-1.8 1.2"
          fill="none"
          stroke="#1e2130"
          strokeWidth="0.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.45"
        />
        <path
          d="M60.7 46.2l2 -1M60.7 47.8l2.2 .2M60.7 49.2l1.8 1.2"
          fill="none"
          stroke="#1e2130"
          strokeWidth="0.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.45"
        />
        <path d="M44.5 65.2Q49.1 62.8 53.3 65.2Q49.1 65.8 44.5 65.2Z" fill="#8d8a84" />
        <path
          d="M44.3 67.2Q48.7 68 53.1 67.2"
          fill="none"
          stroke="#1e2130"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M36.8 42C36 26 41 18.6 50 18.6C59 18.6 64 26 63.2 42C62.2 34 61.4 30 58.6 28.4C53 26.6 47 26.6 41.6 28.4C38.6 30 37.8 34 36.8 42Z"
          fill="#a6a49f"
        />
        <path
          d="M40 29Q44 22 52 20.6M45 28Q48 22 56 21.4M51 27.4Q53 22.4 60 23.6M56 27.8Q58 24.6 62 26.4"
          fill="none"
          stroke="#1e2130"
          strokeWidth="0.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity=".5"
        />
        <path
          d="M48.2 81H51.8L52.8 84.6L51.2 100L50 102L48.8 100L47.2 84.6Z"
          fill="#262a3a"
          transform="translate(0 -4)"
        />
        <path d="M48.4 77h3.2l.4 3h-4z" fill="#515561" />
        <rect x="0" y="0" width="100" height="112" fill={`url(#${id}-tx-grano)`} opacity=".55" />
      </g>
      <rect x=".5" y=".5" width="99" height="111" fill="none" stroke="#1e2130" strokeWidth=".9" opacity=".55" />
    </>
  );
}
