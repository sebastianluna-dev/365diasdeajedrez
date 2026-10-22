import type { ComponentType, CSSProperties } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Logo } from "@/components/site/shared/logo.comp";
import { ICON_VARIANTS, type IconProps, type IconVariant } from "./icon-variant.const";
import { AddressBookIcon } from "./address-book-icon.comp";
import { AddressCardIcon } from "./address-card-icon.comp";
import { AlarmClockIcon } from "./alarm-clock-icon.comp";
import { AlarmExclamationIcon } from "./alarm-exclamation-icon.comp";
import { AlarmPlusIcon } from "./alarm-plus-icon.comp";
import { AlarmSnoozeIcon } from "./alarm-snooze-icon.comp";
import { AlignCenterIcon } from "./align-center-icon.comp";
import { AlignJustifyIcon } from "./align-justify-icon.comp";
import { AlignLeftIcon } from "./align-left-icon.comp";
import { AlignRightIcon } from "./align-right-icon.comp";
import { AngleDownIcon } from "./angle-down-icon.comp";
import { AngleLeftIcon } from "./angle-left-icon.comp";
import { AngleRightIcon } from "./angle-right-icon.comp";
import { AnglesDownIcon } from "./angles-down-icon.comp";
import { AnglesLeftIcon } from "./angles-left-icon.comp";
import { AnglesRightIcon } from "./angles-right-icon.comp";
import { AnglesUpIcon } from "./angles-up-icon.comp";
import { AngleUpIcon } from "./angle-up-icon.comp";
import { ArrowDownAZIcon } from "./arrow-down-a-z-icon.comp";
import { ArrowDownIcon } from "./arrow-down-icon.comp";
import { ArrowDownLeftIcon } from "./arrow-down-left-icon.comp";
import { ArrowDownLongIcon } from "./arrow-down-long-icon.comp";
import { ArrowDownRightIcon } from "./arrow-down-right-icon.comp";
import { ArrowDownToBracketIcon } from "./arrow-down-to-bracket-icon.comp";
import { ArrowDownToLineIcon } from "./arrow-down-to-line-icon.comp";
import { ArrowDownWideShortIcon } from "./arrow-down-wide-short-icon.comp";
import { ArrowLeftIcon } from "./arrow-left-icon.comp";
import { ArrowLeftLongIcon } from "./arrow-left-long-icon.comp";
import { ArrowLeftToLineIcon } from "./arrow-left-to-line-icon.comp";
import { ArrowPointerIcon } from "./arrow-pointer-icon.comp";
import { ArrowRightArrowLeftIcon } from "./arrow-right-arrow-left-icon.comp";
import { ArrowRightFromBracketIcon } from "./arrow-right-from-bracket-icon.comp";
import { ArrowRightIcon } from "./arrow-right-icon.comp";
import { ArrowRightLongIcon } from "./arrow-right-long-icon.comp";
import { ArrowRightToBracketIcon } from "./arrow-right-to-bracket-icon.comp";
import { ArrowRightToLineIcon } from "./arrow-right-to-line-icon.comp";
import { ArrowRotateForwardIcon } from "./arrow-rotate-forward-icon.comp";
import { ArrowRotateLeftIcon } from "./arrow-rotate-left-icon.comp";
import { ArrowRotateRightIcon } from "./arrow-rotate-right-icon.comp";
import { ArrowsLeftRightIcon } from "./arrows-left-right-icon.comp";
import { ArrowsMaximizeIcon } from "./arrows-maximize-icon.comp";
import { ArrowsMinimizeIcon } from "./arrows-minimize-icon.comp";
import { ArrowsRepeatIcon } from "./arrows-repeat-icon.comp";
import { ArrowsRotateIcon } from "./arrows-rotate-icon.comp";
import { ArrowsSpinIcon } from "./arrows-spin-icon.comp";
import { ArrowsToDotIcon } from "./arrows-to-dot-icon.comp";
import { ArrowsUpDownIcon } from "./arrows-up-down-icon.comp";
import { ArrowTrendDownIcon } from "./arrow-trend-down-icon.comp";
import { ArrowTrendUpIcon } from "./arrow-trend-up-icon.comp";
import { ArrowTurnDownIcon } from "./arrow-turn-down-icon.comp";
import { ArrowTurnLeftIcon } from "./arrow-turn-left-icon.comp";
import { ArrowTurnRightIcon } from "./arrow-turn-right-icon.comp";
import { ArrowTurnUpIcon } from "./arrow-turn-up-icon.comp";
import { ArrowUpFromBracketIcon } from "./arrow-up-from-bracket-icon.comp";
import { ArrowUpFromLineIcon } from "./arrow-up-from-line-icon.comp";
import { ArrowUpIcon } from "./arrow-up-icon.comp";
import { ArrowUpLeftIcon } from "./arrow-up-left-icon.comp";
import { ArrowUpLongIcon } from "./arrow-up-long-icon.comp";
import { ArrowUpRightFromSquareIcon } from "./arrow-up-right-from-square-icon.comp";
import { ArrowUpRightIcon } from "./arrow-up-right-icon.comp";
import { ArrowUpToLineIcon } from "./arrow-up-to-line-icon.comp";
import { ArrowUpWideShortIcon } from "./arrow-up-wide-short-icon.comp";
import { ArrowUpZAIcon } from "./arrow-up-z-a-icon.comp";
import { AtIcon } from "./at-icon.comp";
import { AtomIcon } from "./atom-icon.comp";
import { AwardIcon } from "./award-icon.comp";
import { AwardSimpleIcon } from "./award-simple-icon.comp";
import { BackwardFastIcon } from "./backward-fast-icon.comp";
import { BackwardIcon } from "./backward-icon.comp";
import { BackwardStepIcon } from "./backward-step-icon.comp";
import { BadgeCheckIcon } from "./badge-check-icon.comp";
import { BadgePercentIcon } from "./badge-percent-icon.comp";
import { BagShoppingIcon } from "./bag-shopping-icon.comp";
import { BalloonsIcon } from "./balloons-icon.comp";
import { BanIcon } from "./ban-icon.comp";
import { BarcodeIcon } from "./barcode-icon.comp";
import { BarsFilterIcon } from "./bars-filter-icon.comp";
import { BarsIcon } from "./bars-icon.comp";
import { BarsProgressIcon } from "./bars-progress-icon.comp";
import { BarsSortIcon } from "./bars-sort-icon.comp";
import { BarsStaggeredIcon } from "./bars-staggered-icon.comp";
import { BasketShoppingIcon } from "./basket-shopping-icon.comp";
import { BatteryEmptyIcon } from "./battery-empty-icon.comp";
import { BatteryFullIcon } from "./battery-full-icon.comp";
import { BatteryHalfIcon } from "./battery-half-icon.comp";
import { BellIcon } from "./bell-icon.comp";
import { BellRingIcon } from "./bell-ring-icon.comp";
import { BellSchoolIcon } from "./bell-school-icon.comp";
import { BellSlashIcon } from "./bell-slash-icon.comp";
import { BlockQuoteIcon } from "./block-quote-icon.comp";
import { BluetoothIcon } from "./bluetooth-icon.comp";
import { BoldIcon } from "./bold-icon.comp";
import { BoltAutoIcon } from "./bolt-auto-icon.comp";
import { BoltIcon } from "./bolt-icon.comp";
import { BoltLightningIcon } from "./bolt-lightning-icon.comp";
import { BookArrowRightIcon } from "./book-arrow-right-icon.comp";
import { BookArrowUpIcon } from "./book-arrow-up-icon.comp";
import { BookAtlasIcon } from "./book-atlas-icon.comp";
import { BookBookmarkIcon } from "./book-bookmark-icon.comp";
import { BookIcon } from "./book-icon.comp";
import { BookmarkIcon } from "./bookmark-icon.comp";
import { BookmarkPlusIcon } from "./bookmark-plus-icon.comp";
import { BookmarkSlashIcon } from "./bookmark-slash-icon.comp";
import { BookOpenCoverIcon } from "./book-open-cover-icon.comp";
import { BookOpenIcon } from "./book-open-icon.comp";
import { BookOpenLinesIcon } from "./book-open-lines-icon.comp";
import { BookOpenReaderIcon } from "./book-open-reader-icon.comp";
import { BooksIcon } from "./books-icon.comp";
import { BookSparklesIcon } from "./book-sparkles-icon.comp";
import { BookUserIcon } from "./book-user-icon.comp";
import { BorderAllIcon } from "./border-all-icon.comp";
import { BoxArchiveIcon } from "./box-archive-icon.comp";
import { BoxIcon } from "./box-icon.comp";
import { BrainArrowCurvedRightIcon } from "./brain-arrow-curved-right-icon.comp";
import { BrainCircuitIcon } from "./brain-circuit-icon.comp";
import { BrainIcon } from "./brain-icon.comp";
import { BrowserIcon } from "./browser-icon.comp";
import { BugIcon } from "./bug-icon.comp";
import { BuildingIcon } from "./building-icon.comp";
import { BullhornIcon } from "./bullhorn-icon.comp";
import { BullseyeArrowIcon } from "./bullseye-arrow-icon.comp";
import { BullseyeIcon } from "./bullseye-icon.comp";
import { BurstIcon } from "./burst-icon.comp";
import { BusinessTimeIcon } from "./business-time-icon.comp";
import { BusSchoolIcon } from "./bus-school-icon.comp";
import { CalculatorIcon } from "./calculator-icon.comp";
import { CalendarArrowDownIcon } from "./calendar-arrow-down-icon.comp";
import { CalendarArrowUpIcon } from "./calendar-arrow-up-icon.comp";
import { CalendarCheckIcon } from "./calendar-check-icon.comp";
import { CalendarCirclePlusIcon } from "./calendar-circle-plus-icon.comp";
import { CalendarClockIcon } from "./calendar-clock-icon.comp";
import { CalendarDayIcon } from "./calendar-day-icon.comp";
import { CalendarDaysIcon } from "./calendar-days-icon.comp";
import { CalendarExclamationIcon } from "./calendar-exclamation-icon.comp";
import { CalendarIcon } from "./calendar-icon.comp";
import { CalendarMinusIcon } from "./calendar-minus-icon.comp";
import { CalendarPenIcon } from "./calendar-pen-icon.comp";
import { CalendarPlusIcon } from "./calendar-plus-icon.comp";
import { CalendarRangeIcon } from "./calendar-range-icon.comp";
import { CalendarsIcon } from "./calendars-icon.comp";
import { CalendarStarIcon } from "./calendar-star-icon.comp";
import { CalendarUsersIcon } from "./calendar-users-icon.comp";
import { CalendarWeekIcon } from "./calendar-week-icon.comp";
import { CalendarXmarkIcon } from "./calendar-xmark-icon.comp";
import { CameraIcon } from "./camera-icon.comp";
import { CameraRetroIcon } from "./camera-retro-icon.comp";
import { CameraRotateIcon } from "./camera-rotate-icon.comp";
import { CameraSlashIcon } from "./camera-slash-icon.comp";
import { CameraWebIcon } from "./camera-web-icon.comp";
import { CaretDownIcon } from "./caret-down-icon.comp";
import { CaretLeftIcon } from "./caret-left-icon.comp";
import { CaretRightIcon } from "./caret-right-icon.comp";
import { CaretUpIcon } from "./caret-up-icon.comp";
import { CartArrowDownIcon } from "./cart-arrow-down-icon.comp";
import { CartPlusIcon } from "./cart-plus-icon.comp";
import { CartShoppingIcon } from "./cart-shopping-icon.comp";
import { CashRegisterIcon } from "./cash-register-icon.comp";
import { CastleIcon } from "./castle-icon.comp";
import { CertificateIcon } from "./certificate-icon.comp";
import { ChalkboardIcon } from "./chalkboard-icon.comp";
import { ChalkboardUserIcon } from "./chalkboard-user-icon.comp";
import { ChartAreaIcon } from "./chart-area-icon.comp";
import { ChartBarIcon } from "./chart-bar-icon.comp";
import { ChartColumnIcon } from "./chart-column-icon.comp";
import { ChartGanttIcon } from "./chart-gantt-icon.comp";
import { ChartKanbanIcon } from "./chart-kanban-icon.comp";
import { ChartLineDownIcon } from "./chart-line-down-icon.comp";
import { ChartLineIcon } from "./chart-line-icon.comp";
import { ChartLineUpIcon } from "./chart-line-up-icon.comp";
import { ChartMixedIcon } from "./chart-mixed-icon.comp";
import { ChartNetworkIcon } from "./chart-network-icon.comp";
import { ChartPieIcon } from "./chart-pie-icon.comp";
import { ChartPieSimpleIcon } from "./chart-pie-simple-icon.comp";
import { ChartRadarIcon } from "./chart-radar-icon.comp";
import { ChartSimpleHorizontalIcon } from "./chart-simple-horizontal-icon.comp";
import { ChartSimpleIcon } from "./chart-simple-icon.comp";
import { ChartUserIcon } from "./chart-user-icon.comp";
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
import { ChevronsDownIcon } from "./chevrons-down-icon.comp";
import { ChevronsLeftIcon } from "./chevrons-left-icon.comp";
import { ChevronsRightIcon } from "./chevrons-right-icon.comp";
import { ChevronsUpIcon } from "./chevrons-up-icon.comp";
import { ChevronUpIcon } from "./chevron-up-icon.comp";
import { ChildIcon } from "./child-icon.comp";
import { CircleArrowDownIcon } from "./circle-arrow-down-icon.comp";
import { CircleArrowLeftIcon } from "./circle-arrow-left-icon.comp";
import { CircleArrowRightIcon } from "./circle-arrow-right-icon.comp";
import { CircleArrowUpIcon } from "./circle-arrow-up-icon.comp";
import { CircleCheckIcon } from "./circle-check-icon.comp";
import { CircleChevronDownIcon } from "./circle-chevron-down-icon.comp";
import { CircleChevronLeftIcon } from "./circle-chevron-left-icon.comp";
import { CircleChevronRightIcon } from "./circle-chevron-right-icon.comp";
import { CircleChevronUpIcon } from "./circle-chevron-up-icon.comp";
import { CircleDollarIcon } from "./circle-dollar-icon.comp";
import { CircleDotIcon } from "./circle-dot-icon.comp";
import { CircleDownIcon } from "./circle-down-icon.comp";
import { CircleEllipsisIcon } from "./circle-ellipsis-icon.comp";
import { CircleExclamationCheckIcon } from "./circle-exclamation-check-icon.comp";
import { CircleExclamationIcon } from "./circle-exclamation-icon.comp";
import { CircleHalfIcon } from "./circle-half-icon.comp";
import { CircleHalfStrokeIcon } from "./circle-half-stroke-icon.comp";
import { CircleIcon } from "./circle-icon.comp";
import { CircleInfoIcon } from "./circle-info-icon.comp";
import { CircleLeftIcon } from "./circle-left-icon.comp";
import { CircleMinusIcon } from "./circle-minus-icon.comp";
import { CircleNotchIcon } from "./circle-notch-icon.comp";
import { CirclePauseIcon } from "./circle-pause-icon.comp";
import { CirclePlayIcon } from "./circle-play-icon.comp";
import { CirclePlusIcon } from "./circle-plus-icon.comp";
import { CircleQuestionIcon } from "./circle-question-icon.comp";
import { CircleRightIcon } from "./circle-right-icon.comp";
import { CircleStarIcon } from "./circle-star-icon.comp";
import { CircleStopIcon } from "./circle-stop-icon.comp";
import { CircleUpIcon } from "./circle-up-icon.comp";
import { CircleUserIcon } from "./circle-user-icon.comp";
import { CircleVideoIcon } from "./circle-video-icon.comp";
import { CircleXmarkIcon } from "./circle-xmark-icon.comp";
import { ClapperboardIcon } from "./clapperboard-icon.comp";
import { ClapperboardPlayIcon } from "./clapperboard-play-icon.comp";
import { ClipboardCheckIcon } from "./clipboard-check-icon.comp";
import { ClipboardIcon } from "./clipboard-icon.comp";
import { ClipboardListCheckIcon } from "./clipboard-list-check-icon.comp";
import { ClipboardListIcon } from "./clipboard-list-icon.comp";
import { ClipboardQuestionIcon } from "./clipboard-question-icon.comp";
import { ClipboardUserIcon } from "./clipboard-user-icon.comp";
import { ClockDeskIcon } from "./clock-desk-icon.comp";
import { ClockIcon } from "./clock-icon.comp";
import { ClockRotateLeftIcon } from "./clock-rotate-left-icon.comp";
import { CloneIcon } from "./clone-icon.comp";
import { ClosedCaptioningIcon } from "./closed-captioning-icon.comp";
import { CloudArrowDownIcon } from "./cloud-arrow-down-icon.comp";
import { CloudArrowUpIcon } from "./cloud-arrow-up-icon.comp";
import { CloudBoltIcon } from "./cloud-bolt-icon.comp";
import { CloudIcon } from "./cloud-icon.comp";
import { CloudRainIcon } from "./cloud-rain-icon.comp";
import { CloudSunIcon } from "./cloud-sun-icon.comp";
import { CodeBranchIcon } from "./code-branch-icon.comp";
import { CodeCompareIcon } from "./code-compare-icon.comp";
import { CodeForkIcon } from "./code-fork-icon.comp";
import { CodeIcon } from "./code-icon.comp";
import { CodeMergeIcon } from "./code-merge-icon.comp";
import { CoinIcon } from "./coin-icon.comp";
import { CoinsIcon } from "./coins-icon.comp";
import { Columns3Icon } from "./columns-3-icon.comp";
import { CommentCheckIcon } from "./comment-check-icon.comp";
import { CommentDotsIcon } from "./comment-dots-icon.comp";
import { CommentIcon } from "./comment-icon.comp";
import { CommentPenIcon } from "./comment-pen-icon.comp";
import { CommentPlusIcon } from "./comment-plus-icon.comp";
import { CommentQuestionIcon } from "./comment-question-icon.comp";
import { CommentsIcon } from "./comments-icon.comp";
import { CommentSmsIcon } from "./comment-sms-icon.comp";
import { CommentsQuestionIcon } from "./comments-question-icon.comp";
import { CommentXmarkIcon } from "./comment-xmark-icon.comp";
import { CompassIcon } from "./compass-icon.comp";
import { CompressIcon } from "./compress-icon.comp";
import { ComputerIcon } from "./computer-icon.comp";
import { ComputerMouseIcon } from "./computer-mouse-icon.comp";
import { CopyIcon } from "./copy-icon.comp";
import { CreditCardFrontIcon } from "./credit-card-front-icon.comp";
import { CreditCardIcon } from "./credit-card-icon.comp";
import { CrosshairsIcon } from "./crosshairs-icon.comp";
import { CrownIcon } from "./crown-icon.comp";
import { CubeIcon } from "./cube-icon.comp";
import { CubesIcon } from "./cubes-icon.comp";
import { DatabaseIcon } from "./database-icon.comp";
import { DeleteLeftIcon } from "./delete-left-icon.comp";
import { DesktopArrowDownIcon } from "./desktop-arrow-down-icon.comp";
import { DesktopIcon } from "./desktop-icon.comp";
import { DiagramNestedIcon } from "./diagram-nested-icon.comp";
import { DiagramNextIcon } from "./diagram-next-icon.comp";
import { DiagramPreviousIcon } from "./diagram-previous-icon.comp";
import { DiagramProjectIcon } from "./diagram-project-icon.comp";
import { DiagramSubtaskIcon } from "./diagram-subtask-icon.comp";
import { DiceFiveIcon } from "./dice-five-icon.comp";
import { DiceIcon } from "./dice-icon.comp";
import { DiplomaIcon } from "./diploma-icon.comp";
import { DisplayIcon } from "./display-icon.comp";
import { DisplaySlashIcon } from "./display-slash-icon.comp";
import { DollarSignIcon } from "./dollar-sign-icon.comp";
import { DoorClosedIcon } from "./door-closed-icon.comp";
import { DoorOpenIcon } from "./door-open-icon.comp";
import { DownLeftAndUpRightToCenterIcon } from "./down-left-and-up-right-to-center-icon.comp";
import { DownloadIcon } from "./download-icon.comp";
import { DropletIcon } from "./droplet-icon.comp";
import { DumbbellIcon } from "./dumbbell-icon.comp";
import { EarListenIcon } from "./ear-listen-icon.comp";
import { EarthAmericasIcon } from "./earth-americas-icon.comp";
import { EllipsisIcon } from "./ellipsis-icon.comp";
import { EllipsisVerticalIcon } from "./ellipsis-vertical-icon.comp";
import { EnvelopeCircleCheckIcon } from "./envelope-circle-check-icon.comp";
import { EnvelopeIcon } from "./envelope-icon.comp";
import { EnvelopeOpenIcon } from "./envelope-open-icon.comp";
import { EnvelopeOpenTextIcon } from "./envelope-open-text-icon.comp";
import { EnvelopesIcon } from "./envelopes-icon.comp";
import { EqualsIcon } from "./equals-icon.comp";
import { EraserIcon } from "./eraser-icon.comp";
import { ExclamationIcon } from "./exclamation-icon.comp";
import { ExpandIcon } from "./expand-icon.comp";
import { EyeClosedIcon } from "./eye-closed-icon.comp";
import { EyeDropperIcon } from "./eye-dropper-icon.comp";
import { EyeIcon } from "./eye-icon.comp";
import { EyeLowVisionIcon } from "./eye-low-vision-icon.comp";
import { EyeSlashIcon } from "./eye-slash-icon.comp";
import { FaceConfusedIcon } from "./face-confused-icon.comp";
import { FaceFrownIcon } from "./face-frown-icon.comp";
import { FaceFrownSlightIcon } from "./face-frown-slight-icon.comp";
import { FaceGrinIcon } from "./face-grin-icon.comp";
import { FaceGrinStarsIcon } from "./face-grin-stars-icon.comp";
import { FaceHandOverMouthIcon } from "./face-hand-over-mouth-icon.comp";
import { FaceLaughIcon } from "./face-laugh-icon.comp";
import { FaceMehBlankIcon } from "./face-meh-blank-icon.comp";
import { FaceMehIcon } from "./face-meh-icon.comp";
import { FaceMonocleIcon } from "./face-monocle-icon.comp";
import { FacePartyIcon } from "./face-party-icon.comp";
import { FaceRaisedEyebrowIcon } from "./face-raised-eyebrow-icon.comp";
import { FaceSadTearIcon } from "./face-sad-tear-icon.comp";
import { FaceSalutingIcon } from "./face-saluting-icon.comp";
import { FaceSmileBeamIcon } from "./face-smile-beam-icon.comp";
import { FaceSmileIcon } from "./face-smile-icon.comp";
import { FaceSmileWinkIcon } from "./face-smile-wink-icon.comp";
import { FaceSurpriseIcon } from "./face-surprise-icon.comp";
import { FaceThinkingIcon } from "./face-thinking-icon.comp";
import { FileArrowDownIcon } from "./file-arrow-down-icon.comp";
import { FileArrowUpIcon } from "./file-arrow-up-icon.comp";
import { FileCertificateIcon } from "./file-certificate-icon.comp";
import { FileCheckIcon } from "./file-check-icon.comp";
import { FileCircleCheckIcon } from "./file-circle-check-icon.comp";
import { FileCircleExclamationIcon } from "./file-circle-exclamation-icon.comp";
import { FileCirclePlusIcon } from "./file-circle-plus-icon.comp";
import { FileCircleQuestionIcon } from "./file-circle-question-icon.comp";
import { FileCsvIcon } from "./file-csv-icon.comp";
import { FileExportIcon } from "./file-export-icon.comp";
import { FileIcon } from "./file-icon.comp";
import { FileImageIcon } from "./file-image-icon.comp";
import { FileImportIcon } from "./file-import-icon.comp";
import { FileInvoiceDollarIcon } from "./file-invoice-dollar-icon.comp";
import { FileInvoiceIcon } from "./file-invoice-icon.comp";
import { FileLinesIcon } from "./file-lines-icon.comp";
import { FileMagnifyingGlassIcon } from "./file-magnifying-glass-icon.comp";
import { FileMinusIcon } from "./file-minus-icon.comp";
import { FilePdfIcon } from "./file-pdf-icon.comp";
import { FilePenIcon } from "./file-pen-icon.comp";
import { FilePlusIcon } from "./file-plus-icon.comp";
import { FilesIcon } from "./files-icon.comp";
import { FileVideoIcon } from "./file-video-icon.comp";
import { FileXmarkIcon } from "./file-xmark-icon.comp";
import { FilmIcon } from "./film-icon.comp";
import { FilmSlashIcon } from "./film-slash-icon.comp";
import { FilterCircleXmarkIcon } from "./filter-circle-xmark-icon.comp";
import { FilterIcon } from "./filter-icon.comp";
import { FilterListIcon } from "./filter-list-icon.comp";
import { FilterSlashIcon } from "./filter-slash-icon.comp";
import { FingerprintIcon } from "./fingerprint-icon.comp";
import { FireFlameCurvedIcon } from "./fire-flame-curved-icon.comp";
import { FireFlameSimpleIcon } from "./fire-flame-simple-icon.comp";
import { FireIcon } from "./fire-icon.comp";
import { FlagCheckeredIcon } from "./flag-checkered-icon.comp";
import { FlagIcon } from "./flag-icon.comp";
import { FlagPennantIcon } from "./flag-pennant-icon.comp";
import { FlagSwallowtailIcon } from "./flag-swallowtail-icon.comp";
import { FlaskIcon } from "./flask-icon.comp";
import { FloppyDiskIcon } from "./floppy-disk-icon.comp";
import { FolderArrowDownIcon } from "./folder-arrow-down-icon.comp";
import { FolderArrowUpIcon } from "./folder-arrow-up-icon.comp";
import { FolderCheckIcon } from "./folder-check-icon.comp";
import { FolderIcon } from "./folder-icon.comp";
import { FolderMagnifyingGlassIcon } from "./folder-magnifying-glass-icon.comp";
import { FolderMinusIcon } from "./folder-minus-icon.comp";
import { FolderOpenIcon } from "./folder-open-icon.comp";
import { FolderPlusIcon } from "./folder-plus-icon.comp";
import { FoldersIcon } from "./folders-icon.comp";
import { FolderTreeIcon } from "./folder-tree-icon.comp";
import { FolderUserIcon } from "./folder-user-icon.comp";
import { FolderXmarkIcon } from "./folder-xmark-icon.comp";
import { FontIcon } from "./font-icon.comp";
import { ForwardFastIcon } from "./forward-fast-icon.comp";
import { ForwardIcon } from "./forward-icon.comp";
import { ForwardStepIcon } from "./forward-step-icon.comp";
import { GalleryThumbnailsIcon } from "./gallery-thumbnails-icon.comp";
import { GameBoardIcon } from "./game-board-icon.comp";
import { GameBoardSimpleIcon } from "./game-board-simple-icon.comp";
import { GamepadIcon } from "./gamepad-icon.comp";
import { GaugeHighIcon } from "./gauge-high-icon.comp";
import { GaugeIcon } from "./gauge-icon.comp";
import { GearIcon } from "./gear-icon.comp";
import { GearsIcon } from "./gears-icon.comp";
import { GemIcon } from "./gem-icon.comp";
import { GiftCardIcon } from "./gift-card-icon.comp";
import { GiftIcon } from "./gift-icon.comp";
import { GiftsIcon } from "./gifts-icon.comp";
import { GlassesIcon } from "./glasses-icon.comp";
import { GlobeIcon } from "./globe-icon.comp";
import { GraduationCapIcon } from "./graduation-cap-icon.comp";
import { Grid2Icon } from "./grid-2-icon.comp";
import { GridIcon } from "./grid-icon.comp";
import { GripDotsIcon } from "./grip-dots-icon.comp";
import { GripDotsVerticalIcon } from "./grip-dots-vertical-icon.comp";
import { GripLinesIcon } from "./grip-lines-icon.comp";
import { GripLinesVerticalIcon } from "./grip-lines-vertical-icon.comp";
import { GripVerticalIcon } from "./grip-vertical-icon.comp";
import { H1Icon } from "./h1-icon.comp";
import { H2Icon } from "./h2-icon.comp";
import { H3Icon } from "./h3-icon.comp";
import { HammerIcon } from "./hammer-icon.comp";
import { HandBackFistIcon } from "./hand-back-fist-icon.comp";
import { HandHeartIcon } from "./hand-heart-icon.comp";
import { HandHoldingDollarIcon } from "./hand-holding-dollar-icon.comp";
import { HandHoldingHeartIcon } from "./hand-holding-heart-icon.comp";
import { HandIcon } from "./hand-icon.comp";
import { HandPeaceIcon } from "./hand-peace-icon.comp";
import { HandPointerIcon } from "./hand-pointer-icon.comp";
import { HandPointRightIcon } from "./hand-point-right-icon.comp";
import { HandPointUpIcon } from "./hand-point-up-icon.comp";
import { HandsClappingIcon } from "./hands-clapping-icon.comp";
import { HandshakeIcon } from "./handshake-icon.comp";
import { HandshakeSimpleIcon } from "./handshake-simple-icon.comp";
import { HandsHoldingHeartIcon } from "./hands-holding-heart-icon.comp";
import { HandsHoldingIcon } from "./hands-holding-icon.comp";
import { HandSparklesIcon } from "./hand-sparkles-icon.comp";
import { HandWaveIcon } from "./hand-wave-icon.comp";
import { HardDriveIcon } from "./hard-drive-icon.comp";
import { HashtagIcon } from "./hashtag-icon.comp";
import { HatWizardIcon } from "./hat-wizard-icon.comp";
import { HeadingIcon } from "./heading-icon.comp";
import { HeadphonesIcon } from "./headphones-icon.comp";
import { HeadsetIcon } from "./headset-icon.comp";
import { HeadSideBrainIcon } from "./head-side-brain-icon.comp";
import { HeadSideGearIcon } from "./head-side-gear-icon.comp";
import { HeartCircleCheckIcon } from "./heart-circle-check-icon.comp";
import { HeartCrackIcon } from "./heart-crack-icon.comp";
import { HeartHalfStrokeIcon } from "./heart-half-stroke-icon.comp";
import { HeartIcon } from "./heart-icon.comp";
import { HeartSlashIcon } from "./heart-slash-icon.comp";
import { HelmetBattleIcon } from "./helmet-battle-icon.comp";
import { HighlighterIcon } from "./highlighter-icon.comp";
import { HighlighterLineIcon } from "./highlighter-line-icon.comp";
import { HorizontalRuleIcon } from "./horizontal-rule-icon.comp";
import { HorseHeadIcon } from "./horse-head-icon.comp";
import { HourglassClockIcon } from "./hourglass-clock-icon.comp";
import { HourglassEndIcon } from "./hourglass-end-icon.comp";
import { HourglassHalfIcon } from "./hourglass-half-icon.comp";
import { HourglassIcon } from "./hourglass-icon.comp";
import { HourglassStartIcon } from "./hourglass-start-icon.comp";
import { HouseChimneyIcon } from "./house-chimney-icon.comp";
import { HouseChimneyUserIcon } from "./house-chimney-user-icon.comp";
import { HouseIcon } from "./house-icon.comp";
import { HouseLaptopIcon } from "./house-laptop-icon.comp";
import { HouseUserIcon } from "./house-user-icon.comp";
import { HundredPointsIcon } from "./hundred-points-icon.comp";
import { IdBadgeIcon } from "./id-badge-icon.comp";
import { IdCardIcon } from "./id-card-icon.comp";
import { ImageIcon } from "./image-icon.comp";
import { ImageLandscapeIcon } from "./image-landscape-icon.comp";
import { ImagePolaroidIcon } from "./image-polaroid-icon.comp";
import { ImagesIcon } from "./images-icon.comp";
import { ImageSlashIcon } from "./image-slash-icon.comp";
import { InboxFullIcon } from "./inbox-full-icon.comp";
import { InboxIcon } from "./inbox-icon.comp";
import { InboxInIcon } from "./inbox-in-icon.comp";
import { InboxOutIcon } from "./inbox-out-icon.comp";
import { IndentIcon } from "./indent-icon.comp";
import { InfinityIcon } from "./infinity-icon.comp";
import { InfoIcon } from "./info-icon.comp";
import { InputNumericIcon } from "./input-numeric-icon.comp";
import { InputPasswordIcon } from "./input-password-icon.comp";
import { InputTextIcon } from "./input-text-icon.comp";
import { ItalicIcon } from "./italic-icon.comp";
import { KeyboardBrightnessIcon } from "./keyboard-brightness-icon.comp";
import { KeyboardIcon } from "./keyboard-icon.comp";
import { KeyIcon } from "./key-icon.comp";
import { LandmarkIcon } from "./landmark-icon.comp";
import { LanguageIcon } from "./language-icon.comp";
import { LaptopCodeIcon } from "./laptop-code-icon.comp";
import { LaptopIcon } from "./laptop-icon.comp";
import { LaptopMobileIcon } from "./laptop-mobile-icon.comp";
import { LayerGroupIcon } from "./layer-group-icon.comp";
import { LeafIcon } from "./leaf-icon.comp";
import { LeftRightIcon } from "./left-right-icon.comp";
import { LightbulbExclamationIcon } from "./lightbulb-exclamation-icon.comp";
import { LightbulbGearIcon } from "./lightbulb-gear-icon.comp";
import { LightbulbIcon } from "./lightbulb-icon.comp";
import { LightbulbOnIcon } from "./lightbulb-on-icon.comp";
import { LightbulbSlashIcon } from "./lightbulb-slash-icon.comp";
import { LineHeightIcon } from "./line-height-icon.comp";
import { LinkBrokenIcon } from "./link-broken-icon.comp";
import { LinkIcon } from "./link-icon.comp";
import { LinkSimpleSlashIcon } from "./link-simple-slash-icon.comp";
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
import { LockKeyholeIcon } from "./lock-keyhole-icon.comp";
import { LockOpenIcon } from "./lock-open-icon.comp";
import { LogoMarkIcon } from "./logo-mark-icon.comp";
import { MagnetIcon } from "./magnet-icon.comp";
import { MagnifyingGlassArrowRightIcon } from "./magnifying-glass-arrow-right-icon.comp";
import { MagnifyingGlassChartIcon } from "./magnifying-glass-chart-icon.comp";
import { MagnifyingGlassIcon } from "./magnifying-glass-icon.comp";
import { MagnifyingGlassMinusIcon } from "./magnifying-glass-minus-icon.comp";
import { MagnifyingGlassPlusIcon } from "./magnifying-glass-plus-icon.comp";
import { MapIcon } from "./map-icon.comp";
import { MapLocationDotIcon } from "./map-location-dot-icon.comp";
import { MarkerIcon } from "./marker-icon.comp";
import { MasksTheaterIcon } from "./masks-theater-icon.comp";
import { MaximizeIcon } from "./maximize-icon.comp";
import { MedalIcon } from "./medal-icon.comp";
import { MegaphoneIcon } from "./megaphone-icon.comp";
import { MemoCircleCheckIcon } from "./memo-circle-check-icon.comp";
import { MemoIcon } from "./memo-icon.comp";
import { MessageBotIcon } from "./message-bot-icon.comp";
import { MessageCheckIcon } from "./message-check-icon.comp";
import { MessageDotsIcon } from "./message-dots-icon.comp";
import { MessageIcon } from "./message-icon.comp";
import { MessageLinesIcon } from "./message-lines-icon.comp";
import { MessagePenIcon } from "./message-pen-icon.comp";
import { MessagePlusIcon } from "./message-plus-icon.comp";
import { MessageQuestionIcon } from "./message-question-icon.comp";
import { MessageQuoteIcon } from "./message-quote-icon.comp";
import { MessagesIcon } from "./messages-icon.comp";
import { MessageSlashIcon } from "./message-slash-icon.comp";
import { MessageTextIcon } from "./message-text-icon.comp";
import { MeteorIcon } from "./meteor-icon.comp";
import { MicrochipAiIcon } from "./microchip-ai-icon.comp";
import { MicrochipIcon } from "./microchip-icon.comp";
import { MicrophoneIcon } from "./microphone-icon.comp";
import { MicrophoneLinesIcon } from "./microphone-lines-icon.comp";
import { MicrophoneLinesSlashIcon } from "./microphone-lines-slash-icon.comp";
import { MicrophoneSlashIcon } from "./microphone-slash-icon.comp";
import { MicroscopeIcon } from "./microscope-icon.comp";
import { MinimizeIcon } from "./minimize-icon.comp";
import { MinusIcon } from "./minus-icon.comp";
import { MobileIcon } from "./mobile-icon.comp";
import { MobileRotateIcon } from "./mobile-rotate-icon.comp";
import { MobileScreenIcon } from "./mobile-screen-icon.comp";
import { MobileSlashIcon } from "./mobile-slash-icon.comp";
import { MoneyBillIcon } from "./money-bill-icon.comp";
import { MoneyBillsIcon } from "./money-bills-icon.comp";
import { MoneyBillWaveIcon } from "./money-bill-wave-icon.comp";
import { MoneyCheckIcon } from "./money-check-icon.comp";
import { MoonIcon } from "./moon-icon.comp";
import { MoonStarsIcon } from "./moon-stars-icon.comp";
import { MountainIcon } from "./mountain-icon.comp";
import { MusicIcon } from "./music-icon.comp";
import { NewspaperIcon } from "./newspaper-icon.comp";
import { NotebookIcon } from "./notebook-icon.comp";
import { NotEqualIcon } from "./not-equal-icon.comp";
import { NotesIcon } from "./notes-icon.comp";
import { NoteStickyIcon } from "./note-sticky-icon.comp";
import { ObjectsColumnIcon } from "./objects-column-icon.comp";
import { OctagonExclamationIcon } from "./octagon-exclamation-icon.comp";
import { OutdentIcon } from "./outdent-icon.comp";
import { PaintbrushIcon } from "./paintbrush-icon.comp";
import { PaletteIcon } from "./palette-icon.comp";
import { PaperclipIcon } from "./paperclip-icon.comp";
import { PaperPlaneIcon } from "./paper-plane-icon.comp";
import { PaperPlaneTopIcon } from "./paper-plane-top-icon.comp";
import { ParagraphIcon } from "./paragraph-icon.comp";
import { PartyHornIcon } from "./party-horn-icon.comp";
import { PasteIcon } from "./paste-icon.comp";
import { PauseIcon } from "./pause-icon.comp";
import { PencilIcon } from "./pencil-icon.comp";
import { PencilLineIcon } from "./pencil-line-icon.comp";
import { PenClipIcon } from "./pen-clip-icon.comp";
import { PenIcon } from "./pen-icon.comp";
import { PenLineIcon } from "./pen-line-icon.comp";
import { PenNibIcon } from "./pen-nib-icon.comp";
import { PenRulerIcon } from "./pen-ruler-icon.comp";
import { PenToSquareIcon } from "./pen-to-square-icon.comp";
import { PeopleArrowsIcon } from "./people-arrows-icon.comp";
import { PeopleGroupIcon } from "./people-group-icon.comp";
import { PeopleIcon } from "./people-icon.comp";
import { PercentIcon } from "./percent-icon.comp";
import { PersonChalkboardIcon } from "./person-chalkboard-icon.comp";
import { PersonCircleCheckIcon } from "./person-circle-check-icon.comp";
import { PersonCircleQuestionIcon } from "./person-circle-question-icon.comp";
import { PersonIcon } from "./person-icon.comp";
import { PersonRunningIcon } from "./person-running-icon.comp";
import { PersonWalkingIcon } from "./person-walking-icon.comp";
import { PersonWavingIcon } from "./person-waving-icon.comp";
import { PesoSignIcon } from "./peso-sign-icon.comp";
import { PhoneIcon } from "./phone-icon.comp";
import { PhoneSlashIcon } from "./phone-slash-icon.comp";
import { PhoneVolumeIcon } from "./phone-volume-icon.comp";
import { PhotoFilmIcon } from "./photo-film-icon.comp";
import { PictureInPictureIcon } from "./picture-in-picture-icon.comp";
import { PiggyBankIcon } from "./piggy-bank-icon.comp";
import { PlaneIcon } from "./plane-icon.comp";
import { PlayIcon } from "./play-icon.comp";
import { PlayPauseIcon } from "./play-pause-icon.comp";
import { PlugIcon } from "./plug-icon.comp";
import { PlusIcon } from "./plus-icon.comp";
import { PlusLargeIcon } from "./plus-large-icon.comp";
import { PlusMinusIcon } from "./plus-minus-icon.comp";
import { PodcastIcon } from "./podcast-icon.comp";
import { PodiumIcon } from "./podium-icon.comp";
import { PodiumStarIcon } from "./podium-star-icon.comp";
import { PresentationScreenIcon } from "./presentation-screen-icon.comp";
import { PrintIcon } from "./print-icon.comp";
import { PuzzleIcon } from "./puzzle-icon.comp";
import { PuzzlePieceIcon } from "./puzzle-piece-icon.comp";
import { QrcodeIcon } from "./qrcode-icon.comp";
import { QuestionIcon } from "./question-icon.comp";
import { QuoteLeftIcon } from "./quote-left-icon.comp";
import { QuoteRightIcon } from "./quote-right-icon.comp";
import { RadioIcon } from "./radio-icon.comp";
import { RainbowIcon } from "./rainbow-icon.comp";
import { RankingStarIcon } from "./ranking-star-icon.comp";
import { ReceiptIcon } from "./receipt-icon.comp";
import { RectangleListIcon } from "./rectangle-list-icon.comp";
import { RepeatIcon } from "./repeat-icon.comp";
import { ReplyAllIcon } from "./reply-all-icon.comp";
import { ReplyIcon } from "./reply-icon.comp";
import { RetweetIcon } from "./retweet-icon.comp";
import { RibbonIcon } from "./ribbon-icon.comp";
import { RightLeftIcon } from "./right-left-icon.comp";
import { RobotIcon } from "./robot-icon.comp";
import { RocketIcon } from "./rocket-icon.comp";
import { RocketLaunchIcon } from "./rocket-launch-icon.comp";
import { RotateIcon } from "./rotate-icon.comp";
import { RotateLeftIcon } from "./rotate-left-icon.comp";
import { RotateReverseIcon } from "./rotate-reverse-icon.comp";
import { RotateRightIcon } from "./rotate-right-icon.comp";
import { RouteIcon } from "./route-icon.comp";
import { RssIcon } from "./rss-icon.comp";
import { RulerIcon } from "./ruler-icon.comp";
import { SackDollarIcon } from "./sack-dollar-icon.comp";
import { ScaleBalancedIcon } from "./scale-balanced-icon.comp";
import { ScaleUnbalancedIcon } from "./scale-unbalanced-icon.comp";
import { SchoolFlagIcon } from "./school-flag-icon.comp";
import { SchoolIcon } from "./school-icon.comp";
import { ScissorsIcon } from "./scissors-icon.comp";
import { ScreencastIcon } from "./screencast-icon.comp";
import { ScreenUsersIcon } from "./screen-users-icon.comp";
import { ScrewdriverWrenchIcon } from "./screwdriver-wrench-icon.comp";
import { ScrollIcon } from "./scroll-icon.comp";
import { SealIcon } from "./seal-icon.comp";
import { SeedlingIcon } from "./seedling-icon.comp";
import { ServerIcon } from "./server-icon.comp";
import { ShareFromSquareIcon } from "./share-from-square-icon.comp";
import { ShareIcon } from "./share-icon.comp";
import { ShareNodesIcon } from "./share-nodes-icon.comp";
import { ShieldCheckIcon } from "./shield-check-icon.comp";
import { ShieldExclamationIcon } from "./shield-exclamation-icon.comp";
import { ShieldHalvedIcon } from "./shield-halved-icon.comp";
import { ShieldIcon } from "./shield-icon.comp";
import { ShieldQuarteredIcon } from "./shield-quartered-icon.comp";
import { ShuffleIcon } from "./shuffle-icon.comp";
import { SidebarFlipIcon } from "./sidebar-flip-icon.comp";
import { SidebarIcon } from "./sidebar-icon.comp";
import { SignalBarsIcon } from "./signal-bars-icon.comp";
import { SignalIcon } from "./signal-icon.comp";
import { SignsPostIcon } from "./signs-post-icon.comp";
import { SitemapIcon } from "./sitemap-icon.comp";
import { SlidersIcon } from "./sliders-icon.comp";
import { SlidersSimpleIcon } from "./sliders-simple-icon.comp";
import { SnowflakeIcon } from "./snowflake-icon.comp";
import { SortDownIcon } from "./sort-down-icon.comp";
import { SortIcon } from "./sort-icon.comp";
import { SortUpIcon } from "./sort-up-icon.comp";
import { SparkleIcon } from "./sparkle-icon.comp";
import { SparklesIcon } from "./sparkles-icon.comp";
import { SpellCheckIcon } from "./spell-check-icon.comp";
import { SpinnerIcon } from "./spinner-icon.comp";
import { SpinnerThirdIcon } from "./spinner-third-icon.comp";
import { SquareArrowUpRightIcon } from "./square-arrow-up-right-icon.comp";
import { SquareCheckIcon } from "./square-check-icon.comp";
import { SquareDashedCirclePlusIcon } from "./square-dashed-circle-plus-icon.comp";
import { SquareExclamationIcon } from "./square-exclamation-icon.comp";
import { SquareIcon } from "./square-icon.comp";
import { SquareInfoIcon } from "./square-info-icon.comp";
import { SquareKanbanIcon } from "./square-kanban-icon.comp";
import { SquareListIcon } from "./square-list-icon.comp";
import { SquareMinusIcon } from "./square-minus-icon.comp";
import { SquarePenIcon } from "./square-pen-icon.comp";
import { SquarePlusIcon } from "./square-plus-icon.comp";
import { SquarePollVerticalIcon } from "./square-poll-vertical-icon.comp";
import { SquareQuestionIcon } from "./square-question-icon.comp";
import { SquareTerminalIcon } from "./square-terminal-icon.comp";
import { SquareXmarkIcon } from "./square-xmark-icon.comp";
import { StampIcon } from "./stamp-icon.comp";
import { StarHalfIcon } from "./star-half-icon.comp";
import { StarHalfStrokeIcon } from "./star-half-stroke-icon.comp";
import { StarIcon } from "./star-icon.comp";
import { StarSharpIcon } from "./star-sharp-icon.comp";
import { StarShootingIcon } from "./star-shooting-icon.comp";
import { StarsIcon } from "./stars-icon.comp";
import { StopIcon } from "./stop-icon.comp";
import { Stopwatch20Icon } from "./stopwatch-20-icon.comp";
import { StopwatchIcon } from "./stopwatch-icon.comp";
import { StoreIcon } from "./store-icon.comp";
import { StrikethroughIcon } from "./strikethrough-icon.comp";
import { SubscriptIcon } from "./subscript-icon.comp";
import { SubtitlesIcon } from "./subtitles-icon.comp";
import { SubtitlesSlashIcon } from "./subtitles-slash-icon.comp";
import { SunBrightIcon } from "./sun-bright-icon.comp";
import { SunIcon } from "./sun-icon.comp";
import { SuperscriptIcon } from "./superscript-icon.comp";
import { SwordIcon } from "./sword-icon.comp";
import { SwordsIcon } from "./swords-icon.comp";
import { TableCellsIcon } from "./table-cells-icon.comp";
import { TableCellsLargeIcon } from "./table-cells-large-icon.comp";
import { TableColumnsIcon } from "./table-columns-icon.comp";
import { TableIcon } from "./table-icon.comp";
import { TableListIcon } from "./table-list-icon.comp";
import { TableRowsIcon } from "./table-rows-icon.comp";
import { TabletIcon } from "./tablet-icon.comp";
import { TabletScreenButtonIcon } from "./tablet-screen-button-icon.comp";
import { TagIcon } from "./tag-icon.comp";
import { TagsIcon } from "./tags-icon.comp";
import { TelescopeIcon } from "./telescope-icon.comp";
import { TemperatureHalfIcon } from "./temperature-half-icon.comp";
import { TerminalIcon } from "./terminal-icon.comp";
import { TextHeightIcon } from "./text-height-icon.comp";
import { TextIcon } from "./text-icon.comp";
import { TextSizeIcon } from "./text-size-icon.comp";
import { TextSlashIcon } from "./text-slash-icon.comp";
import { TextWidthIcon } from "./text-width-icon.comp";
import { ThoughtBubbleIcon } from "./thought-bubble-icon.comp";
import { ThumbsDownIcon } from "./thumbs-down-icon.comp";
import { ThumbsUpIcon } from "./thumbs-up-icon.comp";
import { ThumbtackIcon } from "./thumbtack-icon.comp";
import { ThumbtackSlashIcon } from "./thumbtack-slash-icon.comp";
import { TicketIcon } from "./ticket-icon.comp";
import { TicketSimpleIcon } from "./ticket-simple-icon.comp";
import { TimelineArrowIcon } from "./timeline-arrow-icon.comp";
import { TimelineIcon } from "./timeline-icon.comp";
import { TimerIcon } from "./timer-icon.comp";
import { ToggleLargeOffIcon } from "./toggle-large-off-icon.comp";
import { ToggleLargeOnIcon } from "./toggle-large-on-icon.comp";
import { ToggleOffIcon } from "./toggle-off-icon.comp";
import { ToggleOnIcon } from "./toggle-on-icon.comp";
import { ToolboxIcon } from "./toolbox-icon.comp";
import { TrashCanArrowUpIcon } from "./trash-can-arrow-up-icon.comp";
import { TrashCanIcon } from "./trash-can-icon.comp";
import { TreeIcon } from "./tree-icon.comp";
import { TriangleExclamationIcon } from "./triangle-exclamation-icon.comp";
import { TrophyIcon } from "./trophy-icon.comp";
import { TrophyStarIcon } from "./trophy-star-icon.comp";
import { TruckIcon } from "./truck-icon.comp";
import { TvIcon } from "./tv-icon.comp";
import { UmbrellaIcon } from "./umbrella-icon.comp";
import { UnderlineIcon } from "./underline-icon.comp";
import { UniversalAccessIcon } from "./universal-access-icon.comp";
import { UnlockIcon } from "./unlock-icon.comp";
import { UpDownIcon } from "./up-down-icon.comp";
import { UploadIcon } from "./upload-icon.comp";
import { UpRightAndDownLeftFromCenterIcon } from "./up-right-and-down-left-from-center-icon.comp";
import { UserCheckIcon } from "./user-check-icon.comp";
import { UserCircleMinusIcon } from "./user-circle-minus-icon.comp";
import { UserCirclePlusIcon } from "./user-circle-plus-icon.comp";
import { UserClockIcon } from "./user-clock-icon.comp";
import { UserCrownIcon } from "./user-crown-icon.comp";
import { UserDashedIcon } from "./user-dashed-icon.comp";
import { UserGearIcon } from "./user-gear-icon.comp";
import { UserGraduateIcon } from "./user-graduate-icon.comp";
import { UserGroupCrownIcon } from "./user-group-crown-icon.comp";
import { UserGroupIcon } from "./user-group-icon.comp";
import { UserHeadsetIcon } from "./user-headset-icon.comp";
import { UserIcon } from "./user-icon.comp";
import { UserLockIcon } from "./user-lock-icon.comp";
import { UserMagnifyingGlassIcon } from "./user-magnifying-glass-icon.comp";
import { UserMessageIcon } from "./user-message-icon.comp";
import { UserMinusIcon } from "./user-minus-icon.comp";
import { UserNinjaIcon } from "./user-ninja-icon.comp";
import { UserPenIcon } from "./user-pen-icon.comp";
import { UserPlusIcon } from "./user-plus-icon.comp";
import { UserQuestionIcon } from "./user-question-icon.comp";
import { UserRobotIcon } from "./user-robot-icon.comp";
import { UserSecretIcon } from "./user-secret-icon.comp";
import { UsersGearIcon } from "./users-gear-icon.comp";
import { UserShieldIcon } from "./user-shield-icon.comp";
import { UsersIcon } from "./users-icon.comp";
import { UserSlashIcon } from "./user-slash-icon.comp";
import { UsersSlashIcon } from "./users-slash-icon.comp";
import { UsersViewfinderIcon } from "./users-viewfinder-icon.comp";
import { UserTieIcon } from "./user-tie-icon.comp";
import { UserUnlockIcon } from "./user-unlock-icon.comp";
import { UserXmarkIcon } from "./user-xmark-icon.comp";
import { VideoIcon } from "./video-icon.comp";
import { VideoPlusIcon } from "./video-plus-icon.comp";
import { VideoQuestionIcon } from "./video-question-icon.comp";
import { VideoSlashIcon } from "./video-slash-icon.comp";
import { VoicemailIcon } from "./voicemail-icon.comp";
import { VolumeHighIcon } from "./volume-high-icon.comp";
import { VolumeIcon } from "./volume-icon.comp";
import { VolumeLowIcon } from "./volume-low-icon.comp";
import { VolumeOffIcon } from "./volume-off-icon.comp";
import { VolumeSlashIcon } from "./volume-slash-icon.comp";
import { VolumeXmarkIcon } from "./volume-xmark-icon.comp";
import { WalletIcon } from "./wallet-icon.comp";
import { WandMagicSparklesIcon } from "./wand-magic-sparkles-icon.comp";
import { WandSparklesIcon } from "./wand-sparkles-icon.comp";
import { WaterIcon } from "./water-icon.comp";
import { WaveformIcon } from "./waveform-icon.comp";
import { WhatsappIcon } from "./whatsapp-icon.comp";
import { WifiExclamationIcon } from "./wifi-exclamation-icon.comp";
import { WifiIcon } from "./wifi-icon.comp";
import { WifiSlashIcon } from "./wifi-slash-icon.comp";
import { WindIcon } from "./wind-icon.comp";
import { WindowMaximizeIcon } from "./window-maximize-icon.comp";
import { WindowRestoreIcon } from "./window-restore-icon.comp";
import { WreathLaurelIcon } from "./wreath-laurel-icon.comp";
import { WrenchIcon } from "./wrench-icon.comp";
import { XmarkIcon } from "./xmark-icon.comp";
import { XmarkLargeIcon } from "./xmark-large-icon.comp";

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
  { name: "AddressBookIcon", Icon: AddressBookIcon, width: 24, height: 24 },
  { name: "AddressCardIcon", Icon: AddressCardIcon, width: 24, height: 24 },
  { name: "AlarmClockIcon", Icon: AlarmClockIcon, width: 24, height: 24 },
  { name: "AlarmExclamationIcon", Icon: AlarmExclamationIcon, width: 24, height: 24 },
  { name: "AlarmPlusIcon", Icon: AlarmPlusIcon, width: 24, height: 24 },
  { name: "AlarmSnoozeIcon", Icon: AlarmSnoozeIcon, width: 24, height: 24 },
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
  { name: "AnglesDownIcon", Icon: AnglesDownIcon, width: 24, height: 24 },
  { name: "AnglesLeftIcon", Icon: AnglesLeftIcon, width: 24, height: 24 },
  { name: "AnglesRightIcon", Icon: AnglesRightIcon, width: 24, height: 24 },
  { name: "AnglesUpIcon", Icon: AnglesUpIcon, width: 24, height: 24 },
  { name: "AngleUpIcon", Icon: AngleUpIcon, width: 24, height: 24 },
  { name: "ArrowDownAZIcon", Icon: ArrowDownAZIcon, width: 24, height: 24 },
  { name: "ArrowDownIcon", Icon: ArrowDownIcon, width: 24, height: 24 },
  { name: "ArrowDownLeftIcon", Icon: ArrowDownLeftIcon, width: 24, height: 24 },
  { name: "ArrowDownLongIcon", Icon: ArrowDownLongIcon, width: 24, height: 24 },
  { name: "ArrowDownRightIcon", Icon: ArrowDownRightIcon, width: 24, height: 24 },
  { name: "ArrowDownToBracketIcon", Icon: ArrowDownToBracketIcon, width: 24, height: 24 },
  { name: "ArrowDownToLineIcon", Icon: ArrowDownToLineIcon, width: 24, height: 24 },
  { name: "ArrowDownWideShortIcon", Icon: ArrowDownWideShortIcon, width: 24, height: 24 },
  { name: "ArrowLeftIcon", Icon: ArrowLeftIcon, width: 24, height: 24 },
  { name: "ArrowLeftLongIcon", Icon: ArrowLeftLongIcon, width: 24, height: 24 },
  { name: "ArrowLeftToLineIcon", Icon: ArrowLeftToLineIcon, width: 24, height: 24 },
  { name: "ArrowPointerIcon", Icon: ArrowPointerIcon, width: 24, height: 24 },
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
  { name: "ArrowRotateForwardIcon", Icon: ArrowRotateForwardIcon, width: 24, height: 24 },
  {
    name: "ArrowRotateLeftIcon",
    Icon: ArrowRotateLeftIcon,
    width: 24,
    height: 24,
    use: { size: 28, where: "mobile clock (site)" },
  },
  { name: "ArrowRotateRightIcon", Icon: ArrowRotateRightIcon, width: 24, height: 24 },
  { name: "ArrowsLeftRightIcon", Icon: ArrowsLeftRightIcon, width: 24, height: 24 },
  { name: "ArrowsMaximizeIcon", Icon: ArrowsMaximizeIcon, width: 24, height: 24 },
  { name: "ArrowsMinimizeIcon", Icon: ArrowsMinimizeIcon, width: 24, height: 24 },
  { name: "ArrowsRepeatIcon", Icon: ArrowsRepeatIcon, width: 24, height: 24 },
  { name: "ArrowsRotateIcon", Icon: ArrowsRotateIcon, width: 20, height: 20, use: { size: 20, where: "board tools" } },
  { name: "ArrowsSpinIcon", Icon: ArrowsSpinIcon, width: 24, height: 24 },
  { name: "ArrowsToDotIcon", Icon: ArrowsToDotIcon, width: 24, height: 24 },
  { name: "ArrowsUpDownIcon", Icon: ArrowsUpDownIcon, width: 24, height: 24 },
  { name: "ArrowTrendDownIcon", Icon: ArrowTrendDownIcon, width: 24, height: 24 },
  { name: "ArrowTrendUpIcon", Icon: ArrowTrendUpIcon, width: 24, height: 24 },
  { name: "ArrowTurnDownIcon", Icon: ArrowTurnDownIcon, width: 24, height: 24 },
  { name: "ArrowTurnLeftIcon", Icon: ArrowTurnLeftIcon, width: 24, height: 24 },
  { name: "ArrowTurnRightIcon", Icon: ArrowTurnRightIcon, width: 24, height: 24 },
  { name: "ArrowTurnUpIcon", Icon: ArrowTurnUpIcon, width: 24, height: 24 },
  { name: "ArrowUpFromBracketIcon", Icon: ArrowUpFromBracketIcon, width: 24, height: 24 },
  { name: "ArrowUpFromLineIcon", Icon: ArrowUpFromLineIcon, width: 24, height: 24 },
  { name: "ArrowUpIcon", Icon: ArrowUpIcon, width: 24, height: 24, use: { size: 20, where: "move menu, user menu" } },
  { name: "ArrowUpLeftIcon", Icon: ArrowUpLeftIcon, width: 24, height: 24 },
  { name: "ArrowUpLongIcon", Icon: ArrowUpLongIcon, width: 24, height: 24 },
  { name: "ArrowUpRightFromSquareIcon", Icon: ArrowUpRightFromSquareIcon, width: 24, height: 24 },
  { name: "ArrowUpRightIcon", Icon: ArrowUpRightIcon, width: 24, height: 24 },
  { name: "ArrowUpToLineIcon", Icon: ArrowUpToLineIcon, width: 24, height: 24 },
  { name: "ArrowUpWideShortIcon", Icon: ArrowUpWideShortIcon, width: 24, height: 24 },
  { name: "ArrowUpZAIcon", Icon: ArrowUpZAIcon, width: 24, height: 24 },
  { name: "AtIcon", Icon: AtIcon, width: 24, height: 24 },
  { name: "AtomIcon", Icon: AtomIcon, width: 24, height: 24 },
  { name: "AwardIcon", Icon: AwardIcon, width: 24, height: 24 },
  { name: "AwardSimpleIcon", Icon: AwardSimpleIcon, width: 24, height: 24 },
  { name: "BackwardFastIcon", Icon: BackwardFastIcon, width: 24, height: 24 },
  { name: "BackwardIcon", Icon: BackwardIcon, width: 24, height: 24 },
  {
    name: "BackwardStepIcon",
    Icon: BackwardStepIcon,
    width: 24,
    height: 24,
    use: { size: 20, where: "game viewer", variant: "duotone-solid" },
  },
  { name: "BadgeCheckIcon", Icon: BadgeCheckIcon, width: 24, height: 24 },
  { name: "BadgePercentIcon", Icon: BadgePercentIcon, width: 24, height: 24 },
  { name: "BagShoppingIcon", Icon: BagShoppingIcon, width: 24, height: 24 },
  { name: "BalloonsIcon", Icon: BalloonsIcon, width: 24, height: 24 },
  { name: "BanIcon", Icon: BanIcon, width: 24, height: 24 },
  { name: "BarcodeIcon", Icon: BarcodeIcon, width: 24, height: 24 },
  { name: "BarsFilterIcon", Icon: BarsFilterIcon, width: 24, height: 24 },
  { name: "BarsIcon", Icon: BarsIcon, width: 24, height: 24, use: { size: 20, where: "game viewer" } },
  { name: "BarsProgressIcon", Icon: BarsProgressIcon, width: 24, height: 24 },
  { name: "BarsSortIcon", Icon: BarsSortIcon, width: 24, height: 24 },
  { name: "BarsStaggeredIcon", Icon: BarsStaggeredIcon, width: 24, height: 24 },
  { name: "BasketShoppingIcon", Icon: BasketShoppingIcon, width: 24, height: 24 },
  { name: "BatteryEmptyIcon", Icon: BatteryEmptyIcon, width: 24, height: 24 },
  { name: "BatteryFullIcon", Icon: BatteryFullIcon, width: 24, height: 24 },
  { name: "BatteryHalfIcon", Icon: BatteryHalfIcon, width: 24, height: 24 },
  { name: "BellIcon", Icon: BellIcon, width: 24, height: 24 },
  { name: "BellRingIcon", Icon: BellRingIcon, width: 24, height: 24 },
  { name: "BellSchoolIcon", Icon: BellSchoolIcon, width: 24, height: 24 },
  { name: "BellSlashIcon", Icon: BellSlashIcon, width: 24, height: 24 },
  { name: "BlockQuoteIcon", Icon: BlockQuoteIcon, width: 24, height: 24 },
  { name: "BluetoothIcon", Icon: BluetoothIcon, width: 24, height: 24 },
  { name: "BoldIcon", Icon: BoldIcon, width: 24, height: 24 },
  { name: "BoltAutoIcon", Icon: BoltAutoIcon, width: 24, height: 24 },
  { name: "BoltIcon", Icon: BoltIcon, width: 24, height: 24 },
  { name: "BoltLightningIcon", Icon: BoltLightningIcon, width: 24, height: 24 },
  { name: "BookArrowRightIcon", Icon: BookArrowRightIcon, width: 24, height: 24 },
  { name: "BookArrowUpIcon", Icon: BookArrowUpIcon, width: 24, height: 24 },
  { name: "BookAtlasIcon", Icon: BookAtlasIcon, width: 24, height: 24 },
  { name: "BookBookmarkIcon", Icon: BookBookmarkIcon, width: 24, height: 24 },
  { name: "BookIcon", Icon: BookIcon, width: 24, height: 24 },
  { name: "BookmarkIcon", Icon: BookmarkIcon, width: 24, height: 24 },
  { name: "BookmarkPlusIcon", Icon: BookmarkPlusIcon, width: 24, height: 24 },
  { name: "BookmarkSlashIcon", Icon: BookmarkSlashIcon, width: 24, height: 24 },
  { name: "BookOpenCoverIcon", Icon: BookOpenCoverIcon, width: 24, height: 24 },
  { name: "BookOpenIcon", Icon: BookOpenIcon, width: 24, height: 24 },
  { name: "BookOpenLinesIcon", Icon: BookOpenLinesIcon, width: 24, height: 24 },
  { name: "BookOpenReaderIcon", Icon: BookOpenReaderIcon, width: 24, height: 24 },
  { name: "BooksIcon", Icon: BooksIcon, width: 24, height: 24 },
  { name: "BookSparklesIcon", Icon: BookSparklesIcon, width: 24, height: 24 },
  { name: "BookUserIcon", Icon: BookUserIcon, width: 24, height: 24 },
  { name: "BorderAllIcon", Icon: BorderAllIcon, width: 24, height: 24 },
  { name: "BoxArchiveIcon", Icon: BoxArchiveIcon, width: 24, height: 24 },
  { name: "BoxIcon", Icon: BoxIcon, width: 24, height: 24 },
  { name: "BrainArrowCurvedRightIcon", Icon: BrainArrowCurvedRightIcon, width: 24, height: 24 },
  { name: "BrainCircuitIcon", Icon: BrainCircuitIcon, width: 24, height: 24 },
  { name: "BrainIcon", Icon: BrainIcon, width: 24, height: 24 },
  { name: "BrowserIcon", Icon: BrowserIcon, width: 24, height: 24 },
  { name: "BugIcon", Icon: BugIcon, width: 24, height: 24 },
  { name: "BuildingIcon", Icon: BuildingIcon, width: 24, height: 24 },
  { name: "BullhornIcon", Icon: BullhornIcon, width: 24, height: 24 },
  { name: "BullseyeArrowIcon", Icon: BullseyeArrowIcon, width: 24, height: 24 },
  { name: "BullseyeIcon", Icon: BullseyeIcon, width: 24, height: 24 },
  { name: "BurstIcon", Icon: BurstIcon, width: 24, height: 24 },
  { name: "BusinessTimeIcon", Icon: BusinessTimeIcon, width: 24, height: 24 },
  { name: "BusSchoolIcon", Icon: BusSchoolIcon, width: 24, height: 24 },
  { name: "CalculatorIcon", Icon: CalculatorIcon, width: 24, height: 24 },
  { name: "CalendarArrowDownIcon", Icon: CalendarArrowDownIcon, width: 24, height: 24 },
  { name: "CalendarArrowUpIcon", Icon: CalendarArrowUpIcon, width: 24, height: 24 },
  {
    name: "CalendarCheckIcon",
    Icon: CalendarCheckIcon,
    width: 24,
    height: 24,
    use: { size: 16, where: "teacher CTA (site)" },
  },
  { name: "CalendarCirclePlusIcon", Icon: CalendarCirclePlusIcon, width: 24, height: 24 },
  { name: "CalendarClockIcon", Icon: CalendarClockIcon, width: 24, height: 24 },
  { name: "CalendarDayIcon", Icon: CalendarDayIcon, width: 24, height: 24 },
  { name: "CalendarDaysIcon", Icon: CalendarDaysIcon, width: 24, height: 24 },
  { name: "CalendarExclamationIcon", Icon: CalendarExclamationIcon, width: 24, height: 24 },
  { name: "CalendarIcon", Icon: CalendarIcon, width: 24, height: 24, use: { size: 18, where: "date picker" } },
  { name: "CalendarMinusIcon", Icon: CalendarMinusIcon, width: 24, height: 24 },
  { name: "CalendarPenIcon", Icon: CalendarPenIcon, width: 24, height: 24 },
  { name: "CalendarPlusIcon", Icon: CalendarPlusIcon, width: 24, height: 24 },
  { name: "CalendarRangeIcon", Icon: CalendarRangeIcon, width: 24, height: 24 },
  { name: "CalendarsIcon", Icon: CalendarsIcon, width: 24, height: 24 },
  { name: "CalendarStarIcon", Icon: CalendarStarIcon, width: 24, height: 24 },
  { name: "CalendarUsersIcon", Icon: CalendarUsersIcon, width: 24, height: 24 },
  { name: "CalendarWeekIcon", Icon: CalendarWeekIcon, width: 24, height: 24 },
  { name: "CalendarXmarkIcon", Icon: CalendarXmarkIcon, width: 24, height: 24 },
  { name: "CameraIcon", Icon: CameraIcon, width: 24, height: 24 },
  { name: "CameraRetroIcon", Icon: CameraRetroIcon, width: 24, height: 24 },
  { name: "CameraRotateIcon", Icon: CameraRotateIcon, width: 24, height: 24 },
  { name: "CameraSlashIcon", Icon: CameraSlashIcon, width: 24, height: 24 },
  { name: "CameraWebIcon", Icon: CameraWebIcon, width: 24, height: 24 },
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
  { name: "CartArrowDownIcon", Icon: CartArrowDownIcon, width: 24, height: 24 },
  { name: "CartPlusIcon", Icon: CartPlusIcon, width: 24, height: 24 },
  { name: "CartShoppingIcon", Icon: CartShoppingIcon, width: 24, height: 24 },
  { name: "CashRegisterIcon", Icon: CashRegisterIcon, width: 24, height: 24 },
  { name: "CastleIcon", Icon: CastleIcon, width: 24, height: 24 },
  { name: "CertificateIcon", Icon: CertificateIcon, width: 24, height: 24 },
  { name: "ChalkboardIcon", Icon: ChalkboardIcon, width: 24, height: 24 },
  { name: "ChalkboardUserIcon", Icon: ChalkboardUserIcon, width: 24, height: 24 },
  { name: "ChartAreaIcon", Icon: ChartAreaIcon, width: 24, height: 24 },
  { name: "ChartBarIcon", Icon: ChartBarIcon, width: 24, height: 24 },
  { name: "ChartColumnIcon", Icon: ChartColumnIcon, width: 24, height: 24 },
  { name: "ChartGanttIcon", Icon: ChartGanttIcon, width: 24, height: 24 },
  { name: "ChartKanbanIcon", Icon: ChartKanbanIcon, width: 24, height: 24 },
  { name: "ChartLineDownIcon", Icon: ChartLineDownIcon, width: 24, height: 24 },
  { name: "ChartLineIcon", Icon: ChartLineIcon, width: 24, height: 24 },
  { name: "ChartLineUpIcon", Icon: ChartLineUpIcon, width: 24, height: 24 },
  { name: "ChartMixedIcon", Icon: ChartMixedIcon, width: 24, height: 24 },
  { name: "ChartNetworkIcon", Icon: ChartNetworkIcon, width: 24, height: 24 },
  { name: "ChartPieIcon", Icon: ChartPieIcon, width: 24, height: 24 },
  { name: "ChartPieSimpleIcon", Icon: ChartPieSimpleIcon, width: 24, height: 24 },
  { name: "ChartRadarIcon", Icon: ChartRadarIcon, width: 24, height: 24 },
  { name: "ChartSimpleHorizontalIcon", Icon: ChartSimpleHorizontalIcon, width: 24, height: 24 },
  { name: "ChartSimpleIcon", Icon: ChartSimpleIcon, width: 24, height: 24 },
  { name: "ChartUserIcon", Icon: ChartUserIcon, width: 24, height: 24 },
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
  { name: "ChevronsDownIcon", Icon: ChevronsDownIcon, width: 24, height: 24 },
  { name: "ChevronsLeftIcon", Icon: ChevronsLeftIcon, width: 24, height: 24 },
  { name: "ChevronsRightIcon", Icon: ChevronsRightIcon, width: 24, height: 24 },
  { name: "ChevronsUpIcon", Icon: ChevronsUpIcon, width: 24, height: 24 },
  { name: "ChevronUpIcon", Icon: ChevronUpIcon, width: 24, height: 24 },
  { name: "ChildIcon", Icon: ChildIcon, width: 24, height: 24 },
  { name: "CircleArrowDownIcon", Icon: CircleArrowDownIcon, width: 24, height: 24 },
  { name: "CircleArrowLeftIcon", Icon: CircleArrowLeftIcon, width: 24, height: 24 },
  { name: "CircleArrowRightIcon", Icon: CircleArrowRightIcon, width: 24, height: 24 },
  { name: "CircleArrowUpIcon", Icon: CircleArrowUpIcon, width: 24, height: 24 },
  {
    name: "CircleCheckIcon",
    Icon: CircleCheckIcon,
    width: 18,
    height: 18,
    use: { size: 18, where: "plan card (site)" },
  },
  { name: "CircleChevronDownIcon", Icon: CircleChevronDownIcon, width: 24, height: 24 },
  { name: "CircleChevronLeftIcon", Icon: CircleChevronLeftIcon, width: 24, height: 24 },
  { name: "CircleChevronRightIcon", Icon: CircleChevronRightIcon, width: 24, height: 24 },
  { name: "CircleChevronUpIcon", Icon: CircleChevronUpIcon, width: 24, height: 24 },
  { name: "CircleDollarIcon", Icon: CircleDollarIcon, width: 24, height: 24 },
  { name: "CircleDotIcon", Icon: CircleDotIcon, width: 24, height: 24 },
  { name: "CircleDownIcon", Icon: CircleDownIcon, width: 24, height: 24 },
  { name: "CircleEllipsisIcon", Icon: CircleEllipsisIcon, width: 24, height: 24 },
  { name: "CircleExclamationCheckIcon", Icon: CircleExclamationCheckIcon, width: 24, height: 24 },
  { name: "CircleExclamationIcon", Icon: CircleExclamationIcon, width: 24, height: 24 },
  { name: "CircleHalfIcon", Icon: CircleHalfIcon, width: 24, height: 24 },
  { name: "CircleHalfStrokeIcon", Icon: CircleHalfStrokeIcon, width: 24, height: 24 },
  { name: "CircleIcon", Icon: CircleIcon, width: 24, height: 24 },
  {
    name: "CircleInfoIcon",
    Icon: CircleInfoIcon,
    width: 24,
    height: 24,
    use: { size: 22, where: "info tip", variant: "classic-light" },
  },
  { name: "CircleLeftIcon", Icon: CircleLeftIcon, width: 24, height: 24 },
  { name: "CircleMinusIcon", Icon: CircleMinusIcon, width: 24, height: 24 },
  { name: "CircleNotchIcon", Icon: CircleNotchIcon, width: 24, height: 24 },
  { name: "CirclePauseIcon", Icon: CirclePauseIcon, width: 24, height: 24 },
  { name: "CirclePlayIcon", Icon: CirclePlayIcon, width: 24, height: 24 },
  { name: "CirclePlusIcon", Icon: CirclePlusIcon, width: 24, height: 24 },
  { name: "CircleQuestionIcon", Icon: CircleQuestionIcon, width: 24, height: 24 },
  { name: "CircleRightIcon", Icon: CircleRightIcon, width: 24, height: 24 },
  { name: "CircleStarIcon", Icon: CircleStarIcon, width: 24, height: 24 },
  { name: "CircleStopIcon", Icon: CircleStopIcon, width: 24, height: 24 },
  { name: "CircleUpIcon", Icon: CircleUpIcon, width: 24, height: 24 },
  { name: "CircleUserIcon", Icon: CircleUserIcon, width: 24, height: 24 },
  { name: "CircleVideoIcon", Icon: CircleVideoIcon, width: 24, height: 24 },
  { name: "CircleXmarkIcon", Icon: CircleXmarkIcon, width: 24, height: 24 },
  { name: "ClapperboardIcon", Icon: ClapperboardIcon, width: 24, height: 24 },
  { name: "ClapperboardPlayIcon", Icon: ClapperboardPlayIcon, width: 24, height: 24 },
  { name: "ClipboardCheckIcon", Icon: ClipboardCheckIcon, width: 24, height: 24 },
  { name: "ClipboardIcon", Icon: ClipboardIcon, width: 24, height: 24, use: { size: 20, where: "move menu" } },
  { name: "ClipboardListCheckIcon", Icon: ClipboardListCheckIcon, width: 24, height: 24 },
  { name: "ClipboardListIcon", Icon: ClipboardListIcon, width: 24, height: 24 },
  { name: "ClipboardQuestionIcon", Icon: ClipboardQuestionIcon, width: 24, height: 24 },
  { name: "ClipboardUserIcon", Icon: ClipboardUserIcon, width: 24, height: 24 },
  { name: "ClockDeskIcon", Icon: ClockDeskIcon, width: 24, height: 24 },
  { name: "ClockIcon", Icon: ClockIcon, width: 24, height: 24 },
  { name: "ClockRotateLeftIcon", Icon: ClockRotateLeftIcon, width: 24, height: 24 },
  { name: "CloneIcon", Icon: CloneIcon, width: 24, height: 24 },
  { name: "ClosedCaptioningIcon", Icon: ClosedCaptioningIcon, width: 24, height: 24 },
  { name: "CloudArrowDownIcon", Icon: CloudArrowDownIcon, width: 24, height: 24 },
  { name: "CloudArrowUpIcon", Icon: CloudArrowUpIcon, width: 24, height: 24 },
  { name: "CloudBoltIcon", Icon: CloudBoltIcon, width: 24, height: 24 },
  { name: "CloudIcon", Icon: CloudIcon, width: 24, height: 24 },
  { name: "CloudRainIcon", Icon: CloudRainIcon, width: 24, height: 24 },
  { name: "CloudSunIcon", Icon: CloudSunIcon, width: 24, height: 24 },
  { name: "CodeBranchIcon", Icon: CodeBranchIcon, width: 24, height: 24 },
  { name: "CodeCompareIcon", Icon: CodeCompareIcon, width: 24, height: 24 },
  { name: "CodeForkIcon", Icon: CodeForkIcon, width: 24, height: 24 },
  { name: "CodeIcon", Icon: CodeIcon, width: 24, height: 24 },
  { name: "CodeMergeIcon", Icon: CodeMergeIcon, width: 24, height: 24 },
  { name: "CoinIcon", Icon: CoinIcon, width: 24, height: 24 },
  { name: "CoinsIcon", Icon: CoinsIcon, width: 24, height: 24 },
  { name: "Columns3Icon", Icon: Columns3Icon, width: 24, height: 24 },
  { name: "CommentCheckIcon", Icon: CommentCheckIcon, width: 24, height: 24 },
  { name: "CommentDotsIcon", Icon: CommentDotsIcon, width: 24, height: 24 },
  { name: "CommentIcon", Icon: CommentIcon, width: 24, height: 24, use: { size: 20, where: "move menu" } },
  { name: "CommentPenIcon", Icon: CommentPenIcon, width: 24, height: 24 },
  { name: "CommentPlusIcon", Icon: CommentPlusIcon, width: 24, height: 24 },
  { name: "CommentQuestionIcon", Icon: CommentQuestionIcon, width: 24, height: 24 },
  { name: "CommentsIcon", Icon: CommentsIcon, width: 24, height: 24 },
  { name: "CommentSmsIcon", Icon: CommentSmsIcon, width: 24, height: 24 },
  { name: "CommentsQuestionIcon", Icon: CommentsQuestionIcon, width: 24, height: 24 },
  { name: "CommentXmarkIcon", Icon: CommentXmarkIcon, width: 24, height: 24 },
  { name: "CompassIcon", Icon: CompassIcon, width: 24, height: 24 },
  { name: "CompressIcon", Icon: CompressIcon, width: 24, height: 24 },
  { name: "ComputerIcon", Icon: ComputerIcon, width: 24, height: 24 },
  { name: "ComputerMouseIcon", Icon: ComputerMouseIcon, width: 24, height: 24 },
  { name: "CopyIcon", Icon: CopyIcon, width: 24, height: 24 },
  { name: "CreditCardFrontIcon", Icon: CreditCardFrontIcon, width: 24, height: 24 },
  { name: "CreditCardIcon", Icon: CreditCardIcon, width: 24, height: 24 },
  { name: "CrosshairsIcon", Icon: CrosshairsIcon, width: 24, height: 24 },
  { name: "CrownIcon", Icon: CrownIcon, width: 24, height: 24 },
  { name: "CubeIcon", Icon: CubeIcon, width: 24, height: 24 },
  { name: "CubesIcon", Icon: CubesIcon, width: 24, height: 24 },
  { name: "DatabaseIcon", Icon: DatabaseIcon, width: 24, height: 24 },
  { name: "DeleteLeftIcon", Icon: DeleteLeftIcon, width: 24, height: 24 },
  { name: "DesktopArrowDownIcon", Icon: DesktopArrowDownIcon, width: 24, height: 24 },
  { name: "DesktopIcon", Icon: DesktopIcon, width: 24, height: 24 },
  { name: "DiagramNestedIcon", Icon: DiagramNestedIcon, width: 24, height: 24 },
  { name: "DiagramNextIcon", Icon: DiagramNextIcon, width: 24, height: 24 },
  { name: "DiagramPreviousIcon", Icon: DiagramPreviousIcon, width: 24, height: 24 },
  { name: "DiagramProjectIcon", Icon: DiagramProjectIcon, width: 24, height: 24 },
  { name: "DiagramSubtaskIcon", Icon: DiagramSubtaskIcon, width: 24, height: 24 },
  { name: "DiceFiveIcon", Icon: DiceFiveIcon, width: 24, height: 24 },
  { name: "DiceIcon", Icon: DiceIcon, width: 24, height: 24 },
  { name: "DiplomaIcon", Icon: DiplomaIcon, width: 24, height: 24 },
  { name: "DisplayIcon", Icon: DisplayIcon, width: 24, height: 24 },
  { name: "DisplaySlashIcon", Icon: DisplaySlashIcon, width: 24, height: 24 },
  { name: "DollarSignIcon", Icon: DollarSignIcon, width: 24, height: 24 },
  { name: "DoorClosedIcon", Icon: DoorClosedIcon, width: 24, height: 24 },
  { name: "DoorOpenIcon", Icon: DoorOpenIcon, width: 24, height: 24 },
  { name: "DownLeftAndUpRightToCenterIcon", Icon: DownLeftAndUpRightToCenterIcon, width: 24, height: 24 },
  { name: "DownloadIcon", Icon: DownloadIcon, width: 24, height: 24 },
  { name: "DropletIcon", Icon: DropletIcon, width: 24, height: 24 },
  { name: "DumbbellIcon", Icon: DumbbellIcon, width: 24, height: 24 },
  { name: "EarListenIcon", Icon: EarListenIcon, width: 24, height: 24 },
  { name: "EarthAmericasIcon", Icon: EarthAmericasIcon, width: 24, height: 24 },
  {
    name: "EllipsisIcon",
    Icon: EllipsisIcon,
    width: 16,
    height: 4,
    use: { size: 4, where: "syllabus rows", variant: "duotone-solid" },
  },
  { name: "EllipsisVerticalIcon", Icon: EllipsisVerticalIcon, width: 24, height: 24 },
  { name: "EnvelopeCircleCheckIcon", Icon: EnvelopeCircleCheckIcon, width: 24, height: 24 },
  { name: "EnvelopeIcon", Icon: EnvelopeIcon, width: 24, height: 24 },
  { name: "EnvelopeOpenIcon", Icon: EnvelopeOpenIcon, width: 24, height: 24 },
  { name: "EnvelopeOpenTextIcon", Icon: EnvelopeOpenTextIcon, width: 24, height: 24 },
  { name: "EnvelopesIcon", Icon: EnvelopesIcon, width: 24, height: 24 },
  { name: "EqualsIcon", Icon: EqualsIcon, width: 24, height: 24 },
  { name: "EraserIcon", Icon: EraserIcon, width: 24, height: 24 },
  { name: "ExclamationIcon", Icon: ExclamationIcon, width: 24, height: 24 },
  { name: "ExpandIcon", Icon: ExpandIcon, width: 24, height: 24, use: { size: 18, where: "game viewer" } },
  { name: "EyeClosedIcon", Icon: EyeClosedIcon, width: 24, height: 24 },
  { name: "EyeDropperIcon", Icon: EyeDropperIcon, width: 24, height: 24 },
  { name: "EyeIcon", Icon: EyeIcon, width: 24, height: 24 },
  { name: "EyeLowVisionIcon", Icon: EyeLowVisionIcon, width: 24, height: 24 },
  { name: "EyeSlashIcon", Icon: EyeSlashIcon, width: 24, height: 24 },
  { name: "FaceConfusedIcon", Icon: FaceConfusedIcon, width: 24, height: 24 },
  { name: "FaceFrownIcon", Icon: FaceFrownIcon, width: 24, height: 24 },
  { name: "FaceFrownSlightIcon", Icon: FaceFrownSlightIcon, width: 24, height: 24 },
  { name: "FaceGrinIcon", Icon: FaceGrinIcon, width: 24, height: 24 },
  { name: "FaceGrinStarsIcon", Icon: FaceGrinStarsIcon, width: 24, height: 24 },
  { name: "FaceHandOverMouthIcon", Icon: FaceHandOverMouthIcon, width: 24, height: 24 },
  { name: "FaceLaughIcon", Icon: FaceLaughIcon, width: 24, height: 24 },
  { name: "FaceMehBlankIcon", Icon: FaceMehBlankIcon, width: 24, height: 24 },
  { name: "FaceMehIcon", Icon: FaceMehIcon, width: 24, height: 24 },
  { name: "FaceMonocleIcon", Icon: FaceMonocleIcon, width: 24, height: 24 },
  { name: "FacePartyIcon", Icon: FacePartyIcon, width: 24, height: 24 },
  { name: "FaceRaisedEyebrowIcon", Icon: FaceRaisedEyebrowIcon, width: 24, height: 24 },
  { name: "FaceSadTearIcon", Icon: FaceSadTearIcon, width: 24, height: 24 },
  { name: "FaceSalutingIcon", Icon: FaceSalutingIcon, width: 24, height: 24 },
  { name: "FaceSmileBeamIcon", Icon: FaceSmileBeamIcon, width: 24, height: 24 },
  { name: "FaceSmileIcon", Icon: FaceSmileIcon, width: 24, height: 24 },
  { name: "FaceSmileWinkIcon", Icon: FaceSmileWinkIcon, width: 24, height: 24 },
  { name: "FaceSurpriseIcon", Icon: FaceSurpriseIcon, width: 24, height: 24 },
  { name: "FaceThinkingIcon", Icon: FaceThinkingIcon, width: 24, height: 24 },
  { name: "FileArrowDownIcon", Icon: FileArrowDownIcon, width: 24, height: 24 },
  { name: "FileArrowUpIcon", Icon: FileArrowUpIcon, width: 24, height: 24 },
  { name: "FileCertificateIcon", Icon: FileCertificateIcon, width: 24, height: 24 },
  { name: "FileCheckIcon", Icon: FileCheckIcon, width: 24, height: 24 },
  { name: "FileCircleCheckIcon", Icon: FileCircleCheckIcon, width: 24, height: 24 },
  { name: "FileCircleExclamationIcon", Icon: FileCircleExclamationIcon, width: 24, height: 24 },
  { name: "FileCirclePlusIcon", Icon: FileCirclePlusIcon, width: 24, height: 24 },
  { name: "FileCircleQuestionIcon", Icon: FileCircleQuestionIcon, width: 24, height: 24 },
  { name: "FileCsvIcon", Icon: FileCsvIcon, width: 24, height: 24 },
  { name: "FileExportIcon", Icon: FileExportIcon, width: 24, height: 24 },
  { name: "FileIcon", Icon: FileIcon, width: 24, height: 24 },
  { name: "FileImageIcon", Icon: FileImageIcon, width: 24, height: 24 },
  { name: "FileImportIcon", Icon: FileImportIcon, width: 24, height: 24 },
  { name: "FileInvoiceDollarIcon", Icon: FileInvoiceDollarIcon, width: 24, height: 24 },
  { name: "FileInvoiceIcon", Icon: FileInvoiceIcon, width: 24, height: 24 },
  { name: "FileLinesIcon", Icon: FileLinesIcon, width: 24, height: 24 },
  { name: "FileMagnifyingGlassIcon", Icon: FileMagnifyingGlassIcon, width: 24, height: 24 },
  { name: "FileMinusIcon", Icon: FileMinusIcon, width: 24, height: 24 },
  { name: "FilePdfIcon", Icon: FilePdfIcon, width: 24, height: 24 },
  { name: "FilePenIcon", Icon: FilePenIcon, width: 24, height: 24 },
  { name: "FilePlusIcon", Icon: FilePlusIcon, width: 24, height: 24 },
  { name: "FilesIcon", Icon: FilesIcon, width: 24, height: 24 },
  { name: "FileVideoIcon", Icon: FileVideoIcon, width: 24, height: 24 },
  { name: "FileXmarkIcon", Icon: FileXmarkIcon, width: 24, height: 24 },
  { name: "FilmIcon", Icon: FilmIcon, width: 24, height: 24 },
  { name: "FilmSlashIcon", Icon: FilmSlashIcon, width: 24, height: 24 },
  { name: "FilterCircleXmarkIcon", Icon: FilterCircleXmarkIcon, width: 24, height: 24 },
  { name: "FilterIcon", Icon: FilterIcon, width: 24, height: 24 },
  { name: "FilterListIcon", Icon: FilterListIcon, width: 24, height: 24 },
  { name: "FilterSlashIcon", Icon: FilterSlashIcon, width: 24, height: 24 },
  { name: "FingerprintIcon", Icon: FingerprintIcon, width: 24, height: 24 },
  { name: "FireFlameCurvedIcon", Icon: FireFlameCurvedIcon, width: 24, height: 24 },
  { name: "FireFlameSimpleIcon", Icon: FireFlameSimpleIcon, width: 24, height: 24 },
  {
    name: "FireIcon",
    Icon: FireIcon,
    width: 32,
    height: 32,
    use: { size: 22, where: "user menu, streak", variant: "duotone-solid" },
  },
  { name: "FlagCheckeredIcon", Icon: FlagCheckeredIcon, width: 24, height: 24 },
  { name: "FlagIcon", Icon: FlagIcon, width: 24, height: 24 },
  { name: "FlagPennantIcon", Icon: FlagPennantIcon, width: 24, height: 24 },
  { name: "FlagSwallowtailIcon", Icon: FlagSwallowtailIcon, width: 24, height: 24 },
  { name: "FlaskIcon", Icon: FlaskIcon, width: 24, height: 24 },
  { name: "FloppyDiskIcon", Icon: FloppyDiskIcon, width: 24, height: 24 },
  { name: "FolderArrowDownIcon", Icon: FolderArrowDownIcon, width: 24, height: 24 },
  { name: "FolderArrowUpIcon", Icon: FolderArrowUpIcon, width: 24, height: 24 },
  { name: "FolderCheckIcon", Icon: FolderCheckIcon, width: 24, height: 24 },
  { name: "FolderIcon", Icon: FolderIcon, width: 24, height: 24 },
  { name: "FolderMagnifyingGlassIcon", Icon: FolderMagnifyingGlassIcon, width: 24, height: 24 },
  { name: "FolderMinusIcon", Icon: FolderMinusIcon, width: 24, height: 24 },
  { name: "FolderOpenIcon", Icon: FolderOpenIcon, width: 24, height: 24 },
  { name: "FolderPlusIcon", Icon: FolderPlusIcon, width: 24, height: 24 },
  { name: "FoldersIcon", Icon: FoldersIcon, width: 24, height: 24 },
  { name: "FolderTreeIcon", Icon: FolderTreeIcon, width: 24, height: 24 },
  { name: "FolderUserIcon", Icon: FolderUserIcon, width: 24, height: 24 },
  { name: "FolderXmarkIcon", Icon: FolderXmarkIcon, width: 24, height: 24 },
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
  { name: "GalleryThumbnailsIcon", Icon: GalleryThumbnailsIcon, width: 24, height: 24 },
  { name: "GameBoardIcon", Icon: GameBoardIcon, width: 24, height: 24 },
  { name: "GameBoardSimpleIcon", Icon: GameBoardSimpleIcon, width: 24, height: 24 },
  { name: "GamepadIcon", Icon: GamepadIcon, width: 24, height: 24 },
  { name: "GaugeHighIcon", Icon: GaugeHighIcon, width: 24, height: 24 },
  { name: "GaugeIcon", Icon: GaugeIcon, width: 24, height: 24 },
  {
    name: "GearIcon",
    Icon: GearIcon,
    width: 24,
    height: 24,
    use: { size: 18, where: "game settings", variant: "duotone-solid" },
  },
  { name: "GearsIcon", Icon: GearsIcon, width: 24, height: 24 },
  { name: "GemIcon", Icon: GemIcon, width: 24, height: 24 },
  { name: "GiftCardIcon", Icon: GiftCardIcon, width: 24, height: 24 },
  { name: "GiftIcon", Icon: GiftIcon, width: 24, height: 24 },
  { name: "GiftsIcon", Icon: GiftsIcon, width: 24, height: 24 },
  { name: "GlassesIcon", Icon: GlassesIcon, width: 24, height: 24 },
  { name: "GlobeIcon", Icon: GlobeIcon, width: 24, height: 24 },
  { name: "GraduationCapIcon", Icon: GraduationCapIcon, width: 24, height: 24 },
  { name: "Grid2Icon", Icon: Grid2Icon, width: 24, height: 24 },
  { name: "GridIcon", Icon: GridIcon, width: 24, height: 24 },
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
  { name: "GripVerticalIcon", Icon: GripVerticalIcon, width: 24, height: 24 },
  { name: "H1Icon", Icon: H1Icon, width: 24, height: 24 },
  { name: "H2Icon", Icon: H2Icon, width: 24, height: 24 },
  { name: "H3Icon", Icon: H3Icon, width: 24, height: 24 },
  { name: "HammerIcon", Icon: HammerIcon, width: 24, height: 24 },
  { name: "HandBackFistIcon", Icon: HandBackFistIcon, width: 24, height: 24 },
  { name: "HandHeartIcon", Icon: HandHeartIcon, width: 24, height: 24 },
  { name: "HandHoldingDollarIcon", Icon: HandHoldingDollarIcon, width: 24, height: 24 },
  { name: "HandHoldingHeartIcon", Icon: HandHoldingHeartIcon, width: 24, height: 24 },
  { name: "HandIcon", Icon: HandIcon, width: 24, height: 24 },
  { name: "HandPeaceIcon", Icon: HandPeaceIcon, width: 24, height: 24 },
  { name: "HandPointerIcon", Icon: HandPointerIcon, width: 24, height: 24 },
  { name: "HandPointRightIcon", Icon: HandPointRightIcon, width: 24, height: 24 },
  { name: "HandPointUpIcon", Icon: HandPointUpIcon, width: 24, height: 24 },
  { name: "HandsClappingIcon", Icon: HandsClappingIcon, width: 24, height: 24 },
  { name: "HandshakeIcon", Icon: HandshakeIcon, width: 24, height: 24 },
  { name: "HandshakeSimpleIcon", Icon: HandshakeSimpleIcon, width: 24, height: 24 },
  { name: "HandsHoldingHeartIcon", Icon: HandsHoldingHeartIcon, width: 24, height: 24 },
  { name: "HandsHoldingIcon", Icon: HandsHoldingIcon, width: 24, height: 24 },
  { name: "HandSparklesIcon", Icon: HandSparklesIcon, width: 24, height: 24 },
  { name: "HandWaveIcon", Icon: HandWaveIcon, width: 24, height: 24 },
  { name: "HardDriveIcon", Icon: HardDriveIcon, width: 24, height: 24 },
  { name: "HashtagIcon", Icon: HashtagIcon, width: 24, height: 24 },
  { name: "HatWizardIcon", Icon: HatWizardIcon, width: 24, height: 24 },
  { name: "HeadingIcon", Icon: HeadingIcon, width: 24, height: 24 },
  { name: "HeadphonesIcon", Icon: HeadphonesIcon, width: 24, height: 24 },
  { name: "HeadsetIcon", Icon: HeadsetIcon, width: 24, height: 24 },
  { name: "HeadSideBrainIcon", Icon: HeadSideBrainIcon, width: 24, height: 24 },
  { name: "HeadSideGearIcon", Icon: HeadSideGearIcon, width: 24, height: 24 },
  { name: "HeartCircleCheckIcon", Icon: HeartCircleCheckIcon, width: 24, height: 24 },
  { name: "HeartCrackIcon", Icon: HeartCrackIcon, width: 24, height: 24 },
  { name: "HeartHalfStrokeIcon", Icon: HeartHalfStrokeIcon, width: 24, height: 24 },
  {
    name: "HeartIcon",
    Icon: HeartIcon,
    width: 14,
    height: 14,
    use: { size: 14, where: "reviews (site)", variant: "duotone-solid" },
  },
  { name: "HeartSlashIcon", Icon: HeartSlashIcon, width: 24, height: 24 },
  { name: "HelmetBattleIcon", Icon: HelmetBattleIcon, width: 24, height: 24 },
  { name: "HighlighterIcon", Icon: HighlighterIcon, width: 24, height: 24 },
  { name: "HighlighterLineIcon", Icon: HighlighterLineIcon, width: 24, height: 24 },
  { name: "HorizontalRuleIcon", Icon: HorizontalRuleIcon, width: 24, height: 24 },
  { name: "HorseHeadIcon", Icon: HorseHeadIcon, width: 24, height: 24 },
  { name: "HourglassClockIcon", Icon: HourglassClockIcon, width: 24, height: 24 },
  { name: "HourglassEndIcon", Icon: HourglassEndIcon, width: 24, height: 24 },
  { name: "HourglassHalfIcon", Icon: HourglassHalfIcon, width: 24, height: 24 },
  { name: "HourglassIcon", Icon: HourglassIcon, width: 24, height: 24 },
  { name: "HourglassStartIcon", Icon: HourglassStartIcon, width: 24, height: 24 },
  { name: "HouseChimneyIcon", Icon: HouseChimneyIcon, width: 24, height: 24 },
  { name: "HouseChimneyUserIcon", Icon: HouseChimneyUserIcon, width: 24, height: 24 },
  { name: "HouseIcon", Icon: HouseIcon, width: 24, height: 24, use: { size: 28, where: "mobile clock (site)" } },
  { name: "HouseLaptopIcon", Icon: HouseLaptopIcon, width: 24, height: 24 },
  { name: "HouseUserIcon", Icon: HouseUserIcon, width: 24, height: 24 },
  { name: "HundredPointsIcon", Icon: HundredPointsIcon, width: 24, height: 24 },
  { name: "IdBadgeIcon", Icon: IdBadgeIcon, width: 24, height: 24 },
  { name: "IdCardIcon", Icon: IdCardIcon, width: 24, height: 24 },
  { name: "ImageIcon", Icon: ImageIcon, width: 24, height: 24, use: { size: 28, where: "image upload" } },
  { name: "ImageLandscapeIcon", Icon: ImageLandscapeIcon, width: 24, height: 24 },
  { name: "ImagePolaroidIcon", Icon: ImagePolaroidIcon, width: 24, height: 24 },
  { name: "ImagesIcon", Icon: ImagesIcon, width: 24, height: 24 },
  { name: "ImageSlashIcon", Icon: ImageSlashIcon, width: 24, height: 24 },
  { name: "InboxFullIcon", Icon: InboxFullIcon, width: 24, height: 24 },
  { name: "InboxIcon", Icon: InboxIcon, width: 24, height: 24 },
  { name: "InboxInIcon", Icon: InboxInIcon, width: 24, height: 24 },
  { name: "InboxOutIcon", Icon: InboxOutIcon, width: 24, height: 24 },
  { name: "IndentIcon", Icon: IndentIcon, width: 24, height: 24 },
  { name: "InfinityIcon", Icon: InfinityIcon, width: 24, height: 24 },
  { name: "InfoIcon", Icon: InfoIcon, width: 24, height: 24 },
  { name: "InputNumericIcon", Icon: InputNumericIcon, width: 24, height: 24 },
  { name: "InputPasswordIcon", Icon: InputPasswordIcon, width: 24, height: 24 },
  { name: "InputTextIcon", Icon: InputTextIcon, width: 24, height: 24 },
  { name: "ItalicIcon", Icon: ItalicIcon, width: 24, height: 24 },
  { name: "KeyboardBrightnessIcon", Icon: KeyboardBrightnessIcon, width: 24, height: 24 },
  { name: "KeyboardIcon", Icon: KeyboardIcon, width: 24, height: 24 },
  { name: "KeyIcon", Icon: KeyIcon, width: 24, height: 24 },
  { name: "LandmarkIcon", Icon: LandmarkIcon, width: 24, height: 24 },
  { name: "LanguageIcon", Icon: LanguageIcon, width: 24, height: 24 },
  { name: "LaptopCodeIcon", Icon: LaptopCodeIcon, width: 24, height: 24 },
  { name: "LaptopIcon", Icon: LaptopIcon, width: 24, height: 24 },
  { name: "LaptopMobileIcon", Icon: LaptopMobileIcon, width: 24, height: 24 },
  { name: "LayerGroupIcon", Icon: LayerGroupIcon, width: 24, height: 24 },
  { name: "LeafIcon", Icon: LeafIcon, width: 24, height: 24 },
  { name: "LeftRightIcon", Icon: LeftRightIcon, width: 24, height: 24 },
  { name: "LightbulbExclamationIcon", Icon: LightbulbExclamationIcon, width: 24, height: 24 },
  { name: "LightbulbGearIcon", Icon: LightbulbGearIcon, width: 24, height: 24 },
  { name: "LightbulbIcon", Icon: LightbulbIcon, width: 24, height: 24 },
  { name: "LightbulbOnIcon", Icon: LightbulbOnIcon, width: 24, height: 24 },
  { name: "LightbulbSlashIcon", Icon: LightbulbSlashIcon, width: 24, height: 24 },
  { name: "LineHeightIcon", Icon: LineHeightIcon, width: 24, height: 24 },
  { name: "LinkBrokenIcon", Icon: LinkBrokenIcon, width: 24, height: 24 },
  { name: "LinkIcon", Icon: LinkIcon, width: 24, height: 24 },
  { name: "LinkSimpleSlashIcon", Icon: LinkSimpleSlashIcon, width: 24, height: 24 },
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
  { name: "LockKeyholeIcon", Icon: LockKeyholeIcon, width: 24, height: 24 },
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
  { name: "MagnifyingGlassArrowRightIcon", Icon: MagnifyingGlassArrowRightIcon, width: 24, height: 24 },
  { name: "MagnifyingGlassChartIcon", Icon: MagnifyingGlassChartIcon, width: 24, height: 24 },
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
  { name: "MasksTheaterIcon", Icon: MasksTheaterIcon, width: 24, height: 24 },
  { name: "MaximizeIcon", Icon: MaximizeIcon, width: 24, height: 24 },
  { name: "MedalIcon", Icon: MedalIcon, width: 24, height: 24 },
  { name: "MegaphoneIcon", Icon: MegaphoneIcon, width: 24, height: 24 },
  { name: "MemoCircleCheckIcon", Icon: MemoCircleCheckIcon, width: 24, height: 24 },
  { name: "MemoIcon", Icon: MemoIcon, width: 24, height: 24 },
  { name: "MessageBotIcon", Icon: MessageBotIcon, width: 24, height: 24 },
  { name: "MessageCheckIcon", Icon: MessageCheckIcon, width: 24, height: 24 },
  { name: "MessageDotsIcon", Icon: MessageDotsIcon, width: 24, height: 24 },
  { name: "MessageIcon", Icon: MessageIcon, width: 24, height: 24 },
  { name: "MessageLinesIcon", Icon: MessageLinesIcon, width: 24, height: 24 },
  { name: "MessagePenIcon", Icon: MessagePenIcon, width: 24, height: 24 },
  { name: "MessagePlusIcon", Icon: MessagePlusIcon, width: 24, height: 24 },
  { name: "MessageQuestionIcon", Icon: MessageQuestionIcon, width: 24, height: 24 },
  { name: "MessageQuoteIcon", Icon: MessageQuoteIcon, width: 24, height: 24 },
  { name: "MessagesIcon", Icon: MessagesIcon, width: 24, height: 24 },
  { name: "MessageSlashIcon", Icon: MessageSlashIcon, width: 24, height: 24 },
  { name: "MessageTextIcon", Icon: MessageTextIcon, width: 24, height: 24 },
  { name: "MeteorIcon", Icon: MeteorIcon, width: 24, height: 24 },
  { name: "MicrochipAiIcon", Icon: MicrochipAiIcon, width: 24, height: 24 },
  { name: "MicrochipIcon", Icon: MicrochipIcon, width: 24, height: 24 },
  { name: "MicrophoneIcon", Icon: MicrophoneIcon, width: 24, height: 24 },
  { name: "MicrophoneLinesIcon", Icon: MicrophoneLinesIcon, width: 24, height: 24 },
  { name: "MicrophoneLinesSlashIcon", Icon: MicrophoneLinesSlashIcon, width: 24, height: 24 },
  { name: "MicrophoneSlashIcon", Icon: MicrophoneSlashIcon, width: 24, height: 24 },
  { name: "MicroscopeIcon", Icon: MicroscopeIcon, width: 24, height: 24 },
  { name: "MinimizeIcon", Icon: MinimizeIcon, width: 24, height: 24 },
  { name: "MinusIcon", Icon: MinusIcon, width: 24, height: 24 },
  { name: "MobileIcon", Icon: MobileIcon, width: 24, height: 24 },
  { name: "MobileRotateIcon", Icon: MobileRotateIcon, width: 24, height: 24 },
  { name: "MobileScreenIcon", Icon: MobileScreenIcon, width: 24, height: 24 },
  { name: "MobileSlashIcon", Icon: MobileSlashIcon, width: 24, height: 24 },
  { name: "MoneyBillIcon", Icon: MoneyBillIcon, width: 24, height: 24 },
  { name: "MoneyBillsIcon", Icon: MoneyBillsIcon, width: 24, height: 24 },
  { name: "MoneyBillWaveIcon", Icon: MoneyBillWaveIcon, width: 24, height: 24 },
  { name: "MoneyCheckIcon", Icon: MoneyCheckIcon, width: 24, height: 24 },
  { name: "MoonIcon", Icon: MoonIcon, width: 24, height: 24, use: { size: 19, where: "user menu" } },
  { name: "MoonStarsIcon", Icon: MoonStarsIcon, width: 24, height: 24 },
  { name: "MountainIcon", Icon: MountainIcon, width: 24, height: 24 },
  { name: "MusicIcon", Icon: MusicIcon, width: 24, height: 24 },
  { name: "NewspaperIcon", Icon: NewspaperIcon, width: 24, height: 24 },
  { name: "NotebookIcon", Icon: NotebookIcon, width: 24, height: 24 },
  { name: "NotEqualIcon", Icon: NotEqualIcon, width: 24, height: 24 },
  { name: "NotesIcon", Icon: NotesIcon, width: 24, height: 24 },
  { name: "NoteStickyIcon", Icon: NoteStickyIcon, width: 24, height: 24 },
  { name: "ObjectsColumnIcon", Icon: ObjectsColumnIcon, width: 24, height: 24 },
  { name: "OctagonExclamationIcon", Icon: OctagonExclamationIcon, width: 24, height: 24 },
  { name: "OutdentIcon", Icon: OutdentIcon, width: 24, height: 24 },
  { name: "PaintbrushIcon", Icon: PaintbrushIcon, width: 24, height: 24 },
  { name: "PaletteIcon", Icon: PaletteIcon, width: 24, height: 24 },
  { name: "PaperclipIcon", Icon: PaperclipIcon, width: 24, height: 24 },
  { name: "PaperPlaneIcon", Icon: PaperPlaneIcon, width: 24, height: 24 },
  { name: "PaperPlaneTopIcon", Icon: PaperPlaneTopIcon, width: 24, height: 24 },
  { name: "ParagraphIcon", Icon: ParagraphIcon, width: 24, height: 24 },
  { name: "PartyHornIcon", Icon: PartyHornIcon, width: 24, height: 24 },
  { name: "PasteIcon", Icon: PasteIcon, width: 24, height: 24 },
  {
    name: "PauseIcon",
    Icon: PauseIcon,
    width: 19,
    height: 22,
    use: { size: 22, where: "board tools", variant: "duotone-solid" },
  },
  { name: "PencilIcon", Icon: PencilIcon, width: 24, height: 24 },
  { name: "PencilLineIcon", Icon: PencilLineIcon, width: 24, height: 24 },
  { name: "PenClipIcon", Icon: PenClipIcon, width: 24, height: 24 },
  { name: "PenIcon", Icon: PenIcon, width: 24, height: 24 },
  { name: "PenLineIcon", Icon: PenLineIcon, width: 24, height: 24 },
  { name: "PenNibIcon", Icon: PenNibIcon, width: 24, height: 24 },
  { name: "PenRulerIcon", Icon: PenRulerIcon, width: 24, height: 24 },
  { name: "PenToSquareIcon", Icon: PenToSquareIcon, width: 24, height: 24 },
  { name: "PeopleArrowsIcon", Icon: PeopleArrowsIcon, width: 24, height: 24 },
  { name: "PeopleGroupIcon", Icon: PeopleGroupIcon, width: 24, height: 24 },
  { name: "PeopleIcon", Icon: PeopleIcon, width: 24, height: 24 },
  { name: "PercentIcon", Icon: PercentIcon, width: 24, height: 24 },
  { name: "PersonChalkboardIcon", Icon: PersonChalkboardIcon, width: 24, height: 24 },
  { name: "PersonCircleCheckIcon", Icon: PersonCircleCheckIcon, width: 24, height: 24 },
  { name: "PersonCircleQuestionIcon", Icon: PersonCircleQuestionIcon, width: 24, height: 24 },
  { name: "PersonIcon", Icon: PersonIcon, width: 24, height: 24 },
  { name: "PersonRunningIcon", Icon: PersonRunningIcon, width: 24, height: 24 },
  { name: "PersonWalkingIcon", Icon: PersonWalkingIcon, width: 24, height: 24 },
  { name: "PersonWavingIcon", Icon: PersonWavingIcon, width: 24, height: 24 },
  { name: "PesoSignIcon", Icon: PesoSignIcon, width: 24, height: 24 },
  { name: "PhoneIcon", Icon: PhoneIcon, width: 24, height: 24 },
  { name: "PhoneSlashIcon", Icon: PhoneSlashIcon, width: 24, height: 24 },
  { name: "PhoneVolumeIcon", Icon: PhoneVolumeIcon, width: 24, height: 24 },
  { name: "PhotoFilmIcon", Icon: PhotoFilmIcon, width: 24, height: 24 },
  { name: "PictureInPictureIcon", Icon: PictureInPictureIcon, width: 24, height: 24 },
  { name: "PiggyBankIcon", Icon: PiggyBankIcon, width: 24, height: 24 },
  { name: "PlaneIcon", Icon: PlaneIcon, width: 24, height: 24 },
  {
    name: "PlayIcon",
    Icon: PlayIcon,
    width: 19,
    height: 22,
    use: { size: 22, where: "board tools", variant: "duotone-solid" },
  },
  { name: "PlayPauseIcon", Icon: PlayPauseIcon, width: 24, height: 24 },
  { name: "PlugIcon", Icon: PlugIcon, width: 24, height: 24 },
  { name: "PlusIcon", Icon: PlusIcon, width: 16, height: 16, use: { size: 16, where: "FAQ (site)" } },
  { name: "PlusLargeIcon", Icon: PlusLargeIcon, width: 24, height: 24 },
  { name: "PlusMinusIcon", Icon: PlusMinusIcon, width: 24, height: 24 },
  { name: "PodcastIcon", Icon: PodcastIcon, width: 24, height: 24 },
  { name: "PodiumIcon", Icon: PodiumIcon, width: 24, height: 24 },
  { name: "PodiumStarIcon", Icon: PodiumStarIcon, width: 24, height: 24 },
  { name: "PresentationScreenIcon", Icon: PresentationScreenIcon, width: 24, height: 24 },
  { name: "PrintIcon", Icon: PrintIcon, width: 24, height: 24 },
  { name: "PuzzleIcon", Icon: PuzzleIcon, width: 24, height: 24 },
  { name: "PuzzlePieceIcon", Icon: PuzzlePieceIcon, width: 24, height: 24 },
  { name: "QrcodeIcon", Icon: QrcodeIcon, width: 24, height: 24 },
  { name: "QuestionIcon", Icon: QuestionIcon, width: 24, height: 24 },
  { name: "QuoteLeftIcon", Icon: QuoteLeftIcon, width: 24, height: 24 },
  { name: "QuoteRightIcon", Icon: QuoteRightIcon, width: 24, height: 24 },
  { name: "RadioIcon", Icon: RadioIcon, width: 24, height: 24 },
  { name: "RainbowIcon", Icon: RainbowIcon, width: 24, height: 24 },
  { name: "RankingStarIcon", Icon: RankingStarIcon, width: 24, height: 24 },
  { name: "ReceiptIcon", Icon: ReceiptIcon, width: 24, height: 24 },
  { name: "RectangleListIcon", Icon: RectangleListIcon, width: 24, height: 24 },
  { name: "RepeatIcon", Icon: RepeatIcon, width: 24, height: 24 },
  { name: "ReplyAllIcon", Icon: ReplyAllIcon, width: 24, height: 24 },
  { name: "ReplyIcon", Icon: ReplyIcon, width: 24, height: 24 },
  { name: "RetweetIcon", Icon: RetweetIcon, width: 24, height: 24 },
  { name: "RibbonIcon", Icon: RibbonIcon, width: 24, height: 24 },
  { name: "RightLeftIcon", Icon: RightLeftIcon, width: 24, height: 24 },
  { name: "RobotIcon", Icon: RobotIcon, width: 24, height: 24 },
  { name: "RocketIcon", Icon: RocketIcon, width: 24, height: 24 },
  { name: "RocketLaunchIcon", Icon: RocketLaunchIcon, width: 24, height: 24 },
  { name: "RotateIcon", Icon: RotateIcon, width: 24, height: 24 },
  { name: "RotateLeftIcon", Icon: RotateLeftIcon, width: 24, height: 24 },
  { name: "RotateReverseIcon", Icon: RotateReverseIcon, width: 24, height: 24 },
  { name: "RotateRightIcon", Icon: RotateRightIcon, width: 24, height: 24 },
  { name: "RouteIcon", Icon: RouteIcon, width: 24, height: 24 },
  { name: "RssIcon", Icon: RssIcon, width: 24, height: 24 },
  { name: "RulerIcon", Icon: RulerIcon, width: 24, height: 24 },
  { name: "SackDollarIcon", Icon: SackDollarIcon, width: 24, height: 24 },
  { name: "ScaleBalancedIcon", Icon: ScaleBalancedIcon, width: 24, height: 24 },
  { name: "ScaleUnbalancedIcon", Icon: ScaleUnbalancedIcon, width: 24, height: 24 },
  { name: "SchoolFlagIcon", Icon: SchoolFlagIcon, width: 24, height: 24 },
  { name: "SchoolIcon", Icon: SchoolIcon, width: 24, height: 24 },
  { name: "ScissorsIcon", Icon: ScissorsIcon, width: 24, height: 24 },
  { name: "ScreencastIcon", Icon: ScreencastIcon, width: 24, height: 24 },
  { name: "ScreenUsersIcon", Icon: ScreenUsersIcon, width: 24, height: 24 },
  { name: "ScrewdriverWrenchIcon", Icon: ScrewdriverWrenchIcon, width: 24, height: 24 },
  { name: "ScrollIcon", Icon: ScrollIcon, width: 24, height: 24 },
  { name: "SealIcon", Icon: SealIcon, width: 24, height: 24 },
  { name: "SeedlingIcon", Icon: SeedlingIcon, width: 24, height: 24 },
  { name: "ServerIcon", Icon: ServerIcon, width: 24, height: 24 },
  { name: "ShareFromSquareIcon", Icon: ShareFromSquareIcon, width: 24, height: 24 },
  { name: "ShareIcon", Icon: ShareIcon, width: 24, height: 24 },
  { name: "ShareNodesIcon", Icon: ShareNodesIcon, width: 24, height: 24 },
  { name: "ShieldCheckIcon", Icon: ShieldCheckIcon, width: 24, height: 24 },
  { name: "ShieldExclamationIcon", Icon: ShieldExclamationIcon, width: 24, height: 24 },
  { name: "ShieldHalvedIcon", Icon: ShieldHalvedIcon, width: 24, height: 24 },
  { name: "ShieldIcon", Icon: ShieldIcon, width: 24, height: 24 },
  { name: "ShieldQuarteredIcon", Icon: ShieldQuarteredIcon, width: 24, height: 24 },
  { name: "ShuffleIcon", Icon: ShuffleIcon, width: 24, height: 24 },
  { name: "SidebarFlipIcon", Icon: SidebarFlipIcon, width: 24, height: 24 },
  { name: "SidebarIcon", Icon: SidebarIcon, width: 24, height: 24 },
  { name: "SignalBarsIcon", Icon: SignalBarsIcon, width: 24, height: 24 },
  { name: "SignalIcon", Icon: SignalIcon, width: 24, height: 24 },
  { name: "SignsPostIcon", Icon: SignsPostIcon, width: 24, height: 24 },
  { name: "SitemapIcon", Icon: SitemapIcon, width: 24, height: 24 },
  { name: "SlidersIcon", Icon: SlidersIcon, width: 24, height: 24, use: { size: 19, where: "user menu" } },
  { name: "SlidersSimpleIcon", Icon: SlidersSimpleIcon, width: 24, height: 24 },
  { name: "SnowflakeIcon", Icon: SnowflakeIcon, width: 24, height: 24 },
  { name: "SortDownIcon", Icon: SortDownIcon, width: 24, height: 24 },
  { name: "SortIcon", Icon: SortIcon, width: 24, height: 24 },
  { name: "SortUpIcon", Icon: SortUpIcon, width: 24, height: 24 },
  { name: "SparkleIcon", Icon: SparkleIcon, width: 24, height: 24 },
  { name: "SparklesIcon", Icon: SparklesIcon, width: 24, height: 24 },
  { name: "SpellCheckIcon", Icon: SpellCheckIcon, width: 24, height: 24 },
  { name: "SpinnerIcon", Icon: SpinnerIcon, width: 24, height: 24 },
  { name: "SpinnerThirdIcon", Icon: SpinnerThirdIcon, width: 24, height: 24 },
  { name: "SquareArrowUpRightIcon", Icon: SquareArrowUpRightIcon, width: 24, height: 24 },
  { name: "SquareCheckIcon", Icon: SquareCheckIcon, width: 24, height: 24 },
  { name: "SquareDashedCirclePlusIcon", Icon: SquareDashedCirclePlusIcon, width: 24, height: 24 },
  { name: "SquareExclamationIcon", Icon: SquareExclamationIcon, width: 24, height: 24 },
  { name: "SquareIcon", Icon: SquareIcon, width: 24, height: 24 },
  { name: "SquareInfoIcon", Icon: SquareInfoIcon, width: 24, height: 24 },
  { name: "SquareKanbanIcon", Icon: SquareKanbanIcon, width: 24, height: 24 },
  { name: "SquareListIcon", Icon: SquareListIcon, width: 24, height: 24 },
  { name: "SquareMinusIcon", Icon: SquareMinusIcon, width: 24, height: 24 },
  { name: "SquarePenIcon", Icon: SquarePenIcon, width: 24, height: 24 },
  { name: "SquarePlusIcon", Icon: SquarePlusIcon, width: 24, height: 24 },
  { name: "SquarePollVerticalIcon", Icon: SquarePollVerticalIcon, width: 24, height: 24 },
  { name: "SquareQuestionIcon", Icon: SquareQuestionIcon, width: 24, height: 24 },
  { name: "SquareTerminalIcon", Icon: SquareTerminalIcon, width: 24, height: 24 },
  { name: "SquareXmarkIcon", Icon: SquareXmarkIcon, width: 24, height: 24 },
  { name: "StampIcon", Icon: StampIcon, width: 24, height: 24 },
  { name: "StarHalfIcon", Icon: StarHalfIcon, width: 24, height: 24 },
  { name: "StarHalfStrokeIcon", Icon: StarHalfStrokeIcon, width: 24, height: 24 },
  { name: "StarIcon", Icon: StarIcon, width: 24, height: 24 },
  { name: "StarSharpIcon", Icon: StarSharpIcon, width: 24, height: 24 },
  { name: "StarShootingIcon", Icon: StarShootingIcon, width: 24, height: 24 },
  { name: "StarsIcon", Icon: StarsIcon, width: 24, height: 24 },
  { name: "StopIcon", Icon: StopIcon, width: 24, height: 24 },
  { name: "Stopwatch20Icon", Icon: Stopwatch20Icon, width: 24, height: 24 },
  { name: "StopwatchIcon", Icon: StopwatchIcon, width: 24, height: 24 },
  { name: "StoreIcon", Icon: StoreIcon, width: 24, height: 24 },
  { name: "StrikethroughIcon", Icon: StrikethroughIcon, width: 24, height: 24 },
  { name: "SubscriptIcon", Icon: SubscriptIcon, width: 24, height: 24 },
  { name: "SubtitlesIcon", Icon: SubtitlesIcon, width: 24, height: 24 },
  { name: "SubtitlesSlashIcon", Icon: SubtitlesSlashIcon, width: 24, height: 24 },
  { name: "SunBrightIcon", Icon: SunBrightIcon, width: 24, height: 24 },
  { name: "SunIcon", Icon: SunIcon, width: 24, height: 24 },
  { name: "SuperscriptIcon", Icon: SuperscriptIcon, width: 24, height: 24 },
  { name: "SwordIcon", Icon: SwordIcon, width: 24, height: 24 },
  { name: "SwordsIcon", Icon: SwordsIcon, width: 24, height: 24 },
  { name: "TableCellsIcon", Icon: TableCellsIcon, width: 24, height: 24 },
  { name: "TableCellsLargeIcon", Icon: TableCellsLargeIcon, width: 24, height: 24 },
  { name: "TableColumnsIcon", Icon: TableColumnsIcon, width: 24, height: 24 },
  { name: "TableIcon", Icon: TableIcon, width: 24, height: 24 },
  { name: "TableListIcon", Icon: TableListIcon, width: 24, height: 24 },
  { name: "TableRowsIcon", Icon: TableRowsIcon, width: 24, height: 24 },
  { name: "TabletIcon", Icon: TabletIcon, width: 24, height: 24 },
  { name: "TabletScreenButtonIcon", Icon: TabletScreenButtonIcon, width: 24, height: 24 },
  { name: "TagIcon", Icon: TagIcon, width: 24, height: 24 },
  { name: "TagsIcon", Icon: TagsIcon, width: 24, height: 24 },
  { name: "TelescopeIcon", Icon: TelescopeIcon, width: 24, height: 24 },
  { name: "TemperatureHalfIcon", Icon: TemperatureHalfIcon, width: 24, height: 24 },
  { name: "TerminalIcon", Icon: TerminalIcon, width: 24, height: 24 },
  { name: "TextHeightIcon", Icon: TextHeightIcon, width: 24, height: 24 },
  { name: "TextIcon", Icon: TextIcon, width: 24, height: 24 },
  { name: "TextSizeIcon", Icon: TextSizeIcon, width: 24, height: 24 },
  { name: "TextSlashIcon", Icon: TextSlashIcon, width: 24, height: 24 },
  { name: "TextWidthIcon", Icon: TextWidthIcon, width: 24, height: 24 },
  { name: "ThoughtBubbleIcon", Icon: ThoughtBubbleIcon, width: 24, height: 24 },
  { name: "ThumbsDownIcon", Icon: ThumbsDownIcon, width: 24, height: 24 },
  { name: "ThumbsUpIcon", Icon: ThumbsUpIcon, width: 24, height: 24 },
  { name: "ThumbtackIcon", Icon: ThumbtackIcon, width: 24, height: 24 },
  { name: "ThumbtackSlashIcon", Icon: ThumbtackSlashIcon, width: 24, height: 24 },
  { name: "TicketIcon", Icon: TicketIcon, width: 24, height: 24 },
  { name: "TicketSimpleIcon", Icon: TicketSimpleIcon, width: 24, height: 24 },
  { name: "TimelineArrowIcon", Icon: TimelineArrowIcon, width: 24, height: 24 },
  { name: "TimelineIcon", Icon: TimelineIcon, width: 24, height: 24 },
  { name: "TimerIcon", Icon: TimerIcon, width: 24, height: 24 },
  { name: "ToggleLargeOffIcon", Icon: ToggleLargeOffIcon, width: 24, height: 24 },
  { name: "ToggleLargeOnIcon", Icon: ToggleLargeOnIcon, width: 24, height: 24 },
  { name: "ToggleOffIcon", Icon: ToggleOffIcon, width: 24, height: 24 },
  { name: "ToggleOnIcon", Icon: ToggleOnIcon, width: 24, height: 24 },
  { name: "ToolboxIcon", Icon: ToolboxIcon, width: 24, height: 24 },
  { name: "TrashCanArrowUpIcon", Icon: TrashCanArrowUpIcon, width: 24, height: 24 },
  { name: "TrashCanIcon", Icon: TrashCanIcon, width: 24, height: 24, use: { size: 20, where: "move menu" } },
  { name: "TreeIcon", Icon: TreeIcon, width: 24, height: 24 },
  { name: "TriangleExclamationIcon", Icon: TriangleExclamationIcon, width: 24, height: 24 },
  { name: "TrophyIcon", Icon: TrophyIcon, width: 24, height: 24 },
  { name: "TrophyStarIcon", Icon: TrophyStarIcon, width: 24, height: 24 },
  { name: "TruckIcon", Icon: TruckIcon, width: 24, height: 24 },
  { name: "TvIcon", Icon: TvIcon, width: 24, height: 24 },
  { name: "UmbrellaIcon", Icon: UmbrellaIcon, width: 24, height: 24 },
  { name: "UnderlineIcon", Icon: UnderlineIcon, width: 24, height: 24 },
  { name: "UniversalAccessIcon", Icon: UniversalAccessIcon, width: 24, height: 24 },
  { name: "UnlockIcon", Icon: UnlockIcon, width: 24, height: 24 },
  { name: "UpDownIcon", Icon: UpDownIcon, width: 24, height: 24 },
  { name: "UploadIcon", Icon: UploadIcon, width: 24, height: 24 },
  { name: "UpRightAndDownLeftFromCenterIcon", Icon: UpRightAndDownLeftFromCenterIcon, width: 24, height: 24 },
  { name: "UserCheckIcon", Icon: UserCheckIcon, width: 24, height: 24 },
  { name: "UserCircleMinusIcon", Icon: UserCircleMinusIcon, width: 24, height: 24 },
  { name: "UserCirclePlusIcon", Icon: UserCirclePlusIcon, width: 24, height: 24 },
  { name: "UserClockIcon", Icon: UserClockIcon, width: 24, height: 24 },
  { name: "UserCrownIcon", Icon: UserCrownIcon, width: 24, height: 24 },
  { name: "UserDashedIcon", Icon: UserDashedIcon, width: 24, height: 24 },
  { name: "UserGearIcon", Icon: UserGearIcon, width: 24, height: 24 },
  { name: "UserGraduateIcon", Icon: UserGraduateIcon, width: 24, height: 24 },
  { name: "UserGroupCrownIcon", Icon: UserGroupCrownIcon, width: 24, height: 24 },
  { name: "UserGroupIcon", Icon: UserGroupIcon, width: 24, height: 24 },
  { name: "UserHeadsetIcon", Icon: UserHeadsetIcon, width: 24, height: 24 },
  { name: "UserIcon", Icon: UserIcon, width: 24, height: 24, use: { size: 19, where: "user menu" } },
  { name: "UserLockIcon", Icon: UserLockIcon, width: 24, height: 24 },
  { name: "UserMagnifyingGlassIcon", Icon: UserMagnifyingGlassIcon, width: 24, height: 24 },
  { name: "UserMessageIcon", Icon: UserMessageIcon, width: 24, height: 24 },
  { name: "UserMinusIcon", Icon: UserMinusIcon, width: 24, height: 24 },
  { name: "UserNinjaIcon", Icon: UserNinjaIcon, width: 24, height: 24 },
  { name: "UserPenIcon", Icon: UserPenIcon, width: 24, height: 24 },
  { name: "UserPlusIcon", Icon: UserPlusIcon, width: 24, height: 24 },
  { name: "UserQuestionIcon", Icon: UserQuestionIcon, width: 24, height: 24 },
  { name: "UserRobotIcon", Icon: UserRobotIcon, width: 24, height: 24 },
  { name: "UserSecretIcon", Icon: UserSecretIcon, width: 24, height: 24 },
  { name: "UsersGearIcon", Icon: UsersGearIcon, width: 24, height: 24 },
  { name: "UserShieldIcon", Icon: UserShieldIcon, width: 24, height: 24 },
  { name: "UsersIcon", Icon: UsersIcon, width: 24, height: 24 },
  { name: "UserSlashIcon", Icon: UserSlashIcon, width: 24, height: 24 },
  { name: "UsersSlashIcon", Icon: UsersSlashIcon, width: 24, height: 24 },
  { name: "UsersViewfinderIcon", Icon: UsersViewfinderIcon, width: 24, height: 24 },
  { name: "UserTieIcon", Icon: UserTieIcon, width: 24, height: 24 },
  { name: "UserUnlockIcon", Icon: UserUnlockIcon, width: 24, height: 24 },
  { name: "UserXmarkIcon", Icon: UserXmarkIcon, width: 24, height: 24 },
  { name: "VideoIcon", Icon: VideoIcon, width: 24, height: 24 },
  { name: "VideoPlusIcon", Icon: VideoPlusIcon, width: 24, height: 24 },
  { name: "VideoQuestionIcon", Icon: VideoQuestionIcon, width: 24, height: 24 },
  { name: "VideoSlashIcon", Icon: VideoSlashIcon, width: 24, height: 24 },
  { name: "VoicemailIcon", Icon: VoicemailIcon, width: 24, height: 24 },
  { name: "VolumeHighIcon", Icon: VolumeHighIcon, width: 24, height: 24 },
  { name: "VolumeIcon", Icon: VolumeIcon, width: 24, height: 24 },
  { name: "VolumeLowIcon", Icon: VolumeLowIcon, width: 24, height: 24, use: { size: 18, where: "game viewer" } },
  { name: "VolumeOffIcon", Icon: VolumeOffIcon, width: 24, height: 24 },
  { name: "VolumeSlashIcon", Icon: VolumeSlashIcon, width: 24, height: 24 },
  { name: "VolumeXmarkIcon", Icon: VolumeXmarkIcon, width: 24, height: 24, use: { size: 18, where: "game viewer" } },
  { name: "WalletIcon", Icon: WalletIcon, width: 24, height: 24 },
  { name: "WandMagicSparklesIcon", Icon: WandMagicSparklesIcon, width: 24, height: 24 },
  { name: "WandSparklesIcon", Icon: WandSparklesIcon, width: 24, height: 24 },
  { name: "WaterIcon", Icon: WaterIcon, width: 24, height: 24 },
  { name: "WaveformIcon", Icon: WaveformIcon, width: 24, height: 24 },
  {
    name: "WhatsappIcon",
    Icon: WhatsappIcon,
    width: 16,
    height: 16,
    use: { size: 16, where: "CTA (site)" },
    variants: false,
  },
  { name: "WifiExclamationIcon", Icon: WifiExclamationIcon, width: 24, height: 24 },
  { name: "WifiIcon", Icon: WifiIcon, width: 24, height: 24 },
  { name: "WifiSlashIcon", Icon: WifiSlashIcon, width: 24, height: 24 },
  { name: "WindIcon", Icon: WindIcon, width: 24, height: 24 },
  { name: "WindowMaximizeIcon", Icon: WindowMaximizeIcon, width: 24, height: 24 },
  { name: "WindowRestoreIcon", Icon: WindowRestoreIcon, width: 24, height: 24 },
  { name: "WreathLaurelIcon", Icon: WreathLaurelIcon, width: 24, height: 24 },
  { name: "WrenchIcon", Icon: WrenchIcon, width: 24, height: 24 },
  { name: "XmarkIcon", Icon: XmarkIcon, width: 20, height: 20, use: { size: 20, where: "staff dialogs" } },
  { name: "XmarkLargeIcon", Icon: XmarkLargeIcon, width: 24, height: 24 },
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
 * library in a 48px box, in its six styles, in the accent.
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
