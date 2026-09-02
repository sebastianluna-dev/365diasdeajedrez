import Link from "next/link";
import { GameViewer } from "@/components/common/game-viewer/game-viewer.comp";
import { StaticDiagram } from "@/components/common/static-diagram.comp";
import type { ClassBlockView } from "@/services/classes/classes.types";
import "./class-content-renderer.comp.css";

interface ClassContentRendererProps {
  blocks: ClassBlockView[];
}

function TextBlock({ text }: { text: string }) {
  // El texto del bloque es markdown sencillo; en esta etapa se renderiza como
  // párrafos planos (los "## " se tratan como subtítulos).
  const paragraphs = text.split(/\n{2,}/);
  return (
    <div className="class-content__text">
      {paragraphs.map((paragraph, index) =>
        paragraph.startsWith("## ") ? (
          <h3 key={index} className="class-content__text-heading">
            {paragraph.slice(3)}
          </h3>
        ) : (
          <p key={index} className="class-content__text-paragraph">
            {paragraph}
          </p>
        ),
      )}
    </div>
  );
}

/**
 * Renderiza los bloques ordenados de una clase según su tipo. Los bloques de
 * ajedrez son referencias al material original: partidas con GameViewer (el
 * visor único) y posiciones con StaticDiagram.
 */
export function ClassContentRenderer({ blocks }: ClassContentRendererProps) {
  return (
    <div className="class-content">
      {blocks.map((block) => (
        <div key={block.id} className={`class-content__block class-content__block_kind_${block.kind.toLowerCase()}`}>
          {block.kind === "TEXT" && <TextBlock text={block.text} />}

          {block.kind === "VIDEO" && (
            <a href={block.videoUrl} target="_blank" rel="noreferrer" className="class-content__link-card">
              <span className="class-content__link-kind">Video</span>
              <span className="class-content__link-label">{block.caption ?? block.videoUrl}</span>
            </a>
          )}

          {block.kind === "GAME_REF" && (
            <div className="class-content__game">
              <GameViewer pgn={block.game.pgn} title={block.game.label} initialPath={block.game.movePath} />
              {block.game.href && (
                <Link href={block.game.href} className="class-content__game-link">
                  Abrir la partida en Mis estudios
                </Link>
              )}
            </div>
          )}

          {/* La lección se ve DENTRO de la clase, igual que la partida: el
              enlace se queda debajo para abrirla entera con su navegación. */}
          {block.kind === "LESSON_REF" && (
            <div className="class-content__game">
              <GameViewer
                pgn={block.lesson.pgn}
                title={block.lesson.name}
                orientation={block.lesson.orientation}
                initialPath={block.lesson.movePath}
              />
              <Link href={block.lesson.href} className="class-content__game-link">
                Abrir la lección completa
              </Link>
            </div>
          )}

          {block.kind === "POSITION_REF" && (
            <StaticDiagram
              fen={block.position.fen}
              orientation={block.position.orientation}
              caption={block.caption ?? block.position.title}
            />
          )}

          {block.kind === "FILE" && (
            <div className="class-content__link-card">
              <span className="class-content__link-kind">Archivo</span>
              <span className="class-content__link-label">{block.caption ?? "Material de la clase"}</span>
            </div>
          )}

          {block.caption && block.kind !== "POSITION_REF" && block.kind !== "FILE" && block.kind !== "VIDEO" && (
            <p className="class-content__caption">{block.caption}</p>
          )}
        </div>
      ))}
    </div>
  );
}
