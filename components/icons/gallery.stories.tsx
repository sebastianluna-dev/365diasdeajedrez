import type { ComponentType, CSSProperties } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Logo } from "@/components/site/shared/logo.comp";
import { ArrowLeftIcon } from "./arrow-left-icon.comp";
import { ArrowRightIcon } from "./arrow-right-icon.comp";
import { ArrowUpIcon } from "./arrow-up-icon.comp";
import { BoardFlipIcon } from "./board-flip-icon.comp";
import { CalendarCheckIcon } from "./calendar-check-icon.comp";
import { CalendarIcon } from "./calendar-icon.comp";
import { CaretRightIcon } from "./caret-right-icon.comp";
import { CheckIcon } from "./check-icon.comp";
import { ChevronIcon } from "./chevron-icon.comp";
import { CircleCheckIcon } from "./circle-check-icon.comp";
import { CircleCheckSolidIcon } from "./circle-check-solid-icon.comp";
import { ClipboardIcon } from "./clipboard-icon.comp";
import { CloseIcon } from "./close-icon.comp";
import { ExitIcon } from "./exit-icon.comp";
import { FlameIcon } from "./flame-icon.comp";
import { FlipIcon } from "./flip-icon.comp";
import { FullscreenIcon } from "./fullscreen-icon.comp";
import { GearIcon } from "./gear-icon.comp";
import { GripIcon } from "./grip-icon.comp";
import { HeartIcon } from "./heart-icon.comp";
import { HouseIcon } from "./house-icon.comp";
import { ImageIcon } from "./image-icon.comp";
import { InfoIcon } from "./info-icon.comp";
import { JumpEndIcon } from "./jump-end-icon.comp";
import { JumpStartIcon } from "./jump-start-icon.comp";
import { LogoMarkIcon } from "./logo-mark-icon.comp";
import { MenuIcon } from "./menu-icon.comp";
import { MoonIcon } from "./moon-icon.comp";
import { MoreIcon } from "./more-icon.comp";
import { NoteIcon } from "./note-icon.comp";
import { PauseIcon } from "./pause-icon.comp";
import { PlayIcon } from "./play-icon.comp";
import { PlusIcon } from "./plus-icon.comp";
import { RotateLeftIcon } from "./rotate-left-icon.comp";
import { SearchIcon } from "./search-icon.comp";
import { SkipIcon } from "./skip-icon.comp";
import { SoundOffIcon } from "./sound-off-icon.comp";
import { SoundOnIcon } from "./sound-on-icon.comp";
import { TrashIcon } from "./trash-icon.comp";
import { UserIcon } from "./user-icon.comp";
import { WhatsappIcon } from "./whatsapp-icon.comp";

/** An icon of the folder, with what the gallery needs to draw it. */
interface Glyph {
  /** The export, which is what the gallery prints under it. */
  name: string;
  Icon: ComponentType<{ className?: string }>;
  /** The icon's own `width` and `height` attributes, the size it draws with no stylesheet. */
  width: number;
  height: number;
  /** The height its main caller's stylesheet draws it at, in px. */
  size: number;
  /** That caller. */
  where: string;
}

/**
 * Every icon but the wordmark, by name. The sizes are read from the callers'
 * stylesheets; an icon several callers draw at different sizes is given its
 * most common one.
 */
const GLYPHS: Glyph[] = [
  { name: "ArrowLeftIcon", Icon: ArrowLeftIcon, width: 24, height: 24, size: 20, where: "game viewer" },
  { name: "ArrowRightIcon", Icon: ArrowRightIcon, width: 24, height: 24, size: 20, where: "game viewer" },
  { name: "ArrowUpIcon", Icon: ArrowUpIcon, width: 24, height: 24, size: 20, where: "move menu, user menu" },
  { name: "BoardFlipIcon", Icon: BoardFlipIcon, width: 24, height: 24, size: 20, where: "game viewer" },
  { name: "CalendarIcon", Icon: CalendarIcon, width: 24, height: 24, size: 18, where: "date picker" },
  { name: "CalendarCheckIcon", Icon: CalendarCheckIcon, width: 24, height: 24, size: 16, where: "teacher CTA (site)" },
  { name: "CaretRightIcon", Icon: CaretRightIcon, width: 8, height: 16, size: 14, where: "course trail" },
  { name: "CheckIcon", Icon: CheckIcon, width: 24, height: 24, size: 16, where: "select, check cards" },
  { name: "ChevronIcon", Icon: ChevronIcon, width: 24, height: 24, size: 14, where: "select, date picker" },
  { name: "CircleCheckIcon", Icon: CircleCheckIcon, width: 18, height: 18, size: 18, where: "plan card (site)" },
  { name: "CircleCheckSolidIcon", Icon: CircleCheckSolidIcon, width: 18, height: 18, size: 20, where: "course study" },
  { name: "ClipboardIcon", Icon: ClipboardIcon, width: 24, height: 24, size: 20, where: "move menu" },
  { name: "CloseIcon", Icon: CloseIcon, width: 20, height: 20, size: 20, where: "staff dialogs" },
  { name: "ExitIcon", Icon: ExitIcon, width: 24, height: 24, size: 19, where: "user menu" },
  { name: "FlameIcon", Icon: FlameIcon, width: 32, height: 32, size: 22, where: "user menu, streak" },
  { name: "FlipIcon", Icon: FlipIcon, width: 20, height: 20, size: 20, where: "board tools" },
  { name: "FullscreenIcon", Icon: FullscreenIcon, width: 24, height: 24, size: 18, where: "game viewer" },
  { name: "GearIcon", Icon: GearIcon, width: 24, height: 24, size: 19, where: "user menu" },
  { name: "GripIcon", Icon: GripIcon, width: 10, height: 16, size: 16, where: "syllabus rows" },
  { name: "HeartIcon", Icon: HeartIcon, width: 14, height: 14, size: 14, where: "reviews (site)" },
  { name: "HouseIcon", Icon: HouseIcon, width: 24, height: 24, size: 28, where: "mobile clock (site)" },
  { name: "ImageIcon", Icon: ImageIcon, width: 24, height: 24, size: 28, where: "image upload" },
  { name: "InfoIcon", Icon: InfoIcon, width: 24, height: 24, size: 18, where: "info tip" },
  { name: "JumpEndIcon", Icon: JumpEndIcon, width: 24, height: 24, size: 20, where: "game viewer" },
  { name: "JumpStartIcon", Icon: JumpStartIcon, width: 24, height: 24, size: 20, where: "game viewer" },
  { name: "LogoMarkIcon", Icon: LogoMarkIcon, width: 44, height: 44, size: 42, where: "study card" },
  { name: "MenuIcon", Icon: MenuIcon, width: 24, height: 24, size: 20, where: "game viewer" },
  { name: "MoonIcon", Icon: MoonIcon, width: 24, height: 24, size: 19, where: "user menu" },
  { name: "MoreIcon", Icon: MoreIcon, width: 16, height: 4, size: 4, where: "syllabus rows" },
  { name: "NoteIcon", Icon: NoteIcon, width: 24, height: 24, size: 20, where: "move menu" },
  { name: "PauseIcon", Icon: PauseIcon, width: 19, height: 22, size: 22, where: "board tools" },
  { name: "PlayIcon", Icon: PlayIcon, width: 19, height: 22, size: 22, where: "board tools" },
  { name: "PlusIcon", Icon: PlusIcon, width: 16, height: 16, size: 16, where: "FAQ (site)" },
  { name: "RotateLeftIcon", Icon: RotateLeftIcon, width: 24, height: 24, size: 28, where: "mobile clock (site)" },
  { name: "SearchIcon", Icon: SearchIcon, width: 24, height: 24, size: 18, where: "bar search" },
  { name: "SkipIcon", Icon: SkipIcon, width: 24, height: 24, size: 24, where: "board tools" },
  { name: "SoundOffIcon", Icon: SoundOffIcon, width: 24, height: 24, size: 18, where: "game viewer" },
  { name: "SoundOnIcon", Icon: SoundOnIcon, width: 24, height: 24, size: 18, where: "game viewer" },
  { name: "TrashIcon", Icon: TrashIcon, width: 24, height: 24, size: 20, where: "move menu" },
  { name: "UserIcon", Icon: UserIcon, width: 24, height: 24, size: 19, where: "user menu" },
  { name: "WhatsappIcon", Icon: WhatsappIcon, width: 16, height: 16, size: 16, where: "CTA (site)" },
];

/** The box every icon fits in the large gallery. */
const LARGE = 48;

/** The wordmark's height in the platform's bar and the site's header on desktop. */
const WORDMARK_HEIGHT = 20;

/**
 * An icon drawn `height` px tall. An icon takes only a class, and its size is
 * its caller's stylesheet's; with no stylesheet here, its <svg> is nested in
 * one whose viewBox is the icon's own width × height, which scales the drawing
 * exactly as a CSS width and height on it would. `overflow="visible"`: if an
 * icon's attributes change and the table above does not, the icon comes out a
 * little off its size instead of cut.
 */
function Drawn({ glyph, height }: { glyph: Glyph; height: number }) {
  const { Icon, width: ownWidth, height: ownHeight } = glyph;
  return (
    <svg
      width={(height * ownWidth) / ownHeight}
      height={height}
      viewBox={`0 0 ${ownWidth} ${ownHeight}`}
      overflow="visible"
      aria-hidden="true"
    >
      <Icon />
    </svg>
  );
}

const gridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(168px, 1fr))",
  gap: "var(--platform-space-3)",
};

const cellStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "var(--platform-space-1)",
  padding: "var(--platform-space-4) var(--platform-space-3)",
  borderRadius: "8px",
  background: "var(--platform-surface)",
  boxShadow: "var(--platform-shadow-card)",
  textAlign: "center",
};

const nameStyle: CSSProperties = {
  fontSize: "var(--platform-type-2xs)",
  color: "var(--platform-text)",
  overflowWrap: "anywhere",
};

const detailStyle: CSSProperties = { fontSize: "var(--platform-type-2xs)", color: "var(--platform-text-subtle)" };

type Scale = "app" | "large";

/**
 * The gallery: the icons in a grid, each with its export under it, and the
 * wordmark on a row of its own. At `app` each icon is as tall as its caller
 * draws it, in the text colour; at `large` each fits a 48px box, in the accent.
 */
function IconsGallery({ scale }: { scale: Scale }) {
  const large = scale === "large";
  const stage: CSSProperties = {
    display: "grid",
    placeItems: "center",
    height: large ? LARGE + 16 : 48,
    color: large ? "var(--platform-accent)" : "var(--platform-text)",
  };
  // The site's Logo reads its height from this token; set here, it reaches only the strip below.
  const wordmarkHeight = { "--site-logo-height": `${large ? LARGE : WORDMARK_HEIGHT}px` } as CSSProperties;
  return (
    <div className="platform-page">
      <header className="platform-page__head">
        <h1 className="platform-page__title">Icons</h1>
        <p className="platform-page__subtitle">
          {large
            ? `The ${GLYPHS.length + 1} icons of components/icons, each in a ${LARGE}px box, in the accent.`
            : `The ${GLYPHS.length + 1} icons of components/icons, each as tall as the app draws it.`}
        </p>
      </header>
      <ul style={gridStyle}>
        {GLYPHS.map((glyph) => {
          const height = large ? (LARGE * glyph.height) / Math.max(glyph.width, glyph.height) : glyph.size;
          return (
            <li key={glyph.name} style={cellStyle}>
              <span style={stage}>
                <Drawn glyph={glyph} height={height} />
              </span>
              <code style={nameStyle}>{glyph.name}</code>
              <span style={detailStyle}>{large ? glyph.where : `${glyph.size}px · ${glyph.where}`}</span>
            </li>
          );
        })}
        <li style={{ ...cellStyle, gridColumn: "1 / -1" }}>
          {/* The wordmark paints nothing by itself: its caller colours its three
              groups through their classes. Here its real caller does, the
              site's Logo, on the site's own dark background. */}
          <span
            style={{
              ...stage,
              ...wordmarkHeight,
              height: "auto",
              padding: "var(--platform-space-4) var(--platform-space-8)",
              borderRadius: "8px",
              background: "var(--background)",
            }}
          >
            <Logo theme="dark" accent="orange" />
          </span>
          <code style={nameStyle}>LogoWordmarkIcon</code>
          <span style={detailStyle}>
            {large ? LARGE : WORDMARK_HEIGHT}px · platform bar, site header · drawn by the site&apos;s Logo
          </span>
        </li>
      </ul>
    </div>
  );
}

const meta = {
  title: "icons/Gallery",
  parameters: {
    docs: {
      description: {
        component: `
Every icon of \`components/icons\`, one SVG per file, each with the name it is
exported by under it. All but the brand's two and WhatsApp's are Font Awesome
Pro 7.3.1 in Duotone Light: two layers filled with \`currentColor\`, the one at
the back at 40 %. An icon takes a \`className\` and nothing else: its size and
its colour are its caller's stylesheet's, so the accent gallery is the same
icons under another \`color\`. Each one is \`aria-hidden\`; the button around it
carries the name.

Here, with no stylesheet, the gallery scales each drawing to the size its main
caller gives it (the px under the name). Two take more than \`color\`:
\`FlameIcon\` has a front layer (outline and inner flame) its caller paints
through \`coreClassName\` (left unnamed here, the flame is one colour), and
\`LogoWordmarkIcon\` paints nothing by itself, so it is drawn by its real
caller, the site's \`Logo\`.

Reference: [Components › Icons](/components#icons--componentsicons) in the docs site.
`,
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** Every icon as tall as the app draws it, in the text colour, with its export, its size and its main caller. */
export const AtAppSize: Story = { render: () => <IconsGallery scale="app" /> };

/** Every icon in a 48px box and in the accent, to read each drawing and see it follow `color`; the wordmark keeps the site's colours. */
export const LargeInAccent: Story = { render: () => <IconsGallery scale="large" /> };
