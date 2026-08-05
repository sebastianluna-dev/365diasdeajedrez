import "./orbit.comp.css";

export function Orbit() {
  return (
    <>
      <div className="orbit__ring orbit__ring_index_1" style={{ gridArea: "1 / 1 / 2 / 2" }}>
        <div className="orbit__dot orbit__dot_ring_1_top"></div>
        <div className="orbit__dot orbit__dot_ring_1_right"></div>
        <div className="orbit__dot orbit__dot_ring_1_bottom"></div>
      </div>

      <div className="orbit__ring orbit__ring_index_2" style={{ gridArea: "1 / 1 / 2 / 2" }}>
        <div className="orbit__dot orbit__dot_ring_2_top"></div>
        <div className="orbit__dot orbit__dot_ring_2_bottom"></div>
      </div>
    </>
  );
}
