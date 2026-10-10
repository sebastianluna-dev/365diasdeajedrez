/** What a keepsake's drawing may write: the person's name, on the membership card. */
export interface KeepsakeDrawingProps {
  name: string;
}

/** One keepsake's drawing: the box it is drawn in and what draws inside it (the host provides the <svg>). */
export interface KeepsakeDrawing {
  viewBox: string;
  Drawing: (props: KeepsakeDrawingProps) => React.JSX.Element;
}
