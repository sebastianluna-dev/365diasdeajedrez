import { ClockIcon } from "@/components/icons/clock-icon.comp";
import { ClosedCaptioningIcon } from "@/components/icons/closed-captioning-icon.comp";
import { CommentIcon } from "@/components/icons/comment-icon.comp";
import { EllipsisVerticalIcon } from "@/components/icons/ellipsis-vertical-icon.comp";
import { HandIcon } from "@/components/icons/hand-icon.comp";
import { MicrophoneIcon } from "@/components/icons/microphone-icon.comp";
import { MicrophoneSlashIcon } from "@/components/icons/microphone-slash-icon.comp";
import { PenIcon } from "@/components/icons/pen-icon.comp";
import { PhoneSlashIcon } from "@/components/icons/phone-slash-icon.comp";
import { RotateLeftIcon } from "@/components/icons/rotate-left-icon.comp";
import { ScreencastIcon } from "@/components/icons/screencast-icon.comp";
import { ShareNodesIcon } from "@/components/icons/share-nodes-icon.comp";
import { UserIcon } from "@/components/icons/user-icon.comp";
import { UsersIcon } from "@/components/icons/users-icon.comp";
import { VideoIcon } from "@/components/icons/video-icon.comp";
import { SiteBoard } from "@/components/site/shared/site-board/site-board.comp";
import type { HomeClassesCopy } from "@/types/academy-home.types";
import "./classroom-mock.comp.css";

const TOOL_ICONS = [PenIcon, RotateLeftIcon, ShareNodesIcon];

interface ClassroomMockProps {
  room: HomeClassesCopy["room"];
}

/**
 * The classroom the platform will have (`AcadClasesA`'s «room»): the shared
 * board as the biggest thing on the screen, the moves, the teacher's tools,
 * the videos, the captions and the call's controls. It does not exist yet, so
 * it is drawn as a picture marked «Próximamente»: one image with its name for
 * a screen reader, nothing in it can be pressed.
 */
export function ClassroomMock({ room }: ClassroomMockProps) {
  const [currentRow, currentColumn] = room.current.split(",").map(Number);

  return (
    <div className="home-classroom" role="img" aria-label={room.label}>
      <div className="home-classroom__top">
        <b className="home-classroom__title">{room.title}</b>
        <span className="home-classroom__meta">{room.meta}</span>
        <span className="home-classroom__rec">
          <i className="home-classroom__rec-dot" />
          Grabando
        </span>
        <span className="home-classroom__soon">
          <ClockIcon className="home-classroom__soon-icon" />
          {room.soon}
        </span>
      </div>

      <div className="home-classroom__body">
        <div className="home-classroom__stage">
          <div className="home-classroom__board">
            <SiteBoard fen={room.board.fen} lastMove={room.board.lastMove} label={room.board.label} />
          </div>
          <div className="home-classroom__side">
            <span className="home-classroom__turn">
              <i className="home-classroom__turn-dot" />
              {room.turn}
            </span>
            <span className="home-classroom__topic">{room.topic}</span>
            <span className="home-classroom__moves">
              {room.moves.map((row, rowIndex) =>
                row.map((cell, columnIndex) => (
                  <span
                    key={`${rowIndex}-${columnIndex}`}
                    className={`home-classroom__move${columnIndex === 0 ? " home-classroom__move_kind_number" : ""}${
                      rowIndex === currentRow && columnIndex === currentColumn
                        ? " home-classroom__move_state_current"
                        : ""
                    }`}
                  >
                    {cell}
                  </span>
                )),
              )}
            </span>
            <span className="home-classroom__tools">
              {room.tools.map((tool, index) => {
                const Icon = TOOL_ICONS[index] ?? PenIcon;
                return (
                  <span key={tool} className="home-classroom__tool">
                    <Icon className="home-classroom__tool-icon" />
                    {tool}
                  </span>
                );
              })}
            </span>
          </div>
        </div>

        <div className="home-classroom__tiles">
          <span className="home-classroom__tile home-classroom__tile_size_main">
            <UserIcon className="home-classroom__tile-icon" />
            <span className="home-classroom__who">{room.teacher}</span>
          </span>
          {room.students.map((student, index) => (
            <span key={student} className="home-classroom__tile">
              <UserIcon className="home-classroom__tile-icon" />
              {index > 0 && (
                <span className="home-classroom__muted">
                  <MicrophoneSlashIcon className="home-classroom__muted-icon" />
                </span>
              )}
              <span className="home-classroom__who">{student}</span>
            </span>
          ))}
        </div>
      </div>

      <p className="home-classroom__captions">
        <small className="home-classroom__captions-who">{room.captions.who}</small>
        {room.captions.text}
      </p>

      <div className="home-classroom__controls">
        <span className="home-classroom__clock">{room.clock}</span>
        <span className="home-classroom__keys">
          <span className="home-classroom__key">
            <MicrophoneIcon variant="classic-solid" className="home-classroom__key-icon" />
          </span>
          <span className="home-classroom__key">
            <VideoIcon variant="classic-solid" className="home-classroom__key-icon" />
          </span>
          <span className="home-classroom__key home-classroom__key_state_on">
            <ClosedCaptioningIcon variant="classic-solid" className="home-classroom__key-icon" />
          </span>
          <span className="home-classroom__key home-classroom__key_kind_extra">
            <ScreencastIcon variant="classic-solid" className="home-classroom__key-icon" />
          </span>
          <span className="home-classroom__key home-classroom__key_kind_extra">
            <HandIcon variant="classic-solid" className="home-classroom__key-icon" />
          </span>
          <span className="home-classroom__key home-classroom__key_kind_extra">
            <EllipsisVerticalIcon variant="classic-solid" className="home-classroom__key-icon" />
          </span>
          <span className="home-classroom__hang">
            <PhoneSlashIcon variant="classic-solid" className="home-classroom__key-icon" />
          </span>
        </span>
        <span className="home-classroom__aside">
          <span className="home-classroom__key">
            <UsersIcon variant="classic-solid" className="home-classroom__key-icon" />
          </span>
          <span className="home-classroom__key">
            <CommentIcon variant="classic-solid" className="home-classroom__key-icon" />
          </span>
        </span>
      </div>
    </div>
  );
}
