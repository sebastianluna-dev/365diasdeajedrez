import "./subscribe-box.comp.css";

export function SubscribeBox() {
  return (
    <div className="subscribe-box">
      <h4 className="subscribe-box__title">Recibe cada edición</h4>
      <p className="subscribe-box__text">Un correo al mes con lo publicado y un ejercicio para resolver.</p>
      <input className="subscribe-box__input" type="email" placeholder="Tu correo electrónico" />
      <button className="subscribe-box__submit" type="button">
        Suscribirme
      </button>
    </div>
  );
}
