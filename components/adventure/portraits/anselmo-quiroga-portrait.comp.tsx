import { useId } from "react";

// Original artwork drawn for this project (the version-2 mockup of proposal B, «El
// cuaderno del viajero»), exported by scripts/adventure-art.ts: edit the mockup
// and run `npm run adventure:art` again instead of editing this file by hand.
//
// The engraved portrait of anselmo-quiroga, drawn inside a 100 x 112 box: the host
// provides the <svg> (and may crop it). Its clip paths and patterns take ids
// from `useId`, so the same portrait can be on a page twice.

export function AnselmoQuirogaPortrait() {
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
          <path d="M49.3 20.5C52.4 20.5 57.3 21.9 59.6 24.3C61.8 26.8 62.5 31.6 62.9 35.2C63.4 38.8 62.8 41.6 62.3 46.1C61.8 50.7 61.1 58.2 59.9 62.5C58.6 66.7 56.5 69.5 54.7 71.6C52.9 73.7 50.7 75 49.1 75C47.6 75 46.9 73.7 45.5 71.6C44.1 69.5 41.9 66.7 40.7 62.5C39.5 58.2 38.8 50.7 38.3 46.1C37.8 41.6 37.3 38.8 37.7 35.2C38.2 31.6 39 26.8 40.9 24.3C42.9 21.9 46.2 20.5 49.3 20.5Z" />
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
        <circle cx="50" cy="55" r="42" fill="#b5838d" />
        <circle cx="50" cy="55" r="37.5" fill="none" stroke="#f4ecd8" strokeWidth=".9" opacity=".5" />
        <circle cx="50" cy="55" r="33.5" fill="none" stroke="#f4ecd8" strokeWidth=".7" opacity=".35" />
        <g transform="translate(0 -4)">
          <path d="M6 118V112C8 97 20 87 37 82.5L44 80H56L63 82.5C80 87 92 97 94 112V118Z" fill="#8a6a4a" />
          <g clipPath={`url(#${id}-t)`}>
            <path d="M43.4 80.6L50 94L56.6 80.6Z" fill="#f3eee2" />
            <path d="M43.4 80.6L50 94L45.8 97.6L38.6 86.2ZM56.6 80.6L50 94L54.2 97.6L61.4 86.2Z" fill="#6c533a" />
            <path
              d="M57.8 104.6l1.6 1.2M16.6 99.9l1.6 1.2M68.5 93.7l1.6 1.2M86.9 89l1.6 1.2M26.6 110l1.6 1.2M81.2 100.1l1.6 1.2M9.7 107.1l1.6 1.2M38.5 101.7l1.6 1.2M35.8 91.8l1.6 1.2M67.2 92.2l1.6 1.2M72.5 101.6l1.6 1.2M45 98.9l1.6 1.2M30.7 84.5l1.6 1.2M72.9 97.2l1.6 1.2M88.6 85.1l1.6 1.2M53 111l1.6 1.2M74.2 111.7l1.6 1.2M37.9 87.4l1.6 1.2M24.9 94.8l1.6 1.2M36.2 90l1.6 1.2M55.9 108.7l1.6 1.2M27.9 108l1.6 1.2M38.7 91.4l1.6 1.2M15.3 93.5l1.6 1.2M47.1 107l1.6 1.2M34.8 89.3l1.6 1.2M60.6 100.9l1.6 1.2M88.3 108l1.6 1.2M22.4 94.8l1.6 1.2M22.5 108.1l1.6 1.2M91.2 96.4l1.6 1.2M39.5 96.6l1.6 1.2M87.6 86.2l1.6 1.2M22.2 89l1.6 1.2M51.9 95.8l1.6 1.2M45.3 109.5l1.6 1.2M42.8 96.8l1.6 1.2M21 96.4l1.6 1.2M65.8 85l1.6 1.2M76.6 93.6l1.6 1.2M63.4 97.7l1.6 1.2M84.9 94.8l1.6 1.2M34.8 85.9l1.6 1.2M24.2 91.8l1.6 1.2M90.2 100.9l1.6 1.2M65.7 92.9l1.6 1.2M90.6 107.6l1.6 1.2M9.3 105.3l1.6 1.2M62 96.1l1.6 1.2M35.1 84.4l1.6 1.2M41.2 86.7l1.6 1.2M37.7 93l1.6 1.2M12.2 99.7l1.6 1.2M45.1 91.5l1.6 1.2M60.6 109.4l1.6 1.2M48.5 95.1l1.6 1.2M40.7 111.5l1.6 1.2M73.2 104.5l1.6 1.2M33.5 93.1l1.6 1.2M81 106.4l1.6 1.2"
              fill="none"
              stroke="#1e2130"
              strokeWidth="0.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity=".32"
            />
            <path
              d="M57.8 104.6l-1.2 1.6M16.6 99.9l-1.2 1.6M68.5 93.7l-1.2 1.6M86.9 89l-1.2 1.6M26.6 110l-1.2 1.6M81.2 100.1l-1.2 1.6M9.7 107.1l-1.2 1.6M38.5 101.7l-1.2 1.6M35.8 91.8l-1.2 1.6M67.2 92.2l-1.2 1.6M72.5 101.6l-1.2 1.6M45 98.9l-1.2 1.6M30.7 84.5l-1.2 1.6M72.9 97.2l-1.2 1.6M88.6 85.1l-1.2 1.6M53 111l-1.2 1.6M74.2 111.7l-1.2 1.6M37.9 87.4l-1.2 1.6M24.9 94.8l-1.2 1.6M36.2 90l-1.2 1.6M55.9 108.7l-1.2 1.6M27.9 108l-1.2 1.6M38.7 91.4l-1.2 1.6M15.3 93.5l-1.2 1.6M47.1 107l-1.2 1.6M34.8 89.3l-1.2 1.6M60.6 100.9l-1.2 1.6M88.3 108l-1.2 1.6M22.4 94.8l-1.2 1.6M22.5 108.1l-1.2 1.6M91.2 96.4l-1.2 1.6M39.5 96.6l-1.2 1.6M87.6 86.2l-1.2 1.6M22.2 89l-1.2 1.6M51.9 95.8l-1.2 1.6M45.3 109.5l-1.2 1.6M42.8 96.8l-1.2 1.6M21 96.4l-1.2 1.6M65.8 85l-1.2 1.6M76.6 93.6l-1.2 1.6M63.4 97.7l-1.2 1.6M84.9 94.8l-1.2 1.6M34.8 85.9l-1.2 1.6M24.2 91.8l-1.2 1.6M90.2 100.9l-1.2 1.6M65.7 92.9l-1.2 1.6M90.6 107.6l-1.2 1.6M9.3 105.3l-1.2 1.6M62 96.1l-1.2 1.6M35.1 84.4l-1.2 1.6M41.2 86.7l-1.2 1.6M37.7 93l-1.2 1.6M12.2 99.7l-1.2 1.6M45.1 91.5l-1.2 1.6M60.6 109.4l-1.2 1.6M48.5 95.1l-1.2 1.6M40.7 111.5l-1.2 1.6M73.2 104.5l-1.2 1.6M33.5 93.1l-1.2 1.6M81 106.4l-1.2 1.6"
              fill="none"
              stroke="#f4ecd8"
              strokeWidth="0.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity=".25"
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
        <path d="M43.9 66V80Q48.9 83 53.9 80V66Z" fill="#e0b48e" />
        <path d="M43.9 69Q48.9 79 53.9 69V75Q48.9 83 43.9 75Z" fill="#b39072" />
        <ellipse cx="62.9" cy="48.4" rx="3.4" ry="5.6" fill="#e0b48e" />
        <path
          d="M62.1 45.8q1.8 2.6 0 5.4"
          fill="none"
          stroke="#1e2130"
          strokeWidth="0.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity=".6"
        />
        <path
          d="M49.3 20.5C52.4 20.5 57.3 21.9 59.6 24.3C61.8 26.8 62.5 31.6 62.9 35.2C63.4 38.8 62.8 41.6 62.3 46.1C61.8 50.7 61.1 58.2 59.9 62.5C58.6 66.7 56.5 69.5 54.7 71.6C52.9 73.7 50.7 75 49.1 75C47.6 75 46.9 73.7 45.5 71.6C44.1 69.5 41.9 66.7 40.7 62.5C39.5 58.2 38.8 50.7 38.3 46.1C37.8 41.6 37.3 38.8 37.7 35.2C38.2 31.6 39 26.8 40.9 24.3C42.9 21.9 46.2 20.5 49.3 20.5Z"
          fill="#e0b48e"
        />
        <g clipPath={`url(#${id}-f)`}>
          <path
            d="M57.9 50.5l3 15M60.1 50.5l3 15M62.3 50.5l3 15M64.5 50.5l3 15M66.7 50.5l3 15M68.9 50.5l3 15"
            fill="none"
            stroke="#1e2130"
            strokeWidth="0.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.34"
          />
          <path
            d="M59.9 26.5l2 9M62.1 26.5l2 9M64.3 26.5l2 9M66.5 26.5l2 9"
            fill="none"
            stroke="#1e2130"
            strokeWidth="0.55"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.2"
          />
        </g>
        <path
          d="M46.4 40.2Q42.3 39 37.8 41.6"
          fill="none"
          stroke="#8f8a80"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M40.5 46.5Q42.9 43.9 45.3 46.5Q42.9 48.1 40.5 46.5Z" fill="#1e2130" />
        <circle cx="43.5" cy="46.1" r="0.6" fill="#f4ecd8" />
        <path
          d="M51.4 40.2Q55.5 39 60 41.6"
          fill="none"
          stroke="#8f8a80"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M52.4 46.5Q55.5 43.9 58.6 46.5Q55.5 48.1 52.4 46.5Z" fill="#1e2130" />
        <circle cx="56.1" cy="46.1" r="0.6" fill="#f4ecd8" />
        <path
          d="M48.5 47.7L49.5 59.5Q50.3 61.7 47.9 61.7Q46.1 61.9 45.3 60.5"
          fill="none"
          stroke="#1e2130"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M41.3 60Q39.9 64.4 42.5 67.6M56.5 60Q57.9 64.4 55.3 67.6"
          fill="none"
          stroke="#1e2130"
          strokeWidth="0.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity=".5"
        />
        <path
          d="M41.9 35.8Q48.9 34.2 55.9 35.8M43.9 33Q48.9 31.8 53.9 33"
          fill="none"
          stroke="#1e2130"
          strokeWidth="0.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity=".45"
        />
        <path
          d="M37.8 45.5l-2 -1M37.8 47.1l-2.2 .2M37.8 48.5l-1.8 1.2"
          fill="none"
          stroke="#1e2130"
          strokeWidth="0.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.45"
        />
        <path
          d="M60 45.5l2 -1M60 47.1l2.2 .2M60 48.5l1.8 1.2"
          fill="none"
          stroke="#1e2130"
          strokeWidth="0.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.45"
        />
        <path
          d="M44.6 66.2Q48.4 67 52.2 66.2"
          fill="none"
          stroke="#1e2130"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M37 34.5C33 36.5 32.4 43.5 34.6 47.5C33.2 50.5 34.8 54.5 38 54.9L39.4 47.5L39 35.5Z" fill="#d7d2c8" />
        <path d="M63 34.5C67 36.5 67.6 43.5 65.4 47.5C66.8 50.5 65.2 54.5 62 54.9L60.6 47.5L61 35.5Z" fill="#d7d2c8" />
        <path
          d="M35.4 39.5q1 3 0 6M64.6 39.5q-1 3 0 6"
          fill="none"
          stroke="#1e2130"
          strokeWidth="0.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity=".45"
        />
        <path
          d="M42.1 26.5Q49.1 23.5 56.1 26.5"
          fill="none"
          stroke="#f4ecd8"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity=".7"
        />
        <circle cx="42.3" cy="46.5" r="4.8" fill="rgba(255,255,255,.14)" stroke="#1e2130" strokeWidth="1.2" />
        <circle cx="55.1" cy="46.5" r="4.3" fill="rgba(255,255,255,.14)" stroke="#1e2130" strokeWidth="1.2" />
        <path
          d="M47.1 45.9Q48.9 44.7 50.8 45.9M37.5 46.1L34.9 45.3"
          fill="none"
          stroke="#1e2130"
          strokeWidth="1.1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M43.6 80.6L50 83.4L43.6 86.2ZM56.4 80.6L50 83.4L56.4 86.2Z"
          fill="#8a2f3a"
          transform="translate(0 -4)"
        />
        <circle cx="50" cy="79.4" r="1.7" fill="#612129" />
        <rect x="0" y="0" width="100" height="112" fill={`url(#${id}-tx-grano)`} opacity=".55" />
      </g>
      <rect x=".5" y=".5" width="99" height="111" fill="none" stroke="#1e2130" strokeWidth=".9" opacity=".55" />
    </>
  );
}
