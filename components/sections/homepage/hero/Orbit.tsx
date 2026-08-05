import "./orbit.css";

export function Orbit() {
  return (
    <>
      <div className="orbit__ring orbit__ring_index_1 relative" style={{ gridArea: "1 / 1 / 2 / 2" }}>
        <div className="w-2 h-2 bg-primary rotate-0 absolute rounded-full -top-[5px] right-1/2"></div>
        <div className="w-1.5 h-1.5 bg-secondary rotate-0 absolute rounded-full top-1/2 -right-[4px]"></div>
        <div className="w-1.5 h-1.5 bg-white rotate-0 absolute rounded-full right-1/2 -bottom-[5px]"></div>
      </div>

      <div className="orbit__ring orbit__ring_index_2" style={{ gridArea: "1 / 1 / 2 / 2" }}>
        <div className="w-2 h-2 bg-white rotate-0 absolute rounded-full -top-[5px] right-1/2"></div>
        <div className="w-1.5 h-1.5 bg-white rotate-0 absolute rounded-full -bottom-[5px] right-1/2"></div>
      </div>
    </>
  );
}
