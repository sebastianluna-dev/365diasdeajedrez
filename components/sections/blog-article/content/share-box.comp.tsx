import "./share-box.comp.css";

export function ShareBox() {
  return (
    <aside className="share-box">
      <h3 className="share-box__title">Compartir</h3>
      <div className="share-box__links">
        <a href="#" aria-label="Compartir en Facebook" className="share-box__link">
          f
        </a>
        <a href="#" aria-label="Compartir en X" className="share-box__link">
          𝕏
        </a>
      </div>
    </aside>
  );
}
