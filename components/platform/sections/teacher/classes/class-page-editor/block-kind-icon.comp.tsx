import { BlockQuoteIcon } from "@/components/icons/block-quote-icon.comp";
import { BookIcon } from "@/components/icons/book-icon.comp";
import { ChessBoardIcon } from "@/components/icons/chess-board-icon.comp";
import { ChessPawnIcon } from "@/components/icons/chess-pawn-icon.comp";
import { CircleQuestionIcon } from "@/components/icons/circle-question-icon.comp";
import { FileIcon } from "@/components/icons/file-icon.comp";
import { H1Icon } from "@/components/icons/h1-icon.comp";
import { H2Icon } from "@/components/icons/h2-icon.comp";
import { HorizontalRuleIcon } from "@/components/icons/horizontal-rule-icon.comp";
import type { ReactElement } from "react";
import type { IconProps } from "@/components/icons/icon-variant.const";
import { LightbulbIcon } from "@/components/icons/lightbulb-icon.comp";
import { ListUlIcon } from "@/components/icons/list-ul-icon.comp";
import { PuzzlePieceIcon } from "@/components/icons/puzzle-piece-icon.comp";
import { TextIcon } from "@/components/icons/text-icon.comp";
import { VideoIcon } from "@/components/icons/video-icon.comp";
import type { EditorKind } from "./class-page-editor.model";

const ICONS: Record<EditorKind, (props: IconProps) => ReactElement> = {
  text: TextIcon,
  heading: H1Icon,
  subheading: H2Icon,
  list: ListUlIcon,
  quote: BlockQuoteIcon,
  callout: LightbulbIcon,
  divider: HorizontalRuleIcon,
  diagram: ChessBoardIcon,
  game: ChessPawnIcon,
  question: CircleQuestionIcon,
  exercises: PuzzlePieceIcon,
  lesson: BookIcon,
  video: VideoIcon,
  file: FileIcon,
};

/** The icon of a kind of block, the same in the «/» menu and on an empty block's picker. */
export function BlockKindIcon({ kind, className }: { kind: EditorKind; className?: string }) {
  const Icon = ICONS[kind];
  return <Icon className={className} />;
}
