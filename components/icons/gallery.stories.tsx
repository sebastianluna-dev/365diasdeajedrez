import type { ComponentType, CSSProperties } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Logo } from "@/components/site/shared/logo.comp";
import { ICON_VARIANTS, type IconProps, type IconVariant } from "./icon-variant.const";
import { AngleDownIcon } from "./angle-down-icon.comp";
import { AngleLeftIcon } from "./angle-left-icon.comp";
import { AngleRightIcon } from "./angle-right-icon.comp";
import { AngleUpIcon } from "./angle-up-icon.comp";
import { ArrowDownIcon } from "./arrow-down-icon.comp";
import { ArrowDownToLineIcon } from "./arrow-down-to-line-icon.comp";
import { ArrowLeftIcon } from "./arrow-left-icon.comp";
import { ArrowLeftLongIcon } from "./arrow-left-long-icon.comp";
import { ArrowRightArrowLeftIcon } from "./arrow-right-arrow-left-icon.comp";
import { ArrowRightFromBracketIcon } from "./arrow-right-from-bracket-icon.comp";
import { ArrowRightIcon } from "./arrow-right-icon.comp";
import { ArrowRightLongIcon } from "./arrow-right-long-icon.comp";
import { ArrowRightToBracketIcon } from "./arrow-right-to-bracket-icon.comp";
import { ArrowRightToLineIcon } from "./arrow-right-to-line-icon.comp";
import { ArrowRotateLeftIcon } from "./arrow-rotate-left-icon.comp";
import { ArrowRotateRightIcon } from "./arrow-rotate-right-icon.comp";
import { ArrowsLeftRightIcon } from "./arrows-left-right-icon.comp";
import { ArrowsRotateIcon } from "./arrows-rotate-icon.comp";
import { ArrowsUpDownIcon } from "./arrows-up-down-icon.comp";
import { ArrowUpFromLineIcon } from "./arrow-up-from-line-icon.comp";
import { ArrowUpIcon } from "./arrow-up-icon.comp";
import { ArrowUpRightFromSquareIcon } from "./arrow-up-right-from-square-icon.comp";
import { AtIcon } from "./at-icon.comp";
import { AwardIcon } from "./award-icon.comp";
import { BackwardFastIcon } from "./backward-fast-icon.comp";
import { BackwardIcon } from "./backward-icon.comp";
import { BackwardStepIcon } from "./backward-step-icon.comp";
import { BarsIcon } from "./bars-icon.comp";
import { BellIcon } from "./bell-icon.comp";
import { BellSlashIcon } from "./bell-slash-icon.comp";
import { BoltIcon } from "./bolt-icon.comp";
import { BookBookmarkIcon } from "./book-bookmark-icon.comp";
import { BookIcon } from "./book-icon.comp";
import { BookmarkIcon } from "./bookmark-icon.comp";
import { BookOpenIcon } from "./book-open-icon.comp";
import { BookOpenReaderIcon } from "./book-open-reader-icon.comp";
import { BoxArchiveIcon } from "./box-archive-icon.comp";
import { BrainIcon } from "./brain-icon.comp";
import { BullseyeIcon } from "./bullseye-icon.comp";
import { CalendarCheckIcon } from "./calendar-check-icon.comp";
import { CalendarDaysIcon } from "./calendar-days-icon.comp";
import { CalendarIcon } from "./calendar-icon.comp";
import { CalendarPlusIcon } from "./calendar-plus-icon.comp";
import { CalendarXmarkIcon } from "./calendar-xmark-icon.comp";
import { CameraIcon } from "./camera-icon.comp";
import { CaretDownIcon } from "./caret-down-icon.comp";
import { CaretLeftIcon } from "./caret-left-icon.comp";
import { CaretRightIcon } from "./caret-right-icon.comp";
import { CaretUpIcon } from "./caret-up-icon.comp";
import { CartShoppingIcon } from "./cart-shopping-icon.comp";
import { ChalkboardUserIcon } from "./chalkboard-user-icon.comp";
import { ChartLineIcon } from "./chart-line-icon.comp";
import { ChartPieIcon } from "./chart-pie-icon.comp";
import { ChartSimpleIcon } from "./chart-simple-icon.comp";
import { CheckDoubleIcon } from "./check-double-icon.comp";
import { CheckIcon } from "./check-icon.comp";
import { ChessBishopIcon } from "./chess-bishop-icon.comp";
import { ChessBishopPieceIcon } from "./chess-bishop-piece-icon.comp";
import { ChessBoardIcon } from "./chess-board-icon.comp";
import { ChessClockFlipIcon } from "./chess-clock-flip-icon.comp";
import { ChessClockIcon } from "./chess-clock-icon.comp";
import { ChessIcon } from "./chess-icon.comp";
import { ChessKingIcon } from "./chess-king-icon.comp";
import { ChessKingPieceIcon } from "./chess-king-piece-icon.comp";
import { ChessKnightIcon } from "./chess-knight-icon.comp";
import { ChessKnightPieceIcon } from "./chess-knight-piece-icon.comp";
import { ChessPawnIcon } from "./chess-pawn-icon.comp";
import { ChessPawnPieceIcon } from "./chess-pawn-piece-icon.comp";
import { ChessQueenIcon } from "./chess-queen-icon.comp";
import { ChessQueenPieceIcon } from "./chess-queen-piece-icon.comp";
import { ChessRookIcon } from "./chess-rook-icon.comp";
import { ChessRookPieceIcon } from "./chess-rook-piece-icon.comp";
import { ChevronDownIcon } from "./chevron-down-icon.comp";
import { ChevronLeftIcon } from "./chevron-left-icon.comp";
import { ChevronRightIcon } from "./chevron-right-icon.comp";
import { ChevronsLeftIcon } from "./chevrons-left-icon.comp";
import { ChevronsRightIcon } from "./chevrons-right-icon.comp";
import { ChevronUpIcon } from "./chevron-up-icon.comp";
import { CircleCheckIcon } from "./circle-check-icon.comp";
import { CircleDotIcon } from "./circle-dot-icon.comp";
import { CircleExclamationIcon } from "./circle-exclamation-icon.comp";
import { CircleHalfStrokeIcon } from "./circle-half-stroke-icon.comp";
import { CircleIcon } from "./circle-icon.comp";
import { CircleInfoIcon } from "./circle-info-icon.comp";
import { CircleMinusIcon } from "./circle-minus-icon.comp";
import { CircleNotchIcon } from "./circle-notch-icon.comp";
import { CirclePlayIcon } from "./circle-play-icon.comp";
import { CirclePlusIcon } from "./circle-plus-icon.comp";
import { CircleQuestionIcon } from "./circle-question-icon.comp";
import { CircleXmarkIcon } from "./circle-xmark-icon.comp";
import { ClipboardIcon } from "./clipboard-icon.comp";
import { ClipboardListIcon } from "./clipboard-list-icon.comp";
import { ClockIcon } from "./clock-icon.comp";
import { ClockRotateLeftIcon } from "./clock-rotate-left-icon.comp";
import { CoinsIcon } from "./coins-icon.comp";
import { CommentDotsIcon } from "./comment-dots-icon.comp";
import { CommentIcon } from "./comment-icon.comp";
import { CommentsIcon } from "./comments-icon.comp";
import { CompressIcon } from "./compress-icon.comp";
import { CopyIcon } from "./copy-icon.comp";
import { CreditCardIcon } from "./credit-card-icon.comp";
import { CrosshairsIcon } from "./crosshairs-icon.comp";
import { CrownIcon } from "./crown-icon.comp";
import { DesktopIcon } from "./desktop-icon.comp";
import { DownLeftAndUpRightToCenterIcon } from "./down-left-and-up-right-to-center-icon.comp";
import { DownloadIcon } from "./download-icon.comp";
import { EllipsisIcon } from "./ellipsis-icon.comp";
import { EllipsisVerticalIcon } from "./ellipsis-vertical-icon.comp";
import { EnvelopeIcon } from "./envelope-icon.comp";
import { EraserIcon } from "./eraser-icon.comp";
import { ExpandIcon } from "./expand-icon.comp";
import { EyeIcon } from "./eye-icon.comp";
import { EyeSlashIcon } from "./eye-slash-icon.comp";
import { FaceSmileIcon } from "./face-smile-icon.comp";
import { FileArrowDownIcon } from "./file-arrow-down-icon.comp";
import { FileIcon } from "./file-icon.comp";
import { FileLinesIcon } from "./file-lines-icon.comp";
import { FilmIcon } from "./film-icon.comp";
import { FilterIcon } from "./filter-icon.comp";
import { FireIcon } from "./fire-icon.comp";
import { FlagCheckeredIcon } from "./flag-checkered-icon.comp";
import { FlagIcon } from "./flag-icon.comp";
import { FloppyDiskIcon } from "./floppy-disk-icon.comp";
import { FolderIcon } from "./folder-icon.comp";
import { FolderOpenIcon } from "./folder-open-icon.comp";
import { ForwardFastIcon } from "./forward-fast-icon.comp";
import { ForwardIcon } from "./forward-icon.comp";
import { ForwardStepIcon } from "./forward-step-icon.comp";
import { GearIcon } from "./gear-icon.comp";
import { GiftIcon } from "./gift-icon.comp";
import { GlobeIcon } from "./globe-icon.comp";
import { GraduationCapIcon } from "./graduation-cap-icon.comp";
import { GripDotsIcon } from "./grip-dots-icon.comp";
import { GripDotsVerticalIcon } from "./grip-dots-vertical-icon.comp";
import { GripLinesIcon } from "./grip-lines-icon.comp";
import { HashtagIcon } from "./hashtag-icon.comp";
import { HeadphonesIcon } from "./headphones-icon.comp";
import { HeartIcon } from "./heart-icon.comp";
import { HourglassHalfIcon } from "./hourglass-half-icon.comp";
import { HourglassIcon } from "./hourglass-icon.comp";
import { HouseChimneyIcon } from "./house-chimney-icon.comp";
import { HouseIcon } from "./house-icon.comp";
import { IdCardIcon } from "./id-card-icon.comp";
import { ImageIcon } from "./image-icon.comp";
import { ImagesIcon } from "./images-icon.comp";
import { InboxIcon } from "./inbox-icon.comp";
import { KeyboardIcon } from "./keyboard-icon.comp";
import { KeyIcon } from "./key-icon.comp";
import { LanguageIcon } from "./language-icon.comp";
import { LaptopIcon } from "./laptop-icon.comp";
import { LayerGroupIcon } from "./layer-group-icon.comp";
import { LightbulbIcon } from "./lightbulb-icon.comp";
import { LinkIcon } from "./link-icon.comp";
import { ListCheckIcon } from "./list-check-icon.comp";
import { ListIcon } from "./list-icon.comp";
import { ListOlIcon } from "./list-ol-icon.comp";
import { LocationDotIcon } from "./location-dot-icon.comp";
import { LockIcon } from "./lock-icon.comp";
import { LockOpenIcon } from "./lock-open-icon.comp";
import { LogoMarkIcon } from "./logo-mark-icon.comp";
import { MagnifyingGlassIcon } from "./magnifying-glass-icon.comp";
import { MagnifyingGlassMinusIcon } from "./magnifying-glass-minus-icon.comp";
import { MagnifyingGlassPlusIcon } from "./magnifying-glass-plus-icon.comp";
import { MedalIcon } from "./medal-icon.comp";
import { MessageIcon } from "./message-icon.comp";
import { MicrophoneIcon } from "./microphone-icon.comp";
import { MinusIcon } from "./minus-icon.comp";
import { MobileIcon } from "./mobile-icon.comp";
import { MoonIcon } from "./moon-icon.comp";
import { PaletteIcon } from "./palette-icon.comp";
import { PaperPlaneIcon } from "./paper-plane-icon.comp";
import { PasteIcon } from "./paste-icon.comp";
import { PauseIcon } from "./pause-icon.comp";
import { PencilIcon } from "./pencil-icon.comp";
import { PenIcon } from "./pen-icon.comp";
import { PenToSquareIcon } from "./pen-to-square-icon.comp";
import { PhoneIcon } from "./phone-icon.comp";
import { PlayIcon } from "./play-icon.comp";
import { PlusIcon } from "./plus-icon.comp";
import { PrintIcon } from "./print-icon.comp";
import { PuzzlePieceIcon } from "./puzzle-piece-icon.comp";
import { RepeatIcon } from "./repeat-icon.comp";
import { ReplyIcon } from "./reply-icon.comp";
import { RightLeftIcon } from "./right-left-icon.comp";
import { RocketIcon } from "./rocket-icon.comp";
import { RotateIcon } from "./rotate-icon.comp";
import { SchoolIcon } from "./school-icon.comp";
import { ScissorsIcon } from "./scissors-icon.comp";
import { ShareIcon } from "./share-icon.comp";
import { ShareNodesIcon } from "./share-nodes-icon.comp";
import { ShieldCheckIcon } from "./shield-check-icon.comp";
import { ShuffleIcon } from "./shuffle-icon.comp";
import { SlidersIcon } from "./sliders-icon.comp";
import { SortIcon } from "./sort-icon.comp";
import { SparklesIcon } from "./sparkles-icon.comp";
import { SpinnerIcon } from "./spinner-icon.comp";
import { SquareCheckIcon } from "./square-check-icon.comp";
import { SquareIcon } from "./square-icon.comp";
import { StarHalfStrokeIcon } from "./star-half-stroke-icon.comp";
import { StarIcon } from "./star-icon.comp";
import { StopIcon } from "./stop-icon.comp";
import { StopwatchIcon } from "./stopwatch-icon.comp";
import { SunIcon } from "./sun-icon.comp";
import { TableCellsIcon } from "./table-cells-icon.comp";
import { TableListIcon } from "./table-list-icon.comp";
import { TagIcon } from "./tag-icon.comp";
import { ThumbsDownIcon } from "./thumbs-down-icon.comp";
import { ThumbsUpIcon } from "./thumbs-up-icon.comp";
import { ThumbtackIcon } from "./thumbtack-icon.comp";
import { TimerIcon } from "./timer-icon.comp";
import { ToggleOffIcon } from "./toggle-off-icon.comp";
import { ToggleOnIcon } from "./toggle-on-icon.comp";
import { TrashCanIcon } from "./trash-can-icon.comp";
import { TriangleExclamationIcon } from "./triangle-exclamation-icon.comp";
import { TrophyIcon } from "./trophy-icon.comp";
import { TrophyStarIcon } from "./trophy-star-icon.comp";
import { UploadIcon } from "./upload-icon.comp";
import { UpRightAndDownLeftFromCenterIcon } from "./up-right-and-down-left-from-center-icon.comp";
import { UserCheckIcon } from "./user-check-icon.comp";
import { UserGraduateIcon } from "./user-graduate-icon.comp";
import { UserIcon } from "./user-icon.comp";
import { UserPenIcon } from "./user-pen-icon.comp";
import { UserPlusIcon } from "./user-plus-icon.comp";
import { UsersIcon } from "./users-icon.comp";
import { VideoIcon } from "./video-icon.comp";
import { VolumeHighIcon } from "./volume-high-icon.comp";
import { VolumeLowIcon } from "./volume-low-icon.comp";
import { VolumeOffIcon } from "./volume-off-icon.comp";
import { VolumeXmarkIcon } from "./volume-xmark-icon.comp";
import { WalletIcon } from "./wallet-icon.comp";
import { WandMagicSparklesIcon } from "./wand-magic-sparkles-icon.comp";
import { WhatsappIcon } from "./whatsapp-icon.comp";
import { XmarkIcon } from "./xmark-icon.comp";

/** An icon of the folder, with what the gallery needs to draw it. */
interface Glyph {
  /** The export, which is what the gallery prints under it. */
  name: string;
  Icon: ComponentType<IconProps>;
  /** The icon's own `width` and `height` attributes, the size it draws with no stylesheet. */
  width: number;
  height: number;
  /**
   * Where the app draws it: the height its main caller's stylesheet gives it,
   * in px, that caller, and the weight it asks for. Absent for an icon of the
   * library nothing draws yet.
   */
  use?: { size: number; where: string; variant?: IconVariant };
  /** False for the brand's mark and WhatsApp's logo, which have one drawing and no `variant`. */
  variants?: false;
}

/**
 * Every icon but the wordmark, by name. The sizes are read from the callers'
 * stylesheets; an icon several callers draw at different sizes is given its
 * most common one.
 */
const GLYPHS: Glyph[] = [
  { name: "AngleDownIcon", Icon: AngleDownIcon, width: 24, height: 24 },
  { name: "AngleLeftIcon", Icon: AngleLeftIcon, width: 24, height: 24 },
  {
    name: "AngleRightIcon",
    Icon: AngleRightIcon,
    width: 24,
    height: 24,
    use: { size: 14, where: "select, date picker" },
  },
  { name: "AngleUpIcon", Icon: AngleUpIcon, width: 24, height: 24 },
  { name: "ArrowDownIcon", Icon: ArrowDownIcon, width: 24, height: 24 },
  { name: "ArrowDownToLineIcon", Icon: ArrowDownToLineIcon, width: 24, height: 24 },
  { name: "ArrowLeftIcon", Icon: ArrowLeftIcon, width: 24, height: 24 },
  { name: "ArrowLeftLongIcon", Icon: ArrowLeftLongIcon, width: 24, height: 24 },
  {
    name: "ArrowRightArrowLeftIcon",
    Icon: ArrowRightArrowLeftIcon,
    width: 24,
    height: 24,
    use: { size: 20, where: "game viewer" },
  },
  {
    name: "ArrowRightFromBracketIcon",
    Icon: ArrowRightFromBracketIcon,
    width: 24,
    height: 24,
    use: { size: 19, where: "user menu" },
  },
  { name: "ArrowRightIcon", Icon: ArrowRightIcon, width: 24, height: 24 },
  { name: "ArrowRightLongIcon", Icon: ArrowRightLongIcon, width: 24, height: 24 },
  { name: "ArrowRightToBracketIcon", Icon: ArrowRightToBracketIcon, width: 24, height: 24 },
  {
    name: "ArrowRightToLineIcon",
    Icon: ArrowRightToLineIcon,
    width: 24,
    height: 24,
    use: { size: 24, where: "board tools" },
  },
  {
    name: "ArrowRotateLeftIcon",
    Icon: ArrowRotateLeftIcon,
    width: 24,
    height: 24,
    use: { size: 28, where: "mobile clock (site)" },
  },
  { name: "ArrowRotateRightIcon", Icon: ArrowRotateRightIcon, width: 24, height: 24 },
  { name: "ArrowsLeftRightIcon", Icon: ArrowsLeftRightIcon, width: 24, height: 24 },
  { name: "ArrowsRotateIcon", Icon: ArrowsRotateIcon, width: 20, height: 20, use: { size: 20, where: "board tools" } },
  { name: "ArrowsUpDownIcon", Icon: ArrowsUpDownIcon, width: 24, height: 24 },
  { name: "ArrowUpFromLineIcon", Icon: ArrowUpFromLineIcon, width: 24, height: 24 },
  { name: "ArrowUpIcon", Icon: ArrowUpIcon, width: 24, height: 24, use: { size: 20, where: "move menu, user menu" } },
  { name: "ArrowUpRightFromSquareIcon", Icon: ArrowUpRightFromSquareIcon, width: 24, height: 24 },
  { name: "AtIcon", Icon: AtIcon, width: 24, height: 24 },
  { name: "AwardIcon", Icon: AwardIcon, width: 24, height: 24 },
  { name: "BackwardFastIcon", Icon: BackwardFastIcon, width: 24, height: 24 },
  { name: "BackwardIcon", Icon: BackwardIcon, width: 24, height: 24 },
  {
    name: "BackwardStepIcon",
    Icon: BackwardStepIcon,
    width: 24,
    height: 24,
    use: { size: 20, where: "game viewer", variant: "solid" },
  },
  { name: "BarsIcon", Icon: BarsIcon, width: 24, height: 24, use: { size: 20, where: "game viewer" } },
  { name: "BellIcon", Icon: BellIcon, width: 24, height: 24 },
  { name: "BellSlashIcon", Icon: BellSlashIcon, width: 24, height: 24 },
  { name: "BoltIcon", Icon: BoltIcon, width: 24, height: 24 },
  { name: "BookBookmarkIcon", Icon: BookBookmarkIcon, width: 24, height: 24 },
  { name: "BookIcon", Icon: BookIcon, width: 24, height: 24 },
  { name: "BookmarkIcon", Icon: BookmarkIcon, width: 24, height: 24 },
  { name: "BookOpenIcon", Icon: BookOpenIcon, width: 24, height: 24 },
  { name: "BookOpenReaderIcon", Icon: BookOpenReaderIcon, width: 24, height: 24 },
  { name: "BoxArchiveIcon", Icon: BoxArchiveIcon, width: 24, height: 24 },
  { name: "BrainIcon", Icon: BrainIcon, width: 24, height: 24 },
  { name: "BullseyeIcon", Icon: BullseyeIcon, width: 24, height: 24 },
  {
    name: "CalendarCheckIcon",
    Icon: CalendarCheckIcon,
    width: 24,
    height: 24,
    use: { size: 16, where: "teacher CTA (site)" },
  },
  { name: "CalendarDaysIcon", Icon: CalendarDaysIcon, width: 24, height: 24 },
  { name: "CalendarIcon", Icon: CalendarIcon, width: 24, height: 24, use: { size: 18, where: "date picker" } },
  { name: "CalendarPlusIcon", Icon: CalendarPlusIcon, width: 24, height: 24 },
  { name: "CalendarXmarkIcon", Icon: CalendarXmarkIcon, width: 24, height: 24 },
  { name: "CameraIcon", Icon: CameraIcon, width: 24, height: 24 },
  { name: "CaretDownIcon", Icon: CaretDownIcon, width: 24, height: 24 },
  { name: "CaretLeftIcon", Icon: CaretLeftIcon, width: 24, height: 24 },
  {
    name: "CaretRightIcon",
    Icon: CaretRightIcon,
    width: 8,
    height: 16,
    use: { size: 14, where: "course trail", variant: "solid" },
  },
  { name: "CaretUpIcon", Icon: CaretUpIcon, width: 24, height: 24 },
  { name: "CartShoppingIcon", Icon: CartShoppingIcon, width: 24, height: 24 },
  { name: "ChalkboardUserIcon", Icon: ChalkboardUserIcon, width: 24, height: 24 },
  { name: "ChartLineIcon", Icon: ChartLineIcon, width: 24, height: 24 },
  { name: "ChartPieIcon", Icon: ChartPieIcon, width: 24, height: 24 },
  { name: "ChartSimpleIcon", Icon: ChartSimpleIcon, width: 24, height: 24 },
  { name: "CheckDoubleIcon", Icon: CheckDoubleIcon, width: 24, height: 24 },
  { name: "CheckIcon", Icon: CheckIcon, width: 24, height: 24, use: { size: 16, where: "select, check cards" } },
  { name: "ChessBishopIcon", Icon: ChessBishopIcon, width: 24, height: 24 },
  { name: "ChessBishopPieceIcon", Icon: ChessBishopPieceIcon, width: 24, height: 24 },
  { name: "ChessBoardIcon", Icon: ChessBoardIcon, width: 24, height: 24 },
  { name: "ChessClockFlipIcon", Icon: ChessClockFlipIcon, width: 24, height: 24 },
  { name: "ChessClockIcon", Icon: ChessClockIcon, width: 24, height: 24 },
  { name: "ChessIcon", Icon: ChessIcon, width: 24, height: 24 },
  { name: "ChessKingIcon", Icon: ChessKingIcon, width: 24, height: 24 },
  { name: "ChessKingPieceIcon", Icon: ChessKingPieceIcon, width: 24, height: 24 },
  { name: "ChessKnightIcon", Icon: ChessKnightIcon, width: 24, height: 24 },
  { name: "ChessKnightPieceIcon", Icon: ChessKnightPieceIcon, width: 24, height: 24 },
  { name: "ChessPawnIcon", Icon: ChessPawnIcon, width: 24, height: 24 },
  { name: "ChessPawnPieceIcon", Icon: ChessPawnPieceIcon, width: 24, height: 24 },
  { name: "ChessQueenIcon", Icon: ChessQueenIcon, width: 24, height: 24 },
  { name: "ChessQueenPieceIcon", Icon: ChessQueenPieceIcon, width: 24, height: 24 },
  { name: "ChessRookIcon", Icon: ChessRookIcon, width: 24, height: 24 },
  { name: "ChessRookPieceIcon", Icon: ChessRookPieceIcon, width: 24, height: 24 },
  { name: "ChevronDownIcon", Icon: ChevronDownIcon, width: 24, height: 24 },
  { name: "ChevronLeftIcon", Icon: ChevronLeftIcon, width: 24, height: 24, use: { size: 20, where: "game viewer" } },
  { name: "ChevronRightIcon", Icon: ChevronRightIcon, width: 24, height: 24, use: { size: 20, where: "game viewer" } },
  { name: "ChevronsLeftIcon", Icon: ChevronsLeftIcon, width: 24, height: 24 },
  { name: "ChevronsRightIcon", Icon: ChevronsRightIcon, width: 24, height: 24 },
  { name: "ChevronUpIcon", Icon: ChevronUpIcon, width: 24, height: 24 },
  {
    name: "CircleCheckIcon",
    Icon: CircleCheckIcon,
    width: 18,
    height: 18,
    use: { size: 18, where: "plan card (site)" },
  },
  { name: "CircleDotIcon", Icon: CircleDotIcon, width: 24, height: 24 },
  { name: "CircleExclamationIcon", Icon: CircleExclamationIcon, width: 24, height: 24 },
  { name: "CircleHalfStrokeIcon", Icon: CircleHalfStrokeIcon, width: 24, height: 24 },
  { name: "CircleIcon", Icon: CircleIcon, width: 24, height: 24 },
  { name: "CircleInfoIcon", Icon: CircleInfoIcon, width: 24, height: 24, use: { size: 18, where: "info tip" } },
  { name: "CircleMinusIcon", Icon: CircleMinusIcon, width: 24, height: 24 },
  { name: "CircleNotchIcon", Icon: CircleNotchIcon, width: 24, height: 24 },
  { name: "CirclePlayIcon", Icon: CirclePlayIcon, width: 24, height: 24 },
  { name: "CirclePlusIcon", Icon: CirclePlusIcon, width: 24, height: 24 },
  { name: "CircleQuestionIcon", Icon: CircleQuestionIcon, width: 24, height: 24 },
  { name: "CircleXmarkIcon", Icon: CircleXmarkIcon, width: 24, height: 24 },
  { name: "ClipboardIcon", Icon: ClipboardIcon, width: 24, height: 24, use: { size: 20, where: "move menu" } },
  { name: "ClipboardListIcon", Icon: ClipboardListIcon, width: 24, height: 24 },
  { name: "ClockIcon", Icon: ClockIcon, width: 24, height: 24 },
  { name: "ClockRotateLeftIcon", Icon: ClockRotateLeftIcon, width: 24, height: 24 },
  { name: "CoinsIcon", Icon: CoinsIcon, width: 24, height: 24 },
  { name: "CommentDotsIcon", Icon: CommentDotsIcon, width: 24, height: 24 },
  { name: "CommentIcon", Icon: CommentIcon, width: 24, height: 24, use: { size: 20, where: "move menu" } },
  { name: "CommentsIcon", Icon: CommentsIcon, width: 24, height: 24 },
  { name: "CompressIcon", Icon: CompressIcon, width: 24, height: 24 },
  { name: "CopyIcon", Icon: CopyIcon, width: 24, height: 24 },
  { name: "CreditCardIcon", Icon: CreditCardIcon, width: 24, height: 24 },
  { name: "CrosshairsIcon", Icon: CrosshairsIcon, width: 24, height: 24 },
  { name: "CrownIcon", Icon: CrownIcon, width: 24, height: 24 },
  { name: "DesktopIcon", Icon: DesktopIcon, width: 24, height: 24 },
  { name: "DownLeftAndUpRightToCenterIcon", Icon: DownLeftAndUpRightToCenterIcon, width: 24, height: 24 },
  { name: "DownloadIcon", Icon: DownloadIcon, width: 24, height: 24 },
  {
    name: "EllipsisIcon",
    Icon: EllipsisIcon,
    width: 16,
    height: 4,
    use: { size: 4, where: "syllabus rows", variant: "solid" },
  },
  { name: "EllipsisVerticalIcon", Icon: EllipsisVerticalIcon, width: 24, height: 24 },
  { name: "EnvelopeIcon", Icon: EnvelopeIcon, width: 24, height: 24 },
  { name: "EraserIcon", Icon: EraserIcon, width: 24, height: 24 },
  { name: "ExpandIcon", Icon: ExpandIcon, width: 24, height: 24, use: { size: 18, where: "game viewer" } },
  { name: "EyeIcon", Icon: EyeIcon, width: 24, height: 24 },
  { name: "EyeSlashIcon", Icon: EyeSlashIcon, width: 24, height: 24 },
  { name: "FaceSmileIcon", Icon: FaceSmileIcon, width: 24, height: 24 },
  { name: "FileArrowDownIcon", Icon: FileArrowDownIcon, width: 24, height: 24 },
  { name: "FileIcon", Icon: FileIcon, width: 24, height: 24 },
  { name: "FileLinesIcon", Icon: FileLinesIcon, width: 24, height: 24 },
  { name: "FilmIcon", Icon: FilmIcon, width: 24, height: 24 },
  { name: "FilterIcon", Icon: FilterIcon, width: 24, height: 24 },
  {
    name: "FireIcon",
    Icon: FireIcon,
    width: 32,
    height: 32,
    use: { size: 22, where: "user menu, streak", variant: "solid" },
  },
  { name: "FlagCheckeredIcon", Icon: FlagCheckeredIcon, width: 24, height: 24 },
  { name: "FlagIcon", Icon: FlagIcon, width: 24, height: 24 },
  { name: "FloppyDiskIcon", Icon: FloppyDiskIcon, width: 24, height: 24 },
  { name: "FolderIcon", Icon: FolderIcon, width: 24, height: 24 },
  { name: "FolderOpenIcon", Icon: FolderOpenIcon, width: 24, height: 24 },
  { name: "ForwardFastIcon", Icon: ForwardFastIcon, width: 24, height: 24 },
  { name: "ForwardIcon", Icon: ForwardIcon, width: 24, height: 24 },
  {
    name: "ForwardStepIcon",
    Icon: ForwardStepIcon,
    width: 24,
    height: 24,
    use: { size: 20, where: "game viewer", variant: "solid" },
  },
  { name: "GearIcon", Icon: GearIcon, width: 24, height: 24 },
  { name: "GiftIcon", Icon: GiftIcon, width: 24, height: 24 },
  { name: "GlobeIcon", Icon: GlobeIcon, width: 24, height: 24 },
  { name: "GraduationCapIcon", Icon: GraduationCapIcon, width: 24, height: 24 },
  { name: "GripDotsIcon", Icon: GripDotsIcon, width: 24, height: 24 },
  {
    name: "GripDotsVerticalIcon",
    Icon: GripDotsVerticalIcon,
    width: 10,
    height: 16,
    use: { size: 16, where: "syllabus rows", variant: "solid" },
  },
  { name: "GripLinesIcon", Icon: GripLinesIcon, width: 24, height: 24 },
  { name: "HashtagIcon", Icon: HashtagIcon, width: 24, height: 24 },
  { name: "HeadphonesIcon", Icon: HeadphonesIcon, width: 24, height: 24 },
  {
    name: "HeartIcon",
    Icon: HeartIcon,
    width: 14,
    height: 14,
    use: { size: 14, where: "reviews (site)", variant: "solid" },
  },
  { name: "HourglassHalfIcon", Icon: HourglassHalfIcon, width: 24, height: 24 },
  { name: "HourglassIcon", Icon: HourglassIcon, width: 24, height: 24 },
  { name: "HouseChimneyIcon", Icon: HouseChimneyIcon, width: 24, height: 24 },
  { name: "HouseIcon", Icon: HouseIcon, width: 24, height: 24, use: { size: 28, where: "mobile clock (site)" } },
  { name: "IdCardIcon", Icon: IdCardIcon, width: 24, height: 24 },
  { name: "ImageIcon", Icon: ImageIcon, width: 24, height: 24, use: { size: 28, where: "image upload" } },
  { name: "ImagesIcon", Icon: ImagesIcon, width: 24, height: 24 },
  { name: "InboxIcon", Icon: InboxIcon, width: 24, height: 24 },
  { name: "KeyboardIcon", Icon: KeyboardIcon, width: 24, height: 24 },
  { name: "KeyIcon", Icon: KeyIcon, width: 24, height: 24 },
  { name: "LanguageIcon", Icon: LanguageIcon, width: 24, height: 24 },
  { name: "LaptopIcon", Icon: LaptopIcon, width: 24, height: 24 },
  { name: "LayerGroupIcon", Icon: LayerGroupIcon, width: 24, height: 24 },
  { name: "LightbulbIcon", Icon: LightbulbIcon, width: 24, height: 24 },
  { name: "LinkIcon", Icon: LinkIcon, width: 24, height: 24 },
  { name: "ListCheckIcon", Icon: ListCheckIcon, width: 24, height: 24 },
  { name: "ListIcon", Icon: ListIcon, width: 24, height: 24 },
  { name: "ListOlIcon", Icon: ListOlIcon, width: 24, height: 24 },
  { name: "LocationDotIcon", Icon: LocationDotIcon, width: 24, height: 24 },
  { name: "LockIcon", Icon: LockIcon, width: 24, height: 24 },
  { name: "LockOpenIcon", Icon: LockOpenIcon, width: 24, height: 24 },
  {
    name: "LogoMarkIcon",
    Icon: LogoMarkIcon,
    width: 44,
    height: 44,
    use: { size: 42, where: "study card" },
    variants: false,
  },
  {
    name: "MagnifyingGlassIcon",
    Icon: MagnifyingGlassIcon,
    width: 24,
    height: 24,
    use: { size: 18, where: "bar search" },
  },
  { name: "MagnifyingGlassMinusIcon", Icon: MagnifyingGlassMinusIcon, width: 24, height: 24 },
  { name: "MagnifyingGlassPlusIcon", Icon: MagnifyingGlassPlusIcon, width: 24, height: 24 },
  { name: "MedalIcon", Icon: MedalIcon, width: 24, height: 24 },
  { name: "MessageIcon", Icon: MessageIcon, width: 24, height: 24 },
  { name: "MicrophoneIcon", Icon: MicrophoneIcon, width: 24, height: 24 },
  { name: "MinusIcon", Icon: MinusIcon, width: 24, height: 24 },
  { name: "MobileIcon", Icon: MobileIcon, width: 24, height: 24 },
  { name: "MoonIcon", Icon: MoonIcon, width: 24, height: 24, use: { size: 19, where: "user menu" } },
  { name: "PaletteIcon", Icon: PaletteIcon, width: 24, height: 24 },
  { name: "PaperPlaneIcon", Icon: PaperPlaneIcon, width: 24, height: 24 },
  { name: "PasteIcon", Icon: PasteIcon, width: 24, height: 24 },
  {
    name: "PauseIcon",
    Icon: PauseIcon,
    width: 19,
    height: 22,
    use: { size: 22, where: "board tools", variant: "solid" },
  },
  { name: "PencilIcon", Icon: PencilIcon, width: 24, height: 24 },
  { name: "PenIcon", Icon: PenIcon, width: 24, height: 24 },
  { name: "PenToSquareIcon", Icon: PenToSquareIcon, width: 24, height: 24 },
  { name: "PhoneIcon", Icon: PhoneIcon, width: 24, height: 24 },
  {
    name: "PlayIcon",
    Icon: PlayIcon,
    width: 19,
    height: 22,
    use: { size: 22, where: "board tools", variant: "solid" },
  },
  { name: "PlusIcon", Icon: PlusIcon, width: 16, height: 16, use: { size: 16, where: "FAQ (site)" } },
  { name: "PrintIcon", Icon: PrintIcon, width: 24, height: 24 },
  { name: "PuzzlePieceIcon", Icon: PuzzlePieceIcon, width: 24, height: 24 },
  { name: "RepeatIcon", Icon: RepeatIcon, width: 24, height: 24 },
  { name: "ReplyIcon", Icon: ReplyIcon, width: 24, height: 24 },
  { name: "RightLeftIcon", Icon: RightLeftIcon, width: 24, height: 24 },
  { name: "RocketIcon", Icon: RocketIcon, width: 24, height: 24 },
  { name: "RotateIcon", Icon: RotateIcon, width: 24, height: 24 },
  { name: "SchoolIcon", Icon: SchoolIcon, width: 24, height: 24 },
  { name: "ScissorsIcon", Icon: ScissorsIcon, width: 24, height: 24 },
  { name: "ShareIcon", Icon: ShareIcon, width: 24, height: 24 },
  { name: "ShareNodesIcon", Icon: ShareNodesIcon, width: 24, height: 24 },
  { name: "ShieldCheckIcon", Icon: ShieldCheckIcon, width: 24, height: 24 },
  { name: "ShuffleIcon", Icon: ShuffleIcon, width: 24, height: 24 },
  { name: "SlidersIcon", Icon: SlidersIcon, width: 24, height: 24, use: { size: 19, where: "user menu" } },
  { name: "SortIcon", Icon: SortIcon, width: 24, height: 24 },
  { name: "SparklesIcon", Icon: SparklesIcon, width: 24, height: 24 },
  { name: "SpinnerIcon", Icon: SpinnerIcon, width: 24, height: 24 },
  { name: "SquareCheckIcon", Icon: SquareCheckIcon, width: 24, height: 24 },
  { name: "SquareIcon", Icon: SquareIcon, width: 24, height: 24 },
  { name: "StarHalfStrokeIcon", Icon: StarHalfStrokeIcon, width: 24, height: 24 },
  { name: "StarIcon", Icon: StarIcon, width: 24, height: 24 },
  { name: "StopIcon", Icon: StopIcon, width: 24, height: 24 },
  { name: "StopwatchIcon", Icon: StopwatchIcon, width: 24, height: 24 },
  { name: "SunIcon", Icon: SunIcon, width: 24, height: 24 },
  { name: "TableCellsIcon", Icon: TableCellsIcon, width: 24, height: 24 },
  { name: "TableListIcon", Icon: TableListIcon, width: 24, height: 24 },
  { name: "TagIcon", Icon: TagIcon, width: 24, height: 24 },
  { name: "ThumbsDownIcon", Icon: ThumbsDownIcon, width: 24, height: 24 },
  { name: "ThumbsUpIcon", Icon: ThumbsUpIcon, width: 24, height: 24 },
  { name: "ThumbtackIcon", Icon: ThumbtackIcon, width: 24, height: 24 },
  { name: "TimerIcon", Icon: TimerIcon, width: 24, height: 24 },
  { name: "ToggleOffIcon", Icon: ToggleOffIcon, width: 24, height: 24 },
  { name: "ToggleOnIcon", Icon: ToggleOnIcon, width: 24, height: 24 },
  { name: "TrashCanIcon", Icon: TrashCanIcon, width: 24, height: 24, use: { size: 20, where: "move menu" } },
  { name: "TriangleExclamationIcon", Icon: TriangleExclamationIcon, width: 24, height: 24 },
  { name: "TrophyIcon", Icon: TrophyIcon, width: 24, height: 24 },
  { name: "TrophyStarIcon", Icon: TrophyStarIcon, width: 24, height: 24 },
  { name: "UploadIcon", Icon: UploadIcon, width: 24, height: 24 },
  { name: "UpRightAndDownLeftFromCenterIcon", Icon: UpRightAndDownLeftFromCenterIcon, width: 24, height: 24 },
  { name: "UserCheckIcon", Icon: UserCheckIcon, width: 24, height: 24 },
  { name: "UserGraduateIcon", Icon: UserGraduateIcon, width: 24, height: 24 },
  { name: "UserIcon", Icon: UserIcon, width: 24, height: 24, use: { size: 19, where: "user menu" } },
  { name: "UserPenIcon", Icon: UserPenIcon, width: 24, height: 24 },
  { name: "UserPlusIcon", Icon: UserPlusIcon, width: 24, height: 24 },
  { name: "UsersIcon", Icon: UsersIcon, width: 24, height: 24 },
  { name: "VideoIcon", Icon: VideoIcon, width: 24, height: 24 },
  { name: "VolumeHighIcon", Icon: VolumeHighIcon, width: 24, height: 24 },
  { name: "VolumeLowIcon", Icon: VolumeLowIcon, width: 24, height: 24, use: { size: 18, where: "game viewer" } },
  { name: "VolumeOffIcon", Icon: VolumeOffIcon, width: 24, height: 24 },
  { name: "VolumeXmarkIcon", Icon: VolumeXmarkIcon, width: 24, height: 24, use: { size: 18, where: "game viewer" } },
  { name: "WalletIcon", Icon: WalletIcon, width: 24, height: 24 },
  { name: "WandMagicSparklesIcon", Icon: WandMagicSparklesIcon, width: 24, height: 24 },
  {
    name: "WhatsappIcon",
    Icon: WhatsappIcon,
    width: 16,
    height: 16,
    use: { size: 16, where: "CTA (site)" },
    variants: false,
  },
  { name: "XmarkIcon", Icon: XmarkIcon, width: 20, height: 20, use: { size: 20, where: "staff dialogs" } },
];

const IN_USE = GLYPHS.filter((glyph) => glyph.use);

/** The box every icon fits in the large gallery. */
const LARGE = 48;

/** The wordmark's height in the platform's bar and the site's header on desktop. */
const WORDMARK_HEIGHT = 20;

/**
 * An icon drawn `height` px tall. An icon takes only a class and its weight,
 * and its size is its caller's stylesheet's; with no stylesheet here, its
 * <svg> is nested in one whose viewBox is the icon's own width × height,
 * which scales the drawing exactly as a CSS width and height on it would.
 * `overflow="visible"`: if an icon's attributes change and the table above
 * does not, the icon comes out a little off its size instead of cut.
 */
function Drawn({ glyph, height, variant }: { glyph: Glyph; height: number; variant?: IconVariant }) {
  const { Icon, width: ownWidth, height: ownHeight } = glyph;
  return (
    <svg
      width={(height * ownWidth) / ownHeight}
      height={height}
      viewBox={`0 0 ${ownWidth} ${ownHeight}`}
      overflow="visible"
      aria-hidden="true"
    >
      <Icon variant={variant} />
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
 * The gallery, with each icon's export under it and the wordmark on a row of
 * its own. At `app`, the icons the app draws, each as tall and in the weight
 * its caller asks for, in the text colour; at `large`, every icon of the
 * library in a 48px box, Duotone Light beside Duotone Solid, in the accent.
 */
function IconsGallery({ scale }: { scale: Scale }) {
  const large = scale === "large";
  const glyphs = large ? GLYPHS : IN_USE;
  const stage: CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "var(--platform-space-4)",
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
            ? `All ${GLYPHS.length + 1} icons of components/icons, each in a ${LARGE}px box, in the accent: Duotone Light, then Duotone Solid.`
            : `The ${IN_USE.length + 1} icons the app draws, each as tall and in the weight its caller asks for.`}
        </p>
      </header>
      <ul style={gridStyle}>
        {glyphs.map((glyph) => {
          const height = large ? (LARGE * glyph.height) / Math.max(glyph.width, glyph.height) : (glyph.use?.size ?? 24);
          const variants: (IconVariant | undefined)[] =
            large && glyph.variants !== false ? [...ICON_VARIANTS] : [glyph.use?.variant];
          return (
            <li key={glyph.name} style={cellStyle}>
              <span style={stage}>
                {variants.map((variant) => (
                  <Drawn key={variant ?? "only"} glyph={glyph} height={height} variant={variant} />
                ))}
              </span>
              <code style={nameStyle}>{glyph.name}</code>
              <span style={detailStyle}>
                {large ? (glyph.use?.where ?? "not drawn yet") : `${glyph.use?.size}px · ${glyph.use?.where}`}
              </span>
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
Pro 7.3.1, named as Font Awesome names them (\`chess-knight\` is
\`ChessKnightIcon\` in \`chess-knight-icon.comp.tsx\`), and take a \`variant\`:
Duotone Light, the default, or Duotone Solid. Both are two layers filled with
\`currentColor\`, the one at the back at 40 %. An icon takes a \`className\`
and its \`variant\`, nothing else: its size and its colour are its caller's
stylesheet's, so the accent gallery is the same icons under another \`color\`.
Each one is \`aria-hidden\`; the button around it carries the name.

Most of the library is not drawn by the app yet: it is there so a new screen
picks an icon from the set instead of drawing one. With no stylesheet here,
\`AtAppSize\` scales each icon the app draws to the size its main caller gives
it (the px under the name), in the weight that caller asks for. Two take more
than \`color\`: \`FireIcon\` has an inner flame its caller paints through
\`coreClassName\` (left unnamed here, the flame is one colour), and
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

/** The icons the app draws, each as tall and in the weight its caller asks for, in the text colour, with its export, its size and its main caller. */
export const AtAppSize: Story = { render: () => <IconsGallery scale="app" /> };

/** Every icon of the library in a 48px box and in the accent, Duotone Light beside Duotone Solid; the wordmark keeps the site's colours. */
export const LargeInAccent: Story = { render: () => <IconsGallery scale="large" /> };
