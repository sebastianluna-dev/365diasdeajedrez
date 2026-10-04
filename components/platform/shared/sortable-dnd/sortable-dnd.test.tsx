import { useSortable } from "@dnd-kit/sortable";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SortableDnd } from "./sortable-dnd.comp";

// dnd-kit names the instructions a handle points at (`aria-describedby`) from
// a counter of its own, unless the context is given an id. The server and the
// browser do not count alike, so the handles hydrated with a different id
// (seen on a study's game list). Two renders in one process stand in for the
// two sides: with the counter the second one would say `-1`, `-2`…

const ITEMS = [
  { id: "a", name: "Ronda 1" },
  { id: "b", name: "Ronda 5" },
];

function Row({ id, name }: { id: string; name: string }) {
  const { attributes, setNodeRef } = useSortable({ id, data: { name } });
  return (
    <li ref={setNodeRef}>
      <button type="button" {...attributes}>
        {name}
      </button>
    </li>
  );
}

function List() {
  return (
    <SortableDnd items={ITEMS} noun="partida" onMove={() => undefined}>
      <ul>
        {ITEMS.map((item) => (
          <Row key={item.id} {...item} />
        ))}
      </ul>
    </SortableDnd>
  );
}

const describedBy = (html: string) => [...html.matchAll(/aria-describedby="([^"]+)"/g)].map((match) => match[1]);

describe("SortableDnd", () => {
  it("names the handles' instructions the same on every render", () => {
    const first = describedBy(renderToStaticMarkup(<List />));
    const second = describedBy(renderToStaticMarkup(<List />));
    expect(first).toHaveLength(ITEMS.length);
    expect(second).toEqual(first);
  });
});
