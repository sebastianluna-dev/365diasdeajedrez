import { useId } from "react";

// Original artwork drawn for this project (the version-2 mockup of proposal B, «El
// cuaderno del viajero»), exported by scripts/adventure-art.ts: edit the mockup
// and run `npm run adventure:art` again instead of editing this file by hand.
//
// The engraved portrait of don-chema, drawn inside a 100 x 112 box: the host
// provides the <svg> (and may crop it). Its clip paths and patterns take ids
// from `useId`, so the same portrait can be on a page twice.

export function DonChemaPortrait() {
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
          <path d="M50.2 27C53.8 27 58.2 28.1 60.6 30.1C62.9 32.1 63.3 36 64.3 39C65.2 42 66.1 44.2 66.2 47.9C66.3 51.6 66.3 57.7 64.9 61.3C63.4 64.8 59.9 67.6 57.4 69.3C55 71 52.8 71.5 50.3 71.5C47.8 71.5 45 71 42.4 69.3C39.9 67.6 36.4 64.8 34.9 61.3C33.4 57.7 33.3 51.6 33.4 47.9C33.5 44.2 34.5 42 35.5 39C36.4 36 36.8 32.1 39.2 30.1C41.7 28.1 46.7 27 50.2 27Z" />
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
        <circle cx="50" cy="55" r="42" fill="#e9c46a" />
        <circle cx="50" cy="55" r="37.5" fill="none" stroke="#f4ecd8" strokeWidth=".9" opacity=".5" />
        <circle cx="50" cy="55" r="33.5" fill="none" stroke="#f4ecd8" strokeWidth=".7" opacity=".35" />
        <g transform="translate(0 -4)">
          <path d="M6 118V112C8 97 20 87 37 82.5L44 80H56L63 82.5C80 87 92 97 94 112V118Z" fill="#d8c39b" />
          <g clipPath={`url(#${id}-t)`}>
            <path
              d="M10 84V118M14 84V118M18 84V118M22 84V118M26 84V118M30 84V118M34 84V118M38 84V118M42 84V118M46 84V118M50 84V118M54 84V118M58 84V118M62 84V118M66 84V118M70 84V118M74 84V118M78 84V118M82 84V118M86 84V118M90 84V118"
              fill="none"
              stroke="#1e2130"
              strokeWidth="0.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity=".18"
            />
            <path d="M43.6 80.6L50 97L56.4 80.6Z" fill="#f3eee2" />
            <path d="M44 80.4L48.4 84.6L46 87ZM56 80.4L51.6 84.6L54 87Z" fill="#fbf8f0" />
            <path
              d="M43 81L50 98.4L57 81"
              fill="none"
              stroke="#1e2130"
              strokeWidth="0.9"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="50" cy="102" r="1.2" fill="#1e2130" />
            <circle cx="50" cy="107" r="1.2" fill="#1e2130" />
            <rect x="60" y="100" width="10" height="7" fill="#beac88" />
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
        <path d="M44.4 62.5V80Q50.4 83 56.4 80V62.5Z" fill="#b9825a" />
        <path d="M44.4 65.5Q50.4 75.5 56.4 65.5V71.5Q50.4 79.5 44.4 71.5Z" fill="#946848" />
        <ellipse cx="32.8" cy="48.4" rx="3.8" ry="6.2" fill="#b9825a" />
        <path
          d="M33.6 45.8q-1.8 2.6 0 5.4"
          fill="none"
          stroke="#1e2130"
          strokeWidth="0.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity=".6"
        />
        <ellipse cx="66.8" cy="48.4" rx="3.8" ry="6.2" fill="#b9825a" />
        <path
          d="M66 45.8q1.8 2.6 0 5.4"
          fill="none"
          stroke="#1e2130"
          strokeWidth="0.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity=".6"
        />
        <path
          d="M50.2 27C53.8 27 58.2 28.1 60.6 30.1C62.9 32.1 63.3 36 64.3 39C65.2 42 66.1 44.2 66.2 47.9C66.3 51.6 66.3 57.7 64.9 61.3C63.4 64.8 59.9 67.6 57.4 69.3C55 71 52.8 71.5 50.3 71.5C47.8 71.5 45 71 42.4 69.3C39.9 67.6 36.4 64.8 34.9 61.3C33.4 57.7 33.3 51.6 33.4 47.9C33.5 44.2 34.5 42 35.5 39C36.4 36 36.8 32.1 39.2 30.1C41.7 28.1 46.7 27 50.2 27Z"
          fill="#b9825a"
        />
        <g clipPath={`url(#${id}-f)`}>
          <path
            d="M59.4 52l3 15M61.6 52l3 15M63.8 52l3 15M66 52l3 15M68.2 52l3 15M70.4 52l3 15"
            fill="none"
            stroke="#1e2130"
            strokeWidth="0.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.34"
          />
          <path
            d="M61.4 33l2 9M63.6 33l2 9M65.8 33l2 9M68 33l2 9"
            fill="none"
            stroke="#1e2130"
            strokeWidth="0.55"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.2"
          />
          <circle cx="41.2" cy="56.6" r="3.6" fill="#d9785f" opacity=".32" />
          <circle cx="59.6" cy="56.6" r="3.6" fill="#d9785f" opacity=".32" />
        </g>
        <path
          d="M46.8 43.4Q42.6 41.2 38 43.4"
          fill="none"
          stroke="#8f8a80"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M39.4 48Q42.6 46.6 45.8 48Q42.6 48.8 39.4 48Z" fill="#1e2130" />
        <path
          d="M39.4 49.6Q42.6 50.6 45.8 49.4"
          fill="none"
          stroke="#1e2130"
          strokeWidth="0.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity=".55"
        />
        <path
          d="M54 43.4Q58.2 41.2 62.8 43.4"
          fill="none"
          stroke="#8f8a80"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M55 48Q58.2 46.6 61.4 48Q58.2 48.8 55 48Z" fill="#1e2130" />
        <path
          d="M55 49.6Q58.2 50.6 61.4 49.4"
          fill="none"
          stroke="#1e2130"
          strokeWidth="0.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity=".55"
        />
        <path
          d="M51 50.2Q50.4 53 47.2 56Q50.8 58 54.4 56"
          fill="none"
          stroke="#1e2130"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M48.2 55.8a1.1 .7 0 1 0 1.6 0z M51.7 55.8a1.1 .7 0 1 0 1.6 0z" fill="#1e2130" opacity=".7" />
        <path
          d="M42.8 58.5Q41.4 62.9 44 66.1M58 58.5Q59.4 62.9 56.8 66.1"
          fill="none"
          stroke="#1e2130"
          strokeWidth="0.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity=".5"
        />
        <path
          d="M43.4 38Q50.4 36.4 57.4 38M45.4 35.2Q50.4 34 55.4 35.2"
          fill="none"
          stroke="#1e2130"
          strokeWidth="0.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity=".45"
        />
        <path
          d="M38 47l-2 -1M38 48.6l-2.2 .2M38 50l-1.8 1.2"
          fill="none"
          stroke="#1e2130"
          strokeWidth="0.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.45"
        />
        <path
          d="M62.8 47l2 -1M62.8 48.6l2.2 .2M62.8 50l1.8 1.2"
          fill="none"
          stroke="#1e2130"
          strokeWidth="0.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.45"
        />
        <path
          d="M42 65.1C43.4 58.9 48.4 59.1 50.8 60.9C53 59.1 57.8 58.9 59.2 65.1C55.4 63.5 53 63.1 50.8 63.9C48.4 63.1 45.8 63.5 42 65.1Z"
          fill="#f4f0e6"
        />
        <path
          d="M45.4 61.1l-.8 2.2M47.8 60.7l-.4 2.4M53.6 60.7l.4 2.4M56 61.1l.8 2.2"
          fill="none"
          stroke="#1e2130"
          strokeWidth="0.55"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity=".45"
        />
        <path
          d="M46.2 63.9Q50.6 67.5 55 63.9"
          fill="none"
          stroke="#1e2130"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M45.4 63.1l.6 1M55.8 63.1l-.6 1"
          fill="none"
          stroke="#1e2130"
          strokeWidth="0.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M35 41C33.2 47 33.6 54 36 59L38 57C37 52 37.2 46 38.2 41.6Z" fill="#dcd7cb" />
        <path d="M65 41C66.8 47 66.4 54 64 59L62 57C63 52 62.8 46 61.8 41.6Z" fill="#dcd7cb" />
        <path
          d="M35.6 44l.4 9M64.4 44l-.4 9"
          fill="none"
          stroke="#1e2130"
          strokeWidth="0.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity=".4"
        />
        <path
          d="M30.5 36C29.2 26 40.5 19 53 19.8C63.6 20.4 71.4 26 69.6 33.6C65.6 37.2 53.6 38.2 43.4 38.2C37.2 38.2 32.4 37.6 30.5 36Z"
          fill="#6b4a2f"
        />
        <path d="M51.4 20l.8 -4.4 2 .4 -.6 4.2z" fill="#1e2130" />
        <path
          d="M36 28.6Q46 23 58 23.4"
          fill="none"
          stroke="#f4ecd8"
          strokeWidth="0.9"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity=".5"
        />
        <path
          d="M31 35.6Q50 40.2 69.4 33.6"
          fill="none"
          stroke="#1e2130"
          strokeWidth="0.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity=".6"
        />
        <rect x="0" y="0" width="100" height="112" fill={`url(#${id}-tx-grano)`} opacity=".55" />
      </g>
      <rect x=".5" y=".5" width="99" height="111" fill="none" stroke="#1e2130" strokeWidth=".9" opacity=".55" />
    </>
  );
}
