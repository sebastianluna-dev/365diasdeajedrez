import { useId } from "react";

// Original artwork drawn for this project (the version-2 mockup of proposal B, «El
// cuaderno del viajero»), exported by scripts/adventure-art.ts: edit the mockup
// and run `npm run adventure:art` again instead of editing this file by hand.
//
// The engraved portrait of dona-cuca, drawn inside a 100 x 112 box: the host
// provides the <svg> (and may crop it). Its clip paths and patterns take ids
// from `useId`, so the same portrait can be on a page twice.

export function DonaCucaPortrait() {
  const id = useId();
  return (
    <>
      <defs>
        <pattern id={`${id}-tx-tejido`} width="8" height="8" patternUnits="userSpaceOnUse">
          <path
            d="M0 1.5H8M0 5.5H8"
            fill="none"
            stroke="rgba(120,80,30,.45)"
            strokeWidth="0.8"
            strokeLinejoin="round"
            strokeLinecap="butt"
          />
          <path
            d="M1.5 0V3.5M5.5 4V8"
            fill="none"
            stroke="rgba(255,240,200,.55)"
            strokeWidth="0.9"
            strokeLinejoin="round"
            strokeLinecap="butt"
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
          <path d="M50 27C53.6 27 58.4 28.1 60.8 30.2C63.2 32.2 63.6 36.2 64.6 39.2C65.6 42.2 66.6 44.4 66.6 48.2C66.6 51.9 66.1 58 64.6 61.7C63.1 65.3 60 68.1 57.6 69.8C55.2 71.5 52.5 72 50 72C47.5 72 44.8 71.5 42.4 69.8C40 68.1 36.9 65.3 35.4 61.7C33.9 58 33.4 51.9 33.4 48.2C33.4 44.4 34.4 42.2 35.4 39.2C36.4 36.2 36.8 32.2 39.2 30.2C41.6 28.1 46.4 27 50 27Z" />
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
        <circle cx="50" cy="55" r="42" fill="#f6bd60" />
        <circle cx="50" cy="55" r="37.5" fill="none" stroke="#f4ecd8" strokeWidth=".9" opacity=".5" />
        <circle cx="50" cy="55" r="33.5" fill="none" stroke="#f4ecd8" strokeWidth=".7" opacity=".35" />
        <ellipse
          cx="32.6"
          cy="52"
          rx="3.2"
          ry="4"
          fill="#cfc9bd"
          stroke="#1e2130"
          strokeWidth=".5"
          strokeOpacity=".5"
          transform="rotate(-26 32.6 52)"
        />
        <ellipse
          cx="33.7"
          cy="57"
          rx="3.2"
          ry="4"
          fill="#cfc9bd"
          stroke="#1e2130"
          strokeWidth=".5"
          strokeOpacity=".5"
          transform="rotate(26 33.7 57)"
        />
        <ellipse
          cx="31.6"
          cy="62"
          rx="3.2"
          ry="4"
          fill="#cfc9bd"
          stroke="#1e2130"
          strokeWidth=".5"
          strokeOpacity=".5"
          transform="rotate(-26 31.6 62)"
        />
        <ellipse
          cx="32.7"
          cy="67"
          rx="3.2"
          ry="4"
          fill="#cfc9bd"
          stroke="#1e2130"
          strokeWidth=".5"
          strokeOpacity=".5"
          transform="rotate(26 32.7 67)"
        />
        <ellipse
          cx="30.6"
          cy="72"
          rx="3.2"
          ry="4"
          fill="#cfc9bd"
          stroke="#1e2130"
          strokeWidth=".5"
          strokeOpacity=".5"
          transform="rotate(-26 30.6 72)"
        />
        <ellipse
          cx="31.7"
          cy="77"
          rx="3.2"
          ry="4"
          fill="#cfc9bd"
          stroke="#1e2130"
          strokeWidth=".5"
          strokeOpacity=".5"
          transform="rotate(26 31.7 77)"
        />
        <ellipse
          cx="29.6"
          cy="82"
          rx="3.2"
          ry="4"
          fill="#cfc9bd"
          stroke="#1e2130"
          strokeWidth=".5"
          strokeOpacity=".5"
          transform="rotate(-26 29.6 82)"
        />
        <path d="M28.2 85h4l1 5h-6z" fill="#c8463a" />
        <ellipse
          cx="65.8"
          cy="52"
          rx="3.2"
          ry="4"
          fill="#cfc9bd"
          stroke="#1e2130"
          strokeWidth=".5"
          strokeOpacity=".5"
          transform="rotate(-26 65.8 52)"
        />
        <ellipse
          cx="67.9"
          cy="57"
          rx="3.2"
          ry="4"
          fill="#cfc9bd"
          stroke="#1e2130"
          strokeWidth=".5"
          strokeOpacity=".5"
          transform="rotate(26 67.9 57)"
        />
        <ellipse
          cx="66.8"
          cy="62"
          rx="3.2"
          ry="4"
          fill="#cfc9bd"
          stroke="#1e2130"
          strokeWidth=".5"
          strokeOpacity=".5"
          transform="rotate(-26 66.8 62)"
        />
        <ellipse
          cx="68.9"
          cy="67"
          rx="3.2"
          ry="4"
          fill="#cfc9bd"
          stroke="#1e2130"
          strokeWidth=".5"
          strokeOpacity=".5"
          transform="rotate(26 68.9 67)"
        />
        <ellipse
          cx="67.8"
          cy="72"
          rx="3.2"
          ry="4"
          fill="#cfc9bd"
          stroke="#1e2130"
          strokeWidth=".5"
          strokeOpacity=".5"
          transform="rotate(-26 67.8 72)"
        />
        <ellipse
          cx="69.9"
          cy="77"
          rx="3.2"
          ry="4"
          fill="#cfc9bd"
          stroke="#1e2130"
          strokeWidth=".5"
          strokeOpacity=".5"
          transform="rotate(26 69.9 77)"
        />
        <ellipse
          cx="68.8"
          cy="82"
          rx="3.2"
          ry="4"
          fill="#cfc9bd"
          stroke="#1e2130"
          strokeWidth=".5"
          strokeOpacity=".5"
          transform="rotate(-26 68.8 82)"
        />
        <path d="M67.8 85h4l1 5h-6z" fill="#2f8a8a" />
        <path d="M8 39C10 32 30 28 50 28C70 28 90 32 92 39C88 45 70 48 50 48C30 48 12 45 8 39Z" fill="#e3c27a" />
        <path
          d="M8 39C10 32 30 28 50 28C70 28 90 32 92 39C88 45 70 48 50 48C30 48 12 45 8 39Z"
          fill={`url(#${id}-tx-tejido)`}
          opacity=".9"
        />
        <g transform="translate(0 -4)">
          <path d="M6 118V112C8 97 20 87 37 82.5L44 80H56L63 82.5C80 87 92 97 94 112V118Z" fill="#f3efe4" />
          <g clipPath={`url(#${id}-t)`}>
            <path d="M41.4 82.4Q50 92 58.6 82.4Z" fill="#8d5a3b" />
            <path
              d="M40 83.6Q50 94.6 60 83.6"
              fill="none"
              stroke="#c8463a"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="44" cy="87.4" r="1" fill="#2f8a8a" />
            <circle cx="50" cy="90.2" r="1" fill="#e8a33d" />
            <circle cx="56" cy="87.4" r="1" fill="#2f8a8a" />
            <path d="M30 92H70L74 118H26Z" fill="#e8eef3" />
            <rect x="32" y="92" width="2.4" height="26" fill="#3f6f9a" opacity=".75" />
            <rect x="37" y="92" width="2.4" height="26" fill="#3f6f9a" opacity=".75" />
            <rect x="42" y="92" width="2.4" height="26" fill="#3f6f9a" opacity=".75" />
            <rect x="47" y="92" width="2.4" height="26" fill="#3f6f9a" opacity=".75" />
            <rect x="52" y="92" width="2.4" height="26" fill="#3f6f9a" opacity=".75" />
            <rect x="57" y="92" width="2.4" height="26" fill="#3f6f9a" opacity=".75" />
            <rect x="62" y="92" width="2.4" height="26" fill="#3f6f9a" opacity=".75" />
            <rect x="67" y="92" width="2.4" height="26" fill="#3f6f9a" opacity=".75" />
            <path
              d="M30 92L36 82M70 92L64 82"
              fill="none"
              stroke="#3f6f9a"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <rect x="30" y="92" width="40" height="3" fill="#3f6f9a" />
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
        <path d="M43 63V80Q50 83 57 80V63Z" fill="#8d5a3b" />
        <path d="M43 66Q50 76 57 66V72Q50 80 43 72Z" fill="#71482f" />
        <ellipse cx="32.8" cy="48.4" rx="3.4" ry="5.6" fill="#8d5a3b" />
        <path
          d="M33.6 45.8q-1.8 2.6 0 5.4"
          fill="none"
          stroke="#1e2130"
          strokeWidth="0.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity=".6"
        />
        <ellipse cx="67.2" cy="48.4" rx="3.4" ry="5.6" fill="#8d5a3b" />
        <path
          d="M66.4 45.8q1.8 2.6 0 5.4"
          fill="none"
          stroke="#1e2130"
          strokeWidth="0.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity=".6"
        />
        <path
          d="M50 27C53.6 27 58.4 28.1 60.8 30.2C63.2 32.2 63.6 36.2 64.6 39.2C65.6 42.2 66.6 44.4 66.6 48.2C66.6 51.9 66.1 58 64.6 61.7C63.1 65.3 60 68.1 57.6 69.8C55.2 71.5 52.5 72 50 72C47.5 72 44.8 71.5 42.4 69.8C40 68.1 36.9 65.3 35.4 61.7C33.9 58 33.4 51.9 33.4 48.2C33.4 44.4 34.4 42.2 35.4 39.2C36.4 36.2 36.8 32.2 39.2 30.2C41.6 28.1 46.4 27 50 27Z"
          fill="#8d5a3b"
        />
        <g clipPath={`url(#${id}-f)`}>
          <path
            d="M59 52.6l3 15M61.2 52.6l3 15M63.4 52.6l3 15M65.6 52.6l3 15M67.8 52.6l3 15M70 52.6l3 15"
            fill="none"
            stroke="#1e2130"
            strokeWidth="0.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.34"
          />
          <path
            d="M61 33l2 9M63.2 33l2 9M65.4 33l2 9M67.6 33l2 9"
            fill="none"
            stroke="#1e2130"
            strokeWidth="0.55"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.2"
          />
          <circle cx="40.8" cy="57.2" r="3.6" fill="#c8643f" opacity=".32" />
          <circle cx="59.2" cy="57.2" r="3.6" fill="#c8643f" opacity=".32" />
        </g>
        <path
          d="M46.8 43.6Q42.2 41.4 37.2 43.6"
          fill="none"
          stroke="#7d7469"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M38.6 49.4Q42.2 46.6 45.8 49.4"
          fill="none"
          stroke="#1e2130"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M53.2 43.6Q57.8 41.4 62.8 43.6"
          fill="none"
          stroke="#7d7469"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M54.2 49.4Q57.8 46.6 61.4 49.4"
          fill="none"
          stroke="#1e2130"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M50.6 50.8Q49.6 54 46.2 57Q50 59 53.8 57"
          fill="none"
          stroke="#1e2130"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M47.3 56.8a1.1 .7 0 1 0 1.6 0z M51.1 56.8a1.1 .7 0 1 0 1.6 0z" fill="#1e2130" opacity=".7" />
        <path
          d="M42.4 58.2Q41 62.6 43.6 65.8M57.6 58.2Q59 62.6 56.4 65.8"
          fill="none"
          stroke="#1e2130"
          strokeWidth="0.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity=".5"
        />
        <path
          d="M43 38.2Q50 36.6 57 38.2M45 35.4Q50 34.2 55 35.4"
          fill="none"
          stroke="#1e2130"
          strokeWidth="0.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity=".45"
        />
        <path
          d="M37.2 47.6l-2 -1M37.2 49.2l-2.2 .2M37.2 50.6l-1.8 1.2"
          fill="none"
          stroke="#1e2130"
          strokeWidth="0.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.45"
        />
        <path
          d="M62.8 47.6l2 -1M62.8 49.2l2.2 .2M62.8 50.6l1.8 1.2"
          fill="none"
          stroke="#1e2130"
          strokeWidth="0.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.45"
        />
        <path d="M43.8 63.2Q50 71.2 56.2 63.2Q50 64.8 43.8 63.2Z" fill="#1e2130" />
        <path d="M44.8 63.8Q50 65.6 55.2 63.8L54.6 65.6Q50 67 45.4 65.6Z" fill="#fbf8f0" />
        <path
          d="M41.8 60.8q-1 2.6 .6 4.4M58.2 60.8q1 2.6 -.6 4.4"
          fill="none"
          stroke="#1e2130"
          strokeWidth="0.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity=".6"
        />
        <path d="M8 39C12 45 30 48 50 48C70 48 88 45 92 39C84 42 68 43.6 50 43.6C32 43.6 16 42 8 39Z" fill="#e3c27a" />
        <path
          d="M8 39C12 45 30 48 50 48C70 48 88 45 92 39C84 42 68 43.6 50 43.6C32 43.6 16 42 8 39Z"
          fill={`url(#${id}-tx-tejido)`}
        />
        <path
          d="M8 39C12 45 30 48 50 48C70 48 88 45 92 39C84 42 68 43.6 50 43.6C32 43.6 16 42 8 39Z"
          fill="none"
          stroke="#c49a52"
          strokeWidth="0.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M33 40C32 29 37 17 50 17C63 17 68 29 67 40C61 42.4 39 42.4 33 40Z" fill="#e3c27a" />
        <path d="M33 40C32 29 37 17 50 17C63 17 68 29 67 40C61 42.4 39 42.4 33 40Z" fill={`url(#${id}-tx-tejido)`} />
        <path d="M33.6 35C40 37.6 60 37.6 66.4 35L66.9 39C60 41.4 40 41.4 33.1 39Z" fill="#7a3b2a" />
        <path
          d="M50 17C47 23 47 29 48 35"
          fill="none"
          stroke="#c49a52"
          strokeWidth="0.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <rect x="0" y="0" width="100" height="112" fill={`url(#${id}-tx-grano)`} opacity=".55" />
      </g>
      <rect x=".5" y=".5" width="99" height="111" fill="none" stroke="#1e2130" strokeWidth=".9" opacity=".55" />
    </>
  );
}
