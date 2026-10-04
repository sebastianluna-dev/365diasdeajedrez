import type { ComponentType, CSSProperties } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Logo } from "@/components/site/shared/logo.comp";
import { ICON_VARIANTS, type IconProps, type IconVariant } from "./icon-variant.const";
import { AddressCardIcon } from "./address-card-icon.comp";
import { AlarmClockIcon } from "./alarm-clock-icon.comp";
import { AlignCenterIcon } from "./align-center-icon.comp";
import { AlignJustifyIcon } from "./align-justify-icon.comp";
import { AlignLeftIcon } from "./align-left-icon.comp";
import { AlignRightIcon } from "./align-right-icon.comp";
import { AngleDownIcon } from "./angle-down-icon.comp";
import { AngleLeftIcon } from "./angle-left-icon.comp";
import { AngleRightIcon } from "./angle-right-icon.comp";
import { AngleUpIcon } from "./angle-up-icon.comp";
import { ArrowDownAZIcon } from "./arrow-down-a-z-icon.comp";
import { ArrowDownIcon } from "./arrow-down-icon.comp";
import { ArrowDownToLineIcon } from "./arrow-down-to-line-icon.comp";
import { ArrowDownWideShortIcon } from "./arrow-down-wide-short-icon.comp";
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
import { ArrowTrendDownIcon } from "./arrow-trend-down-icon.comp";
import { ArrowTrendUpIcon } from "./arrow-trend-up-icon.comp";
import { ArrowTurnDownIcon } from "./arrow-turn-down-icon.comp";
import { ArrowTurnUpIcon } from "./arrow-turn-up-icon.comp";
import { ArrowUpFromLineIcon } from "./arrow-up-from-line-icon.comp";
import { ArrowUpIcon } from "./arrow-up-icon.comp";
import { ArrowUpRightFromSquareIcon } from "./arrow-up-right-from-square-icon.comp";
import { ArrowUpWideShortIcon } from "./arrow-up-wide-short-icon.comp";
import { ArrowUpZAIcon } from "./arrow-up-z-a-icon.comp";
import { AtIcon } from "./at-icon.comp";
import { AtomIcon } from "./atom-icon.comp";
import { AwardIcon } from "./award-icon.comp";
import { BackwardFastIcon } from "./backward-fast-icon.comp";
import { BackwardIcon } from "./backward-icon.comp";
import { BackwardStepIcon } from "./backward-step-icon.comp";
import { BagShoppingIcon } from "./bag-shopping-icon.comp";
import { BanIcon } from "./ban-icon.comp";
import { BarsIcon } from "./bars-icon.comp";
import { BarsProgressIcon } from "./bars-progress-icon.comp";
import { BarsStaggeredIcon } from "./bars-staggered-icon.comp";
import { BasketShoppingIcon } from "./basket-shopping-icon.comp";
import { BellIcon } from "./bell-icon.comp";
import { BellSlashIcon } from "./bell-slash-icon.comp";
import { BoldIcon } from "./bold-icon.comp";
import { BoltIcon } from "./bolt-icon.comp";
import { BookBookmarkIcon } from "./book-bookmark-icon.comp";
import { BookIcon } from "./book-icon.comp";
import { BookmarkIcon } from "./bookmark-icon.comp";
import { BookmarkSlashIcon } from "./bookmark-slash-icon.comp";
import { BookOpenIcon } from "./book-open-icon.comp";
import { BookOpenReaderIcon } from "./book-open-reader-icon.comp";
import { BorderAllIcon } from "./border-all-icon.comp";
import { BoxArchiveIcon } from "./box-archive-icon.comp";
import { BoxIcon } from "./box-icon.comp";
import { BrainIcon } from "./brain-icon.comp";
import { BugIcon } from "./bug-icon.comp";
import { BuildingIcon } from "./building-icon.comp";
import { BullhornIcon } from "./bullhorn-icon.comp";
import { BullseyeIcon } from "./bullseye-icon.comp";
import { BusinessTimeIcon } from "./business-time-icon.comp";
import { CalculatorIcon } from "./calculator-icon.comp";
import { CalendarCheckIcon } from "./calendar-check-icon.comp";
import { CalendarDayIcon } from "./calendar-day-icon.comp";
import { CalendarDaysIcon } from "./calendar-days-icon.comp";
import { CalendarIcon } from "./calendar-icon.comp";
import { CalendarPlusIcon } from "./calendar-plus-icon.comp";
import { CalendarWeekIcon } from "./calendar-week-icon.comp";
import { CalendarXmarkIcon } from "./calendar-xmark-icon.comp";
import { CameraIcon } from "./camera-icon.comp";
import { CameraRotateIcon } from "./camera-rotate-icon.comp";
import { CaretDownIcon } from "./caret-down-icon.comp";
import { CaretLeftIcon } from "./caret-left-icon.comp";
import { CaretRightIcon } from "./caret-right-icon.comp";
import { CaretUpIcon } from "./caret-up-icon.comp";
import { CartShoppingIcon } from "./cart-shopping-icon.comp";
import { CertificateIcon } from "./certificate-icon.comp";
import { ChalkboardUserIcon } from "./chalkboard-user-icon.comp";
import { ChartAreaIcon } from "./chart-area-icon.comp";
import { ChartBarIcon } from "./chart-bar-icon.comp";
import { ChartColumnIcon } from "./chart-column-icon.comp";
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
import { ChildIcon } from "./child-icon.comp";
import { CircleArrowLeftIcon } from "./circle-arrow-left-icon.comp";
import { CircleArrowRightIcon } from "./circle-arrow-right-icon.comp";
import { CircleCheckIcon } from "./circle-check-icon.comp";
import { CircleChevronLeftIcon } from "./circle-chevron-left-icon.comp";
import { CircleChevronRightIcon } from "./circle-chevron-right-icon.comp";
import { CircleDotIcon } from "./circle-dot-icon.comp";
import { CircleExclamationIcon } from "./circle-exclamation-icon.comp";
import { CircleHalfIcon } from "./circle-half-icon.comp";
import { CircleHalfStrokeIcon } from "./circle-half-stroke-icon.comp";
import { CircleIcon } from "./circle-icon.comp";
import { CircleInfoIcon } from "./circle-info-icon.comp";
import { CircleMinusIcon } from "./circle-minus-icon.comp";
import { CircleNotchIcon } from "./circle-notch-icon.comp";
import { CirclePauseIcon } from "./circle-pause-icon.comp";
import { CirclePlayIcon } from "./circle-play-icon.comp";
import { CirclePlusIcon } from "./circle-plus-icon.comp";
import { CircleQuestionIcon } from "./circle-question-icon.comp";
import { CircleStopIcon } from "./circle-stop-icon.comp";
import { CircleUserIcon } from "./circle-user-icon.comp";
import { CircleXmarkIcon } from "./circle-xmark-icon.comp";
import { ClipboardIcon } from "./clipboard-icon.comp";
import { ClipboardListIcon } from "./clipboard-list-icon.comp";
import { ClockIcon } from "./clock-icon.comp";
import { ClockRotateLeftIcon } from "./clock-rotate-left-icon.comp";
import { CloudArrowDownIcon } from "./cloud-arrow-down-icon.comp";
import { CloudArrowUpIcon } from "./cloud-arrow-up-icon.comp";
import { CloudIcon } from "./cloud-icon.comp";
import { CloudSunIcon } from "./cloud-sun-icon.comp";
import { CodeBranchIcon } from "./code-branch-icon.comp";
import { CodeCompareIcon } from "./code-compare-icon.comp";
import { CodeIcon } from "./code-icon.comp";
import { CoinsIcon } from "./coins-icon.comp";
import { CommentDotsIcon } from "./comment-dots-icon.comp";
import { CommentIcon } from "./comment-icon.comp";
import { CommentsIcon } from "./comments-icon.comp";
import { CompassIcon } from "./compass-icon.comp";
import { CompressIcon } from "./compress-icon.comp";
import { CopyIcon } from "./copy-icon.comp";
import { CreditCardIcon } from "./credit-card-icon.comp";
import { CrosshairsIcon } from "./crosshairs-icon.comp";
import { CrownIcon } from "./crown-icon.comp";
import { DatabaseIcon } from "./database-icon.comp";
import { DesktopIcon } from "./desktop-icon.comp";
import { DiceFiveIcon } from "./dice-five-icon.comp";
import { DiceIcon } from "./dice-icon.comp";
import { DoorClosedIcon } from "./door-closed-icon.comp";
import { DoorOpenIcon } from "./door-open-icon.comp";
import { DownLeftAndUpRightToCenterIcon } from "./down-left-and-up-right-to-center-icon.comp";
import { DownloadIcon } from "./download-icon.comp";
import { DropletIcon } from "./droplet-icon.comp";
import { DumbbellIcon } from "./dumbbell-icon.comp";
import { EarthAmericasIcon } from "./earth-americas-icon.comp";
import { EllipsisIcon } from "./ellipsis-icon.comp";
import { EllipsisVerticalIcon } from "./ellipsis-vertical-icon.comp";
import { EnvelopeIcon } from "./envelope-icon.comp";
import { EnvelopeOpenIcon } from "./envelope-open-icon.comp";
import { EraserIcon } from "./eraser-icon.comp";
import { ExpandIcon } from "./expand-icon.comp";
import { EyeDropperIcon } from "./eye-dropper-icon.comp";
import { EyeIcon } from "./eye-icon.comp";
import { EyeLowVisionIcon } from "./eye-low-vision-icon.comp";
import { EyeSlashIcon } from "./eye-slash-icon.comp";
import { FaceFrownIcon } from "./face-frown-icon.comp";
import { FaceGrinStarsIcon } from "./face-grin-stars-icon.comp";
import { FaceLaughIcon } from "./face-laugh-icon.comp";
import { FaceMehIcon } from "./face-meh-icon.comp";
import { FaceSadTearIcon } from "./face-sad-tear-icon.comp";
import { FaceSmileIcon } from "./face-smile-icon.comp";
import { FaceSurpriseIcon } from "./face-surprise-icon.comp";
import { FileArrowDownIcon } from "./file-arrow-down-icon.comp";
import { FileCirclePlusIcon } from "./file-circle-plus-icon.comp";
import { FileExportIcon } from "./file-export-icon.comp";
import { FileIcon } from "./file-icon.comp";
import { FileImageIcon } from "./file-image-icon.comp";
import { FileImportIcon } from "./file-import-icon.comp";
import { FileInvoiceIcon } from "./file-invoice-icon.comp";
import { FileLinesIcon } from "./file-lines-icon.comp";
import { FilePdfIcon } from "./file-pdf-icon.comp";
import { FilePenIcon } from "./file-pen-icon.comp";
import { FileVideoIcon } from "./file-video-icon.comp";
import { FilmIcon } from "./film-icon.comp";
import { FilterIcon } from "./filter-icon.comp";
import { FilterListIcon } from "./filter-list-icon.comp";
import { FingerprintIcon } from "./fingerprint-icon.comp";
import { FireFlameCurvedIcon } from "./fire-flame-curved-icon.comp";
import { FireIcon } from "./fire-icon.comp";
import { FlagCheckeredIcon } from "./flag-checkered-icon.comp";
import { FlagIcon } from "./flag-icon.comp";
import { FlagSwallowtailIcon } from "./flag-swallowtail-icon.comp";
import { FlaskIcon } from "./flask-icon.comp";
import { FloppyDiskIcon } from "./floppy-disk-icon.comp";
import { FolderIcon } from "./folder-icon.comp";
import { FolderOpenIcon } from "./folder-open-icon.comp";
import { FolderPlusIcon } from "./folder-plus-icon.comp";
import { FontIcon } from "./font-icon.comp";
import { ForwardFastIcon } from "./forward-fast-icon.comp";
import { ForwardIcon } from "./forward-icon.comp";
import { ForwardStepIcon } from "./forward-step-icon.comp";
import { GamepadIcon } from "./gamepad-icon.comp";
import { GaugeHighIcon } from "./gauge-high-icon.comp";
import { GaugeIcon } from "./gauge-icon.comp";
import { GearIcon } from "./gear-icon.comp";
import { GemIcon } from "./gem-icon.comp";
import { GiftIcon } from "./gift-icon.comp";
import { GlassesIcon } from "./glasses-icon.comp";
import { GlobeIcon } from "./globe-icon.comp";
import { GraduationCapIcon } from "./graduation-cap-icon.comp";
import { GripDotsIcon } from "./grip-dots-icon.comp";
import { GripDotsVerticalIcon } from "./grip-dots-vertical-icon.comp";
import { GripLinesIcon } from "./grip-lines-icon.comp";
import { GripLinesVerticalIcon } from "./grip-lines-vertical-icon.comp";
import { HandIcon } from "./hand-icon.comp";
import { HandPointerIcon } from "./hand-pointer-icon.comp";
import { HandsClappingIcon } from "./hands-clapping-icon.comp";
import { HandshakeIcon } from "./handshake-icon.comp";
import { HashtagIcon } from "./hashtag-icon.comp";
import { HeadingIcon } from "./heading-icon.comp";
import { HeadphonesIcon } from "./headphones-icon.comp";
import { HeadsetIcon } from "./headset-icon.comp";
import { HeartCrackIcon } from "./heart-crack-icon.comp";
import { HeartIcon } from "./heart-icon.comp";
import { HighlighterIcon } from "./highlighter-icon.comp";
import { HourglassEndIcon } from "./hourglass-end-icon.comp";
import { HourglassHalfIcon } from "./hourglass-half-icon.comp";
import { HourglassIcon } from "./hourglass-icon.comp";
import { HourglassStartIcon } from "./hourglass-start-icon.comp";
import { HouseChimneyIcon } from "./house-chimney-icon.comp";
import { HouseIcon } from "./house-icon.comp";
import { HouseUserIcon } from "./house-user-icon.comp";
import { IdBadgeIcon } from "./id-badge-icon.comp";
import { IdCardIcon } from "./id-card-icon.comp";
import { ImageIcon } from "./image-icon.comp";
import { ImagesIcon } from "./images-icon.comp";
import { InboxIcon } from "./inbox-icon.comp";
import { IndentIcon } from "./indent-icon.comp";
import { InfinityIcon } from "./infinity-icon.comp";
import { ItalicIcon } from "./italic-icon.comp";
import { KeyboardIcon } from "./keyboard-icon.comp";
import { KeyIcon } from "./key-icon.comp";
import { LandmarkIcon } from "./landmark-icon.comp";
import { LanguageIcon } from "./language-icon.comp";
import { LaptopIcon } from "./laptop-icon.comp";
import { LayerGroupIcon } from "./layer-group-icon.comp";
import { LeafIcon } from "./leaf-icon.comp";
import { LeftRightIcon } from "./left-right-icon.comp";
import { LightbulbIcon } from "./lightbulb-icon.comp";
import { LightbulbOnIcon } from "./lightbulb-on-icon.comp";
import { LinkIcon } from "./link-icon.comp";
import { LinkSlashIcon } from "./link-slash-icon.comp";
import { ListCheckIcon } from "./list-check-icon.comp";
import { ListIcon } from "./list-icon.comp";
import { ListOlIcon } from "./list-ol-icon.comp";
import { ListRadioIcon } from "./list-radio-icon.comp";
import { ListTimelineIcon } from "./list-timeline-icon.comp";
import { ListTreeIcon } from "./list-tree-icon.comp";
import { ListUlIcon } from "./list-ul-icon.comp";
import { LocationArrowIcon } from "./location-arrow-icon.comp";
import { LocationDotIcon } from "./location-dot-icon.comp";
import { LockIcon } from "./lock-icon.comp";
import { LockOpenIcon } from "./lock-open-icon.comp";
import { LogoMarkIcon } from "./logo-mark-icon.comp";
import { MagnetIcon } from "./magnet-icon.comp";
import { MagnifyingGlassIcon } from "./magnifying-glass-icon.comp";
import { MagnifyingGlassMinusIcon } from "./magnifying-glass-minus-icon.comp";
import { MagnifyingGlassPlusIcon } from "./magnifying-glass-plus-icon.comp";
import { MapIcon } from "./map-icon.comp";
import { MapLocationDotIcon } from "./map-location-dot-icon.comp";
import { MarkerIcon } from "./marker-icon.comp";
import { MaximizeIcon } from "./maximize-icon.comp";
import { MedalIcon } from "./medal-icon.comp";
import { MessageIcon } from "./message-icon.comp";
import { MicrochipIcon } from "./microchip-icon.comp";
import { MicrophoneIcon } from "./microphone-icon.comp";
import { MicrophoneSlashIcon } from "./microphone-slash-icon.comp";
import { MinimizeIcon } from "./minimize-icon.comp";
import { MinusIcon } from "./minus-icon.comp";
import { MobileIcon } from "./mobile-icon.comp";
import { MoneyBillWaveIcon } from "./money-bill-wave-icon.comp";
import { MoonIcon } from "./moon-icon.comp";
import { MountainIcon } from "./mountain-icon.comp";
import { NewspaperIcon } from "./newspaper-icon.comp";
import { OutdentIcon } from "./outdent-icon.comp";
import { PaintbrushIcon } from "./paintbrush-icon.comp";
import { PaletteIcon } from "./palette-icon.comp";
import { PaperclipIcon } from "./paperclip-icon.comp";
import { PaperPlaneIcon } from "./paper-plane-icon.comp";
import { ParagraphIcon } from "./paragraph-icon.comp";
import { PasteIcon } from "./paste-icon.comp";
import { PauseIcon } from "./pause-icon.comp";
import { PencilIcon } from "./pencil-icon.comp";
import { PenIcon } from "./pen-icon.comp";
import { PenNibIcon } from "./pen-nib-icon.comp";
import { PenRulerIcon } from "./pen-ruler-icon.comp";
import { PenToSquareIcon } from "./pen-to-square-icon.comp";
import { PeopleGroupIcon } from "./people-group-icon.comp";
import { PercentIcon } from "./percent-icon.comp";
import { PersonIcon } from "./person-icon.comp";
import { PersonRunningIcon } from "./person-running-icon.comp";
import { PhoneIcon } from "./phone-icon.comp";
import { PhoneSlashIcon } from "./phone-slash-icon.comp";
import { PhotoFilmIcon } from "./photo-film-icon.comp";
import { PiggyBankIcon } from "./piggy-bank-icon.comp";
import { PlaneIcon } from "./plane-icon.comp";
import { PlayIcon } from "./play-icon.comp";
import { PlugIcon } from "./plug-icon.comp";
import { PlusIcon } from "./plus-icon.comp";
import { PodcastIcon } from "./podcast-icon.comp";
import { PrintIcon } from "./print-icon.comp";
import { PuzzlePieceIcon } from "./puzzle-piece-icon.comp";
import { QuoteLeftIcon } from "./quote-left-icon.comp";
import { QuoteRightIcon } from "./quote-right-icon.comp";
import { RankingStarIcon } from "./ranking-star-icon.comp";
import { ReceiptIcon } from "./receipt-icon.comp";
import { RepeatIcon } from "./repeat-icon.comp";
import { ReplyAllIcon } from "./reply-all-icon.comp";
import { ReplyIcon } from "./reply-icon.comp";
import { RightLeftIcon } from "./right-left-icon.comp";
import { RobotIcon } from "./robot-icon.comp";
import { RocketIcon } from "./rocket-icon.comp";
import { RotateIcon } from "./rotate-icon.comp";
import { RotateRightIcon } from "./rotate-right-icon.comp";
import { RouteIcon } from "./route-icon.comp";
import { RssIcon } from "./rss-icon.comp";
import { RulerIcon } from "./ruler-icon.comp";
import { ScaleBalancedIcon } from "./scale-balanced-icon.comp";
import { SchoolIcon } from "./school-icon.comp";
import { ScissorsIcon } from "./scissors-icon.comp";
import { SeedlingIcon } from "./seedling-icon.comp";
import { ServerIcon } from "./server-icon.comp";
import { ShareFromSquareIcon } from "./share-from-square-icon.comp";
import { ShareIcon } from "./share-icon.comp";
import { ShareNodesIcon } from "./share-nodes-icon.comp";
import { ShieldCheckIcon } from "./shield-check-icon.comp";
import { ShieldHalvedIcon } from "./shield-halved-icon.comp";
import { ShuffleIcon } from "./shuffle-icon.comp";
import { SignalIcon } from "./signal-icon.comp";
import { SignsPostIcon } from "./signs-post-icon.comp";
import { SitemapIcon } from "./sitemap-icon.comp";
import { SlidersIcon } from "./sliders-icon.comp";
import { SnowflakeIcon } from "./snowflake-icon.comp";
import { SortIcon } from "./sort-icon.comp";
import { SparklesIcon } from "./sparkles-icon.comp";
import { SpinnerIcon } from "./spinner-icon.comp";
import { SquareArrowUpRightIcon } from "./square-arrow-up-right-icon.comp";
import { SquareCheckIcon } from "./square-check-icon.comp";
import { SquareIcon } from "./square-icon.comp";
import { SquareMinusIcon } from "./square-minus-icon.comp";
import { SquarePlusIcon } from "./square-plus-icon.comp";
import { SquareXmarkIcon } from "./square-xmark-icon.comp";
import { StarHalfStrokeIcon } from "./star-half-stroke-icon.comp";
import { StarIcon } from "./star-icon.comp";
import { StarSharpIcon } from "./star-sharp-icon.comp";
import { StopIcon } from "./stop-icon.comp";
import { StopwatchIcon } from "./stopwatch-icon.comp";
import { StoreIcon } from "./store-icon.comp";
import { StrikethroughIcon } from "./strikethrough-icon.comp";
import { SunIcon } from "./sun-icon.comp";
import { TableCellsIcon } from "./table-cells-icon.comp";
import { TableColumnsIcon } from "./table-columns-icon.comp";
import { TableListIcon } from "./table-list-icon.comp";
import { TagIcon } from "./tag-icon.comp";
import { TerminalIcon } from "./terminal-icon.comp";
import { TextSizeIcon } from "./text-size-icon.comp";
import { ThumbsDownIcon } from "./thumbs-down-icon.comp";
import { ThumbsUpIcon } from "./thumbs-up-icon.comp";
import { ThumbtackIcon } from "./thumbtack-icon.comp";
import { ThumbtackSlashIcon } from "./thumbtack-slash-icon.comp";
import { TimerIcon } from "./timer-icon.comp";
import { ToggleOffIcon } from "./toggle-off-icon.comp";
import { ToggleOnIcon } from "./toggle-on-icon.comp";
import { TrashCanIcon } from "./trash-can-icon.comp";
import { TreeIcon } from "./tree-icon.comp";
import { TriangleExclamationIcon } from "./triangle-exclamation-icon.comp";
import { TrophyIcon } from "./trophy-icon.comp";
import { TrophyStarIcon } from "./trophy-star-icon.comp";
import { TruckIcon } from "./truck-icon.comp";
import { UnderlineIcon } from "./underline-icon.comp";
import { UniversalAccessIcon } from "./universal-access-icon.comp";
import { UpDownIcon } from "./up-down-icon.comp";
import { UploadIcon } from "./upload-icon.comp";
import { UpRightAndDownLeftFromCenterIcon } from "./up-right-and-down-left-from-center-icon.comp";
import { UserCheckIcon } from "./user-check-icon.comp";
import { UserGearIcon } from "./user-gear-icon.comp";
import { UserGraduateIcon } from "./user-graduate-icon.comp";
import { UserGroupIcon } from "./user-group-icon.comp";
import { UserIcon } from "./user-icon.comp";
import { UserLockIcon } from "./user-lock-icon.comp";
import { UserMinusIcon } from "./user-minus-icon.comp";
import { UserPenIcon } from "./user-pen-icon.comp";
import { UserPlusIcon } from "./user-plus-icon.comp";
import { UserShieldIcon } from "./user-shield-icon.comp";
import { UsersIcon } from "./users-icon.comp";
import { UserTieIcon } from "./user-tie-icon.comp";
import { UserXmarkIcon } from "./user-xmark-icon.comp";
import { VideoIcon } from "./video-icon.comp";
import { VideoSlashIcon } from "./video-slash-icon.comp";
import { VolumeHighIcon } from "./volume-high-icon.comp";
import { VolumeLowIcon } from "./volume-low-icon.comp";
import { VolumeOffIcon } from "./volume-off-icon.comp";
import { VolumeXmarkIcon } from "./volume-xmark-icon.comp";
import { WalletIcon } from "./wallet-icon.comp";
import { WandMagicSparklesIcon } from "./wand-magic-sparkles-icon.comp";
import { WandSparklesIcon } from "./wand-sparkles-icon.comp";
import { WhatsappIcon } from "./whatsapp-icon.comp";
import { WindowMaximizeIcon } from "./window-maximize-icon.comp";
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
  { name: "AddressCardIcon", Icon: AddressCardIcon, width: 24, height: 24 },
  { name: "AlarmClockIcon", Icon: AlarmClockIcon, width: 24, height: 24 },
  { name: "AlignCenterIcon", Icon: AlignCenterIcon, width: 24, height: 24 },
  { name: "AlignJustifyIcon", Icon: AlignJustifyIcon, width: 24, height: 24 },
  { name: "AlignLeftIcon", Icon: AlignLeftIcon, width: 24, height: 24 },
  { name: "AlignRightIcon", Icon: AlignRightIcon, width: 24, height: 24 },
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
  { name: "ArrowDownAZIcon", Icon: ArrowDownAZIcon, width: 24, height: 24 },
  { name: "ArrowDownIcon", Icon: ArrowDownIcon, width: 24, height: 24 },
  { name: "ArrowDownToLineIcon", Icon: ArrowDownToLineIcon, width: 24, height: 24 },
  { name: "ArrowDownWideShortIcon", Icon: ArrowDownWideShortIcon, width: 24, height: 24 },
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
  { name: "ArrowTrendDownIcon", Icon: ArrowTrendDownIcon, width: 24, height: 24 },
  { name: "ArrowTrendUpIcon", Icon: ArrowTrendUpIcon, width: 24, height: 24 },
  { name: "ArrowTurnDownIcon", Icon: ArrowTurnDownIcon, width: 24, height: 24 },
  { name: "ArrowTurnUpIcon", Icon: ArrowTurnUpIcon, width: 24, height: 24 },
  { name: "ArrowUpFromLineIcon", Icon: ArrowUpFromLineIcon, width: 24, height: 24 },
  { name: "ArrowUpIcon", Icon: ArrowUpIcon, width: 24, height: 24, use: { size: 20, where: "move menu, user menu" } },
  { name: "ArrowUpRightFromSquareIcon", Icon: ArrowUpRightFromSquareIcon, width: 24, height: 24 },
  { name: "ArrowUpWideShortIcon", Icon: ArrowUpWideShortIcon, width: 24, height: 24 },
  { name: "ArrowUpZAIcon", Icon: ArrowUpZAIcon, width: 24, height: 24 },
  { name: "AtIcon", Icon: AtIcon, width: 24, height: 24 },
  { name: "AtomIcon", Icon: AtomIcon, width: 24, height: 24 },
  { name: "AwardIcon", Icon: AwardIcon, width: 24, height: 24 },
  { name: "BackwardFastIcon", Icon: BackwardFastIcon, width: 24, height: 24 },
  { name: "BackwardIcon", Icon: BackwardIcon, width: 24, height: 24 },
  {
    name: "BackwardStepIcon",
    Icon: BackwardStepIcon,
    width: 24,
    height: 24,
    use: { size: 20, where: "game viewer", variant: "duotone-solid" },
  },
  { name: "BagShoppingIcon", Icon: BagShoppingIcon, width: 24, height: 24 },
  { name: "BanIcon", Icon: BanIcon, width: 24, height: 24 },
  { name: "BarsIcon", Icon: BarsIcon, width: 24, height: 24, use: { size: 20, where: "game viewer" } },
  { name: "BarsProgressIcon", Icon: BarsProgressIcon, width: 24, height: 24 },
  { name: "BarsStaggeredIcon", Icon: BarsStaggeredIcon, width: 24, height: 24 },
  { name: "BasketShoppingIcon", Icon: BasketShoppingIcon, width: 24, height: 24 },
  { name: "BellIcon", Icon: BellIcon, width: 24, height: 24 },
  { name: "BellSlashIcon", Icon: BellSlashIcon, width: 24, height: 24 },
  { name: "BoldIcon", Icon: BoldIcon, width: 24, height: 24 },
  { name: "BoltIcon", Icon: BoltIcon, width: 24, height: 24 },
  { name: "BookBookmarkIcon", Icon: BookBookmarkIcon, width: 24, height: 24 },
  { name: "BookIcon", Icon: BookIcon, width: 24, height: 24 },
  { name: "BookmarkIcon", Icon: BookmarkIcon, width: 24, height: 24 },
  { name: "BookmarkSlashIcon", Icon: BookmarkSlashIcon, width: 24, height: 24 },
  { name: "BookOpenIcon", Icon: BookOpenIcon, width: 24, height: 24 },
  { name: "BookOpenReaderIcon", Icon: BookOpenReaderIcon, width: 24, height: 24 },
  { name: "BorderAllIcon", Icon: BorderAllIcon, width: 24, height: 24 },
  { name: "BoxArchiveIcon", Icon: BoxArchiveIcon, width: 24, height: 24 },
  { name: "BoxIcon", Icon: BoxIcon, width: 24, height: 24 },
  { name: "BrainIcon", Icon: BrainIcon, width: 24, height: 24 },
  { name: "BugIcon", Icon: BugIcon, width: 24, height: 24 },
  { name: "BuildingIcon", Icon: BuildingIcon, width: 24, height: 24 },
  { name: "BullhornIcon", Icon: BullhornIcon, width: 24, height: 24 },
  { name: "BullseyeIcon", Icon: BullseyeIcon, width: 24, height: 24 },
  { name: "BusinessTimeIcon", Icon: BusinessTimeIcon, width: 24, height: 24 },
  { name: "CalculatorIcon", Icon: CalculatorIcon, width: 24, height: 24 },
  {
    name: "CalendarCheckIcon",
    Icon: CalendarCheckIcon,
    width: 24,
    height: 24,
    use: { size: 16, where: "teacher CTA (site)" },
  },
  { name: "CalendarDayIcon", Icon: CalendarDayIcon, width: 24, height: 24 },
  { name: "CalendarDaysIcon", Icon: CalendarDaysIcon, width: 24, height: 24 },
  { name: "CalendarIcon", Icon: CalendarIcon, width: 24, height: 24, use: { size: 18, where: "date picker" } },
  { name: "CalendarPlusIcon", Icon: CalendarPlusIcon, width: 24, height: 24 },
  { name: "CalendarWeekIcon", Icon: CalendarWeekIcon, width: 24, height: 24 },
  { name: "CalendarXmarkIcon", Icon: CalendarXmarkIcon, width: 24, height: 24 },
  { name: "CameraIcon", Icon: CameraIcon, width: 24, height: 24 },
  { name: "CameraRotateIcon", Icon: CameraRotateIcon, width: 24, height: 24 },
  { name: "CaretDownIcon", Icon: CaretDownIcon, width: 24, height: 24 },
  { name: "CaretLeftIcon", Icon: CaretLeftIcon, width: 24, height: 24 },
  {
    name: "CaretRightIcon",
    Icon: CaretRightIcon,
    width: 8,
    height: 16,
    use: { size: 14, where: "course trail", variant: "duotone-solid" },
  },
  { name: "CaretUpIcon", Icon: CaretUpIcon, width: 24, height: 24 },
  { name: "CartShoppingIcon", Icon: CartShoppingIcon, width: 24, height: 24 },
  { name: "CertificateIcon", Icon: CertificateIcon, width: 24, height: 24 },
  { name: "ChalkboardUserIcon", Icon: ChalkboardUserIcon, width: 24, height: 24 },
  { name: "ChartAreaIcon", Icon: ChartAreaIcon, width: 24, height: 24 },
  { name: "ChartBarIcon", Icon: ChartBarIcon, width: 24, height: 24 },
  { name: "ChartColumnIcon", Icon: ChartColumnIcon, width: 24, height: 24 },
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
  { name: "ChildIcon", Icon: ChildIcon, width: 24, height: 24 },
  { name: "CircleArrowLeftIcon", Icon: CircleArrowLeftIcon, width: 24, height: 24 },
  { name: "CircleArrowRightIcon", Icon: CircleArrowRightIcon, width: 24, height: 24 },
  {
    name: "CircleCheckIcon",
    Icon: CircleCheckIcon,
    width: 18,
    height: 18,
    use: { size: 18, where: "plan card (site)" },
  },
  { name: "CircleChevronLeftIcon", Icon: CircleChevronLeftIcon, width: 24, height: 24 },
  { name: "CircleChevronRightIcon", Icon: CircleChevronRightIcon, width: 24, height: 24 },
  { name: "CircleDotIcon", Icon: CircleDotIcon, width: 24, height: 24 },
  { name: "CircleExclamationIcon", Icon: CircleExclamationIcon, width: 24, height: 24 },
  { name: "CircleHalfIcon", Icon: CircleHalfIcon, width: 24, height: 24 },
  { name: "CircleHalfStrokeIcon", Icon: CircleHalfStrokeIcon, width: 24, height: 24 },
  { name: "CircleIcon", Icon: CircleIcon, width: 24, height: 24 },
  { name: "CircleInfoIcon", Icon: CircleInfoIcon, width: 24, height: 24, use: { size: 18, where: "info tip" } },
  { name: "CircleMinusIcon", Icon: CircleMinusIcon, width: 24, height: 24 },
  { name: "CircleNotchIcon", Icon: CircleNotchIcon, width: 24, height: 24 },
  { name: "CirclePauseIcon", Icon: CirclePauseIcon, width: 24, height: 24 },
  { name: "CirclePlayIcon", Icon: CirclePlayIcon, width: 24, height: 24 },
  { name: "CirclePlusIcon", Icon: CirclePlusIcon, width: 24, height: 24 },
  { name: "CircleQuestionIcon", Icon: CircleQuestionIcon, width: 24, height: 24 },
  { name: "CircleStopIcon", Icon: CircleStopIcon, width: 24, height: 24 },
  { name: "CircleUserIcon", Icon: CircleUserIcon, width: 24, height: 24 },
  { name: "CircleXmarkIcon", Icon: CircleXmarkIcon, width: 24, height: 24 },
  { name: "ClipboardIcon", Icon: ClipboardIcon, width: 24, height: 24, use: { size: 20, where: "move menu" } },
  { name: "ClipboardListIcon", Icon: ClipboardListIcon, width: 24, height: 24 },
  { name: "ClockIcon", Icon: ClockIcon, width: 24, height: 24 },
  { name: "ClockRotateLeftIcon", Icon: ClockRotateLeftIcon, width: 24, height: 24 },
  { name: "CloudArrowDownIcon", Icon: CloudArrowDownIcon, width: 24, height: 24 },
  { name: "CloudArrowUpIcon", Icon: CloudArrowUpIcon, width: 24, height: 24 },
  { name: "CloudIcon", Icon: CloudIcon, width: 24, height: 24 },
  { name: "CloudSunIcon", Icon: CloudSunIcon, width: 24, height: 24 },
  { name: "CodeBranchIcon", Icon: CodeBranchIcon, width: 24, height: 24 },
  { name: "CodeCompareIcon", Icon: CodeCompareIcon, width: 24, height: 24 },
  { name: "CodeIcon", Icon: CodeIcon, width: 24, height: 24 },
  { name: "CoinsIcon", Icon: CoinsIcon, width: 24, height: 24 },
  { name: "CommentDotsIcon", Icon: CommentDotsIcon, width: 24, height: 24 },
  { name: "CommentIcon", Icon: CommentIcon, width: 24, height: 24, use: { size: 20, where: "move menu" } },
  { name: "CommentsIcon", Icon: CommentsIcon, width: 24, height: 24 },
  { name: "CompassIcon", Icon: CompassIcon, width: 24, height: 24 },
  { name: "CompressIcon", Icon: CompressIcon, width: 24, height: 24 },
  { name: "CopyIcon", Icon: CopyIcon, width: 24, height: 24 },
  { name: "CreditCardIcon", Icon: CreditCardIcon, width: 24, height: 24 },
  { name: "CrosshairsIcon", Icon: CrosshairsIcon, width: 24, height: 24 },
  { name: "CrownIcon", Icon: CrownIcon, width: 24, height: 24 },
  { name: "DatabaseIcon", Icon: DatabaseIcon, width: 24, height: 24 },
  { name: "DesktopIcon", Icon: DesktopIcon, width: 24, height: 24 },
  { name: "DiceFiveIcon", Icon: DiceFiveIcon, width: 24, height: 24 },
  { name: "DiceIcon", Icon: DiceIcon, width: 24, height: 24 },
  { name: "DoorClosedIcon", Icon: DoorClosedIcon, width: 24, height: 24 },
  { name: "DoorOpenIcon", Icon: DoorOpenIcon, width: 24, height: 24 },
  { name: "DownLeftAndUpRightToCenterIcon", Icon: DownLeftAndUpRightToCenterIcon, width: 24, height: 24 },
  { name: "DownloadIcon", Icon: DownloadIcon, width: 24, height: 24 },
  { name: "DropletIcon", Icon: DropletIcon, width: 24, height: 24 },
  { name: "DumbbellIcon", Icon: DumbbellIcon, width: 24, height: 24 },
  { name: "EarthAmericasIcon", Icon: EarthAmericasIcon, width: 24, height: 24 },
  {
    name: "EllipsisIcon",
    Icon: EllipsisIcon,
    width: 16,
    height: 4,
    use: { size: 4, where: "syllabus rows", variant: "duotone-solid" },
  },
  { name: "EllipsisVerticalIcon", Icon: EllipsisVerticalIcon, width: 24, height: 24 },
  { name: "EnvelopeIcon", Icon: EnvelopeIcon, width: 24, height: 24 },
  { name: "EnvelopeOpenIcon", Icon: EnvelopeOpenIcon, width: 24, height: 24 },
  { name: "EraserIcon", Icon: EraserIcon, width: 24, height: 24 },
  { name: "ExpandIcon", Icon: ExpandIcon, width: 24, height: 24, use: { size: 18, where: "game viewer" } },
  { name: "EyeDropperIcon", Icon: EyeDropperIcon, width: 24, height: 24 },
  { name: "EyeIcon", Icon: EyeIcon, width: 24, height: 24 },
  { name: "EyeLowVisionIcon", Icon: EyeLowVisionIcon, width: 24, height: 24 },
  { name: "EyeSlashIcon", Icon: EyeSlashIcon, width: 24, height: 24 },
  { name: "FaceFrownIcon", Icon: FaceFrownIcon, width: 24, height: 24 },
  { name: "FaceGrinStarsIcon", Icon: FaceGrinStarsIcon, width: 24, height: 24 },
  { name: "FaceLaughIcon", Icon: FaceLaughIcon, width: 24, height: 24 },
  { name: "FaceMehIcon", Icon: FaceMehIcon, width: 24, height: 24 },
  { name: "FaceSadTearIcon", Icon: FaceSadTearIcon, width: 24, height: 24 },
  { name: "FaceSmileIcon", Icon: FaceSmileIcon, width: 24, height: 24 },
  { name: "FaceSurpriseIcon", Icon: FaceSurpriseIcon, width: 24, height: 24 },
  { name: "FileArrowDownIcon", Icon: FileArrowDownIcon, width: 24, height: 24 },
  { name: "FileCirclePlusIcon", Icon: FileCirclePlusIcon, width: 24, height: 24 },
  { name: "FileExportIcon", Icon: FileExportIcon, width: 24, height: 24 },
  { name: "FileIcon", Icon: FileIcon, width: 24, height: 24 },
  { name: "FileImageIcon", Icon: FileImageIcon, width: 24, height: 24 },
  { name: "FileImportIcon", Icon: FileImportIcon, width: 24, height: 24 },
  { name: "FileInvoiceIcon", Icon: FileInvoiceIcon, width: 24, height: 24 },
  { name: "FileLinesIcon", Icon: FileLinesIcon, width: 24, height: 24 },
  { name: "FilePdfIcon", Icon: FilePdfIcon, width: 24, height: 24 },
  { name: "FilePenIcon", Icon: FilePenIcon, width: 24, height: 24 },
  { name: "FileVideoIcon", Icon: FileVideoIcon, width: 24, height: 24 },
  { name: "FilmIcon", Icon: FilmIcon, width: 24, height: 24 },
  { name: "FilterIcon", Icon: FilterIcon, width: 24, height: 24 },
  { name: "FilterListIcon", Icon: FilterListIcon, width: 24, height: 24 },
  { name: "FingerprintIcon", Icon: FingerprintIcon, width: 24, height: 24 },
  { name: "FireFlameCurvedIcon", Icon: FireFlameCurvedIcon, width: 24, height: 24 },
  {
    name: "FireIcon",
    Icon: FireIcon,
    width: 32,
    height: 32,
    use: { size: 22, where: "user menu, streak", variant: "duotone-solid" },
  },
  { name: "FlagCheckeredIcon", Icon: FlagCheckeredIcon, width: 24, height: 24 },
  { name: "FlagIcon", Icon: FlagIcon, width: 24, height: 24 },
  { name: "FlagSwallowtailIcon", Icon: FlagSwallowtailIcon, width: 24, height: 24 },
  { name: "FlaskIcon", Icon: FlaskIcon, width: 24, height: 24 },
  { name: "FloppyDiskIcon", Icon: FloppyDiskIcon, width: 24, height: 24 },
  { name: "FolderIcon", Icon: FolderIcon, width: 24, height: 24 },
  { name: "FolderOpenIcon", Icon: FolderOpenIcon, width: 24, height: 24 },
  { name: "FolderPlusIcon", Icon: FolderPlusIcon, width: 24, height: 24 },
  { name: "FontIcon", Icon: FontIcon, width: 24, height: 24 },
  { name: "ForwardFastIcon", Icon: ForwardFastIcon, width: 24, height: 24 },
  { name: "ForwardIcon", Icon: ForwardIcon, width: 24, height: 24 },
  {
    name: "ForwardStepIcon",
    Icon: ForwardStepIcon,
    width: 24,
    height: 24,
    use: { size: 20, where: "game viewer", variant: "duotone-solid" },
  },
  { name: "GamepadIcon", Icon: GamepadIcon, width: 24, height: 24 },
  { name: "GaugeHighIcon", Icon: GaugeHighIcon, width: 24, height: 24 },
  { name: "GaugeIcon", Icon: GaugeIcon, width: 24, height: 24 },
  { name: "GearIcon", Icon: GearIcon, width: 24, height: 24 },
  { name: "GemIcon", Icon: GemIcon, width: 24, height: 24 },
  { name: "GiftIcon", Icon: GiftIcon, width: 24, height: 24 },
  { name: "GlassesIcon", Icon: GlassesIcon, width: 24, height: 24 },
  { name: "GlobeIcon", Icon: GlobeIcon, width: 24, height: 24 },
  { name: "GraduationCapIcon", Icon: GraduationCapIcon, width: 24, height: 24 },
  { name: "GripDotsIcon", Icon: GripDotsIcon, width: 24, height: 24 },
  {
    name: "GripDotsVerticalIcon",
    Icon: GripDotsVerticalIcon,
    width: 10,
    height: 16,
    use: { size: 16, where: "syllabus rows", variant: "duotone-solid" },
  },
  { name: "GripLinesIcon", Icon: GripLinesIcon, width: 24, height: 24 },
  { name: "GripLinesVerticalIcon", Icon: GripLinesVerticalIcon, width: 24, height: 24 },
  { name: "HandIcon", Icon: HandIcon, width: 24, height: 24 },
  { name: "HandPointerIcon", Icon: HandPointerIcon, width: 24, height: 24 },
  { name: "HandsClappingIcon", Icon: HandsClappingIcon, width: 24, height: 24 },
  { name: "HandshakeIcon", Icon: HandshakeIcon, width: 24, height: 24 },
  { name: "HashtagIcon", Icon: HashtagIcon, width: 24, height: 24 },
  { name: "HeadingIcon", Icon: HeadingIcon, width: 24, height: 24 },
  { name: "HeadphonesIcon", Icon: HeadphonesIcon, width: 24, height: 24 },
  { name: "HeadsetIcon", Icon: HeadsetIcon, width: 24, height: 24 },
  { name: "HeartCrackIcon", Icon: HeartCrackIcon, width: 24, height: 24 },
  {
    name: "HeartIcon",
    Icon: HeartIcon,
    width: 14,
    height: 14,
    use: { size: 14, where: "reviews (site)", variant: "duotone-solid" },
  },
  { name: "HighlighterIcon", Icon: HighlighterIcon, width: 24, height: 24 },
  { name: "HourglassEndIcon", Icon: HourglassEndIcon, width: 24, height: 24 },
  { name: "HourglassHalfIcon", Icon: HourglassHalfIcon, width: 24, height: 24 },
  { name: "HourglassIcon", Icon: HourglassIcon, width: 24, height: 24 },
  { name: "HourglassStartIcon", Icon: HourglassStartIcon, width: 24, height: 24 },
  { name: "HouseChimneyIcon", Icon: HouseChimneyIcon, width: 24, height: 24 },
  { name: "HouseIcon", Icon: HouseIcon, width: 24, height: 24, use: { size: 28, where: "mobile clock (site)" } },
  { name: "HouseUserIcon", Icon: HouseUserIcon, width: 24, height: 24 },
  { name: "IdBadgeIcon", Icon: IdBadgeIcon, width: 24, height: 24 },
  { name: "IdCardIcon", Icon: IdCardIcon, width: 24, height: 24 },
  { name: "ImageIcon", Icon: ImageIcon, width: 24, height: 24, use: { size: 28, where: "image upload" } },
  { name: "ImagesIcon", Icon: ImagesIcon, width: 24, height: 24 },
  { name: "InboxIcon", Icon: InboxIcon, width: 24, height: 24 },
  { name: "IndentIcon", Icon: IndentIcon, width: 24, height: 24 },
  { name: "InfinityIcon", Icon: InfinityIcon, width: 24, height: 24 },
  { name: "ItalicIcon", Icon: ItalicIcon, width: 24, height: 24 },
  { name: "KeyboardIcon", Icon: KeyboardIcon, width: 24, height: 24 },
  { name: "KeyIcon", Icon: KeyIcon, width: 24, height: 24 },
  { name: "LandmarkIcon", Icon: LandmarkIcon, width: 24, height: 24 },
  { name: "LanguageIcon", Icon: LanguageIcon, width: 24, height: 24 },
  { name: "LaptopIcon", Icon: LaptopIcon, width: 24, height: 24 },
  { name: "LayerGroupIcon", Icon: LayerGroupIcon, width: 24, height: 24 },
  { name: "LeafIcon", Icon: LeafIcon, width: 24, height: 24 },
  { name: "LeftRightIcon", Icon: LeftRightIcon, width: 24, height: 24 },
  { name: "LightbulbIcon", Icon: LightbulbIcon, width: 24, height: 24 },
  { name: "LightbulbOnIcon", Icon: LightbulbOnIcon, width: 24, height: 24 },
  { name: "LinkIcon", Icon: LinkIcon, width: 24, height: 24 },
  { name: "LinkSlashIcon", Icon: LinkSlashIcon, width: 24, height: 24 },
  { name: "ListCheckIcon", Icon: ListCheckIcon, width: 24, height: 24 },
  { name: "ListIcon", Icon: ListIcon, width: 24, height: 24 },
  { name: "ListOlIcon", Icon: ListOlIcon, width: 24, height: 24 },
  { name: "ListRadioIcon", Icon: ListRadioIcon, width: 24, height: 24 },
  { name: "ListTimelineIcon", Icon: ListTimelineIcon, width: 24, height: 24 },
  { name: "ListTreeIcon", Icon: ListTreeIcon, width: 24, height: 24 },
  { name: "ListUlIcon", Icon: ListUlIcon, width: 24, height: 24 },
  { name: "LocationArrowIcon", Icon: LocationArrowIcon, width: 24, height: 24 },
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
  { name: "MagnetIcon", Icon: MagnetIcon, width: 24, height: 24 },
  {
    name: "MagnifyingGlassIcon",
    Icon: MagnifyingGlassIcon,
    width: 24,
    height: 24,
    use: { size: 18, where: "bar search" },
  },
  { name: "MagnifyingGlassMinusIcon", Icon: MagnifyingGlassMinusIcon, width: 24, height: 24 },
  { name: "MagnifyingGlassPlusIcon", Icon: MagnifyingGlassPlusIcon, width: 24, height: 24 },
  { name: "MapIcon", Icon: MapIcon, width: 24, height: 24 },
  { name: "MapLocationDotIcon", Icon: MapLocationDotIcon, width: 24, height: 24 },
  { name: "MarkerIcon", Icon: MarkerIcon, width: 24, height: 24 },
  { name: "MaximizeIcon", Icon: MaximizeIcon, width: 24, height: 24 },
  { name: "MedalIcon", Icon: MedalIcon, width: 24, height: 24 },
  { name: "MessageIcon", Icon: MessageIcon, width: 24, height: 24 },
  { name: "MicrochipIcon", Icon: MicrochipIcon, width: 24, height: 24 },
  { name: "MicrophoneIcon", Icon: MicrophoneIcon, width: 24, height: 24 },
  { name: "MicrophoneSlashIcon", Icon: MicrophoneSlashIcon, width: 24, height: 24 },
  { name: "MinimizeIcon", Icon: MinimizeIcon, width: 24, height: 24 },
  { name: "MinusIcon", Icon: MinusIcon, width: 24, height: 24 },
  { name: "MobileIcon", Icon: MobileIcon, width: 24, height: 24 },
  { name: "MoneyBillWaveIcon", Icon: MoneyBillWaveIcon, width: 24, height: 24 },
  { name: "MoonIcon", Icon: MoonIcon, width: 24, height: 24, use: { size: 19, where: "user menu" } },
  { name: "MountainIcon", Icon: MountainIcon, width: 24, height: 24 },
  { name: "NewspaperIcon", Icon: NewspaperIcon, width: 24, height: 24 },
  { name: "OutdentIcon", Icon: OutdentIcon, width: 24, height: 24 },
  { name: "PaintbrushIcon", Icon: PaintbrushIcon, width: 24, height: 24 },
  { name: "PaletteIcon", Icon: PaletteIcon, width: 24, height: 24 },
  { name: "PaperclipIcon", Icon: PaperclipIcon, width: 24, height: 24 },
  { name: "PaperPlaneIcon", Icon: PaperPlaneIcon, width: 24, height: 24 },
  { name: "ParagraphIcon", Icon: ParagraphIcon, width: 24, height: 24 },
  { name: "PasteIcon", Icon: PasteIcon, width: 24, height: 24 },
  {
    name: "PauseIcon",
    Icon: PauseIcon,
    width: 19,
    height: 22,
    use: { size: 22, where: "board tools", variant: "duotone-solid" },
  },
  { name: "PencilIcon", Icon: PencilIcon, width: 24, height: 24 },
  { name: "PenIcon", Icon: PenIcon, width: 24, height: 24 },
  { name: "PenNibIcon", Icon: PenNibIcon, width: 24, height: 24 },
  { name: "PenRulerIcon", Icon: PenRulerIcon, width: 24, height: 24 },
  { name: "PenToSquareIcon", Icon: PenToSquareIcon, width: 24, height: 24 },
  { name: "PeopleGroupIcon", Icon: PeopleGroupIcon, width: 24, height: 24 },
  { name: "PercentIcon", Icon: PercentIcon, width: 24, height: 24 },
  { name: "PersonIcon", Icon: PersonIcon, width: 24, height: 24 },
  { name: "PersonRunningIcon", Icon: PersonRunningIcon, width: 24, height: 24 },
  { name: "PhoneIcon", Icon: PhoneIcon, width: 24, height: 24 },
  { name: "PhoneSlashIcon", Icon: PhoneSlashIcon, width: 24, height: 24 },
  { name: "PhotoFilmIcon", Icon: PhotoFilmIcon, width: 24, height: 24 },
  { name: "PiggyBankIcon", Icon: PiggyBankIcon, width: 24, height: 24 },
  { name: "PlaneIcon", Icon: PlaneIcon, width: 24, height: 24 },
  {
    name: "PlayIcon",
    Icon: PlayIcon,
    width: 19,
    height: 22,
    use: { size: 22, where: "board tools", variant: "duotone-solid" },
  },
  { name: "PlugIcon", Icon: PlugIcon, width: 24, height: 24 },
  { name: "PlusIcon", Icon: PlusIcon, width: 16, height: 16, use: { size: 16, where: "FAQ (site)" } },
  { name: "PodcastIcon", Icon: PodcastIcon, width: 24, height: 24 },
  { name: "PrintIcon", Icon: PrintIcon, width: 24, height: 24 },
  { name: "PuzzlePieceIcon", Icon: PuzzlePieceIcon, width: 24, height: 24 },
  { name: "QuoteLeftIcon", Icon: QuoteLeftIcon, width: 24, height: 24 },
  { name: "QuoteRightIcon", Icon: QuoteRightIcon, width: 24, height: 24 },
  { name: "RankingStarIcon", Icon: RankingStarIcon, width: 24, height: 24 },
  { name: "ReceiptIcon", Icon: ReceiptIcon, width: 24, height: 24 },
  { name: "RepeatIcon", Icon: RepeatIcon, width: 24, height: 24 },
  { name: "ReplyAllIcon", Icon: ReplyAllIcon, width: 24, height: 24 },
  { name: "ReplyIcon", Icon: ReplyIcon, width: 24, height: 24 },
  { name: "RightLeftIcon", Icon: RightLeftIcon, width: 24, height: 24 },
  { name: "RobotIcon", Icon: RobotIcon, width: 24, height: 24 },
  { name: "RocketIcon", Icon: RocketIcon, width: 24, height: 24 },
  { name: "RotateIcon", Icon: RotateIcon, width: 24, height: 24 },
  { name: "RotateRightIcon", Icon: RotateRightIcon, width: 24, height: 24 },
  { name: "RouteIcon", Icon: RouteIcon, width: 24, height: 24 },
  { name: "RssIcon", Icon: RssIcon, width: 24, height: 24 },
  { name: "RulerIcon", Icon: RulerIcon, width: 24, height: 24 },
  { name: "ScaleBalancedIcon", Icon: ScaleBalancedIcon, width: 24, height: 24 },
  { name: "SchoolIcon", Icon: SchoolIcon, width: 24, height: 24 },
  { name: "ScissorsIcon", Icon: ScissorsIcon, width: 24, height: 24 },
  { name: "SeedlingIcon", Icon: SeedlingIcon, width: 24, height: 24 },
  { name: "ServerIcon", Icon: ServerIcon, width: 24, height: 24 },
  { name: "ShareFromSquareIcon", Icon: ShareFromSquareIcon, width: 24, height: 24 },
  { name: "ShareIcon", Icon: ShareIcon, width: 24, height: 24 },
  { name: "ShareNodesIcon", Icon: ShareNodesIcon, width: 24, height: 24 },
  { name: "ShieldCheckIcon", Icon: ShieldCheckIcon, width: 24, height: 24 },
  { name: "ShieldHalvedIcon", Icon: ShieldHalvedIcon, width: 24, height: 24 },
  { name: "ShuffleIcon", Icon: ShuffleIcon, width: 24, height: 24 },
  { name: "SignalIcon", Icon: SignalIcon, width: 24, height: 24 },
  { name: "SignsPostIcon", Icon: SignsPostIcon, width: 24, height: 24 },
  { name: "SitemapIcon", Icon: SitemapIcon, width: 24, height: 24 },
  { name: "SlidersIcon", Icon: SlidersIcon, width: 24, height: 24, use: { size: 19, where: "user menu" } },
  { name: "SnowflakeIcon", Icon: SnowflakeIcon, width: 24, height: 24 },
  { name: "SortIcon", Icon: SortIcon, width: 24, height: 24 },
  { name: "SparklesIcon", Icon: SparklesIcon, width: 24, height: 24 },
  { name: "SpinnerIcon", Icon: SpinnerIcon, width: 24, height: 24 },
  { name: "SquareArrowUpRightIcon", Icon: SquareArrowUpRightIcon, width: 24, height: 24 },
  { name: "SquareCheckIcon", Icon: SquareCheckIcon, width: 24, height: 24 },
  { name: "SquareIcon", Icon: SquareIcon, width: 24, height: 24 },
  { name: "SquareMinusIcon", Icon: SquareMinusIcon, width: 24, height: 24 },
  { name: "SquarePlusIcon", Icon: SquarePlusIcon, width: 24, height: 24 },
  { name: "SquareXmarkIcon", Icon: SquareXmarkIcon, width: 24, height: 24 },
  { name: "StarHalfStrokeIcon", Icon: StarHalfStrokeIcon, width: 24, height: 24 },
  { name: "StarIcon", Icon: StarIcon, width: 24, height: 24 },
  { name: "StarSharpIcon", Icon: StarSharpIcon, width: 24, height: 24 },
  { name: "StopIcon", Icon: StopIcon, width: 24, height: 24 },
  { name: "StopwatchIcon", Icon: StopwatchIcon, width: 24, height: 24 },
  { name: "StoreIcon", Icon: StoreIcon, width: 24, height: 24 },
  { name: "StrikethroughIcon", Icon: StrikethroughIcon, width: 24, height: 24 },
  { name: "SunIcon", Icon: SunIcon, width: 24, height: 24 },
  { name: "TableCellsIcon", Icon: TableCellsIcon, width: 24, height: 24 },
  { name: "TableColumnsIcon", Icon: TableColumnsIcon, width: 24, height: 24 },
  { name: "TableListIcon", Icon: TableListIcon, width: 24, height: 24 },
  { name: "TagIcon", Icon: TagIcon, width: 24, height: 24 },
  { name: "TerminalIcon", Icon: TerminalIcon, width: 24, height: 24 },
  { name: "TextSizeIcon", Icon: TextSizeIcon, width: 24, height: 24 },
  { name: "ThumbsDownIcon", Icon: ThumbsDownIcon, width: 24, height: 24 },
  { name: "ThumbsUpIcon", Icon: ThumbsUpIcon, width: 24, height: 24 },
  { name: "ThumbtackIcon", Icon: ThumbtackIcon, width: 24, height: 24 },
  { name: "ThumbtackSlashIcon", Icon: ThumbtackSlashIcon, width: 24, height: 24 },
  { name: "TimerIcon", Icon: TimerIcon, width: 24, height: 24 },
  { name: "ToggleOffIcon", Icon: ToggleOffIcon, width: 24, height: 24 },
  { name: "ToggleOnIcon", Icon: ToggleOnIcon, width: 24, height: 24 },
  { name: "TrashCanIcon", Icon: TrashCanIcon, width: 24, height: 24, use: { size: 20, where: "move menu" } },
  { name: "TreeIcon", Icon: TreeIcon, width: 24, height: 24 },
  { name: "TriangleExclamationIcon", Icon: TriangleExclamationIcon, width: 24, height: 24 },
  { name: "TrophyIcon", Icon: TrophyIcon, width: 24, height: 24 },
  { name: "TrophyStarIcon", Icon: TrophyStarIcon, width: 24, height: 24 },
  { name: "TruckIcon", Icon: TruckIcon, width: 24, height: 24 },
  { name: "UnderlineIcon", Icon: UnderlineIcon, width: 24, height: 24 },
  { name: "UniversalAccessIcon", Icon: UniversalAccessIcon, width: 24, height: 24 },
  { name: "UpDownIcon", Icon: UpDownIcon, width: 24, height: 24 },
  { name: "UploadIcon", Icon: UploadIcon, width: 24, height: 24 },
  { name: "UpRightAndDownLeftFromCenterIcon", Icon: UpRightAndDownLeftFromCenterIcon, width: 24, height: 24 },
  { name: "UserCheckIcon", Icon: UserCheckIcon, width: 24, height: 24 },
  { name: "UserGearIcon", Icon: UserGearIcon, width: 24, height: 24 },
  { name: "UserGraduateIcon", Icon: UserGraduateIcon, width: 24, height: 24 },
  { name: "UserGroupIcon", Icon: UserGroupIcon, width: 24, height: 24 },
  { name: "UserIcon", Icon: UserIcon, width: 24, height: 24, use: { size: 19, where: "user menu" } },
  { name: "UserLockIcon", Icon: UserLockIcon, width: 24, height: 24 },
  { name: "UserMinusIcon", Icon: UserMinusIcon, width: 24, height: 24 },
  { name: "UserPenIcon", Icon: UserPenIcon, width: 24, height: 24 },
  { name: "UserPlusIcon", Icon: UserPlusIcon, width: 24, height: 24 },
  { name: "UserShieldIcon", Icon: UserShieldIcon, width: 24, height: 24 },
  { name: "UsersIcon", Icon: UsersIcon, width: 24, height: 24 },
  { name: "UserTieIcon", Icon: UserTieIcon, width: 24, height: 24 },
  { name: "UserXmarkIcon", Icon: UserXmarkIcon, width: 24, height: 24 },
  { name: "VideoIcon", Icon: VideoIcon, width: 24, height: 24 },
  { name: "VideoSlashIcon", Icon: VideoSlashIcon, width: 24, height: 24 },
  { name: "VolumeHighIcon", Icon: VolumeHighIcon, width: 24, height: 24 },
  { name: "VolumeLowIcon", Icon: VolumeLowIcon, width: 24, height: 24, use: { size: 18, where: "game viewer" } },
  { name: "VolumeOffIcon", Icon: VolumeOffIcon, width: 24, height: 24 },
  { name: "VolumeXmarkIcon", Icon: VolumeXmarkIcon, width: 24, height: 24, use: { size: 18, where: "game viewer" } },
  { name: "WalletIcon", Icon: WalletIcon, width: 24, height: 24 },
  { name: "WandMagicSparklesIcon", Icon: WandMagicSparklesIcon, width: 24, height: 24 },
  { name: "WandSparklesIcon", Icon: WandSparklesIcon, width: 24, height: 24 },
  {
    name: "WhatsappIcon",
    Icon: WhatsappIcon,
    width: 16,
    height: 16,
    use: { size: 16, where: "CTA (site)" },
    variants: false,
  },
  { name: "WindowMaximizeIcon", Icon: WindowMaximizeIcon, width: 24, height: 24 },
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
  gridTemplateColumns: "repeat(auto-fill, minmax(208px, 1fr))",
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
 * library in a 48px box, in its three styles, in the accent.
 */
function IconsGallery({ scale }: { scale: Scale }) {
  const large = scale === "large";
  const glyphs = large ? GLYPHS : IN_USE;
  const stage: CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "var(--platform-space-3)",
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
            ? `All ${GLYPHS.length + 1} icons of components/icons, each in a ${LARGE}px box, in the accent: Duotone Light, Duotone Solid and Classic Solid.`
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
\`ChessKnightIcon\` in \`chess-knight-icon.comp.tsx\`), and take a \`variant\`
named as Font Awesome names its styles: \`duotone-light\`, the default,
\`duotone-solid\` or \`classic-solid\`. A Duotone drawing is two layers filled
with \`currentColor\`, the one at the back at 40 %; a Classic one is one shape. An icon takes a \`className\`
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

/** Every icon of the library in a 48px box and in the accent: Duotone Light, Duotone Solid and Classic Solid; the wordmark keeps the site's colours. */
export const LargeInAccent: Story = { render: () => <IconsGallery scale="large" /> };
