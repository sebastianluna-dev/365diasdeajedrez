import { useId } from "react";

// Original artwork drawn for this project (the version-2 mockup of proposal B, «El
// cuaderno del viajero»), exported by scripts/adventure-art.ts: edit the mockup
// and run `npm run adventure:art` again instead of editing this file by hand.
//
// The engraved portrait of la-condesa, drawn inside a 100 x 112 box: the host
// provides the <svg> (and may crop it). Its clip paths and patterns take ids
// from `useId`, so the same portrait can be on a page twice.

export function LaCondesaPortrait() {
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
          <path d="M50.7 23.5C53.9 23.5 57.5 24.7 59.5 27C61.5 29.2 62.1 34 62.9 36.9C63.6 39.8 64.6 40.2 64 44.3C63.5 48.4 61.2 57.4 59.5 61.6C57.9 65.8 55.7 67.7 54.3 69.6C52.8 71.5 52.3 73 50.9 73C49.4 73 47.3 71.5 45.5 69.6C43.7 67.7 41.7 65.8 39.9 61.6C38.2 57.4 35.8 48.4 35.2 44.3C34.6 40.2 35.7 39.8 36.5 36.9C37.2 34 37.6 29.2 40 27C42.3 24.7 47.4 23.5 50.7 23.5Z" />
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
        <circle cx="50" cy="55" r="42" fill="#7b5ea7" />
        <circle cx="50" cy="55" r="37.5" fill="none" stroke="#f4ecd8" strokeWidth=".9" opacity=".5" />
        <circle cx="50" cy="55" r="33.5" fill="none" stroke="#f4ecd8" strokeWidth=".7" opacity=".35" />
        <g transform="translate(0 -4)">
          <path d="M6 118V112C8 97 20 87 37 82.5L44 80H56L63 82.5C80 87 92 97 94 112V118Z" fill="#6a4a8f" />
          <g clipPath={`url(#${id}-t)`}>
            <path d="M34 84.4C39 92.4 61 92.4 66 84.4L64 82.2H36Z" fill="#e3b593" />
            <path
              d="M22 102Q30 94 38 97M78 102Q70 94 62 97M30 110Q36 104 44 106"
              fill="none"
              stroke="#9780b1"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity=".7"
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
        <path d="M46.1 64V80Q51.1 83 56.1 80V64Z" fill="#e3b593" />
        <path d="M46.1 67Q51.1 77 56.1 67V73Q51.1 81 46.1 73Z" fill="#b69176" />
        <ellipse cx="34.6" cy="48.4" rx="3.4" ry="5.6" fill="#e3b593" />
        <path
          d="M35.4 45.8q-1.8 2.6 0 5.4"
          fill="none"
          stroke="#1e2130"
          strokeWidth="0.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity=".6"
        />
        <path
          d="M50.7 23.5C53.9 23.5 57.5 24.7 59.5 27C61.5 29.2 62.1 34 62.9 36.9C63.6 39.8 64.6 40.2 64 44.3C63.5 48.4 61.2 57.4 59.5 61.6C57.9 65.8 55.7 67.7 54.3 69.6C52.8 71.5 52.3 73 50.9 73C49.4 73 47.3 71.5 45.5 69.6C43.7 67.7 41.7 65.8 39.9 61.6C38.2 57.4 35.8 48.4 35.2 44.3C34.6 40.2 35.7 39.8 36.5 36.9C37.2 34 37.6 29.2 40 27C42.3 24.7 47.4 23.5 50.7 23.5Z"
          fill="#e3b593"
        />
        <g clipPath={`url(#${id}-f)`}>
          <path
            d="M29.1 50.6l-3 15M31.3 50.6l-3 15M33.5 50.6l-3 15M35.7 50.6l-3 15M37.9 50.6l-3 15M40.1 50.6l-3 15"
            fill="none"
            stroke="#1e2130"
            strokeWidth="0.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.34"
          />
          <path
            d="M40.1 29.5l-2 9M42.3 29.5l-2 9M44.5 29.5l-2 9M46.7 29.5l-2 9"
            fill="none"
            stroke="#1e2130"
            strokeWidth="0.55"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.2"
          />
          <path
            d="M39.1 52.6q3 4 6 5M63.1 52.6q-3 4 -6 5"
            fill="none"
            stroke="#1e2130"
            strokeWidth="0.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity=".45"
          />
          <path
            d="M36.1 53.6l2 5M37.7 53.6l2 5M39.3 53.6l2 5M40.9 53.6l2 5"
            fill="none"
            stroke="#1e2130"
            strokeWidth="0.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.35"
          />
          <path
            d="M60.1 53.6l-2 5M61.7 53.6l-2 5M63.3 53.6l-2 5M64.9 53.6l-2 5"
            fill="none"
            stroke="#1e2130"
            strokeWidth="0.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.35"
          />
        </g>
        <path
          d="M48.7 39Q44.1 38.4 39.1 41.2"
          fill="none"
          stroke="#1e2130"
          strokeWidth="1.1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M40.5 46.8Q44.1 45.6 48.5 46Q44.1 48 40.5 46.8Z" fill="#1e2130" />
        <path
          d="M47.7 46l1.6 -1.2"
          fill="none"
          stroke="#1e2130"
          strokeWidth="0.9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M53.5 39Q58.1 38.4 63.1 41.2"
          fill="none"
          stroke="#1e2130"
          strokeWidth="1.1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M54.7 46.8Q57.5 45.6 61.1 46Q57.5 48 54.7 46.8Z" fill="#1e2130" />
        <path
          d="M60.3 46l1.6 -1.2"
          fill="none"
          stroke="#1e2130"
          strokeWidth="0.9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M51.5 48.4Q51.5 54.6 50.3 56.4Q52.1 57.9 53.7 56.4"
          fill="none"
          stroke="#1e2130"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M43.5 58Q42.1 62.4 44.7 65.6M58.7 58Q60.1 62.4 57.5 65.6"
          fill="none"
          stroke="#1e2130"
          strokeWidth="0.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity=".5"
        />
        <path d="M47.4 63.8Q51.7 62.4 55.9 63.8Q51.7 67 47.4 63.8Z" fill="#7a2f4a" opacity=".85" />
        <path
          d="M47.4 64.2Q51.7 65 55.9 64.2"
          fill="none"
          stroke="#1e2130"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <ellipse cx="50.4" cy="19.9" rx="10.6" ry="7.4" fill="#dad8d3" />
        <path
          d="M45.4 20.1Q50.4 15.1 55.4 20.1Q50.4 23.5 47.4 20.7"
          fill="none"
          stroke="#1e2130"
          strokeWidth="0.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity=".45"
        />
        <path
          d="M36.2 44.5C35.4 30.1 41 23.5 50 23.5C59 23.5 64.6 30.1 63.8 44.5C61.6 36.5 58 31.9 50 31.9C42 31.9 38.4 36.5 36.2 44.5Z"
          fill="#dad8d3"
        />
        <path
          d="M40 29.5Q45 25.5 50 25.1M50 25.1Q55 25.5 60 29.5"
          fill="none"
          stroke="#1e2130"
          strokeWidth="0.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity=".4"
        />
        <circle cx="34.6" cy="55.2" r="2.1" fill="#f8f4ea" stroke="#1e2130" strokeWidth=".5" />
        <circle cx="40.1" cy="81.6" r="1.5" fill="#f8f4ea" stroke="#1e2130" strokeWidth=".4" />
        <circle cx="42.3" cy="83" r="1.5" fill="#f8f4ea" stroke="#1e2130" strokeWidth=".4" />
        <circle cx="44.5" cy="84.3" r="1.5" fill="#f8f4ea" stroke="#1e2130" strokeWidth=".4" />
        <circle cx="46.7" cy="85.3" r="1.5" fill="#f8f4ea" stroke="#1e2130" strokeWidth=".4" />
        <circle cx="48.9" cy="86" r="1.5" fill="#f8f4ea" stroke="#1e2130" strokeWidth=".4" />
        <circle cx="51.1" cy="86.2" r="1.5" fill="#f8f4ea" stroke="#1e2130" strokeWidth=".4" />
        <circle cx="53.3" cy="86" r="1.5" fill="#f8f4ea" stroke="#1e2130" strokeWidth=".4" />
        <circle cx="55.5" cy="85.3" r="1.5" fill="#f8f4ea" stroke="#1e2130" strokeWidth=".4" />
        <circle cx="57.7" cy="84.3" r="1.5" fill="#f8f4ea" stroke="#1e2130" strokeWidth=".4" />
        <circle cx="59.9" cy="83" r="1.5" fill="#f8f4ea" stroke="#1e2130" strokeWidth=".4" />
        <circle cx="62.1" cy="81.6" r="1.5" fill="#f8f4ea" stroke="#1e2130" strokeWidth=".4" />
        <rect x="0" y="0" width="100" height="112" fill={`url(#${id}-tx-grano)`} opacity=".55" />
      </g>
      <rect x=".5" y=".5" width="99" height="111" fill="none" stroke="#1e2130" strokeWidth=".9" opacity=".55" />
    </>
  );
}
