/** The nearest ancestor that scrolls, on either axis: the one a list of moves should move, and no other. */
export function scrollerOf(element: HTMLElement): HTMLElement | null {
  for (let node = element.parentElement; node; node = node.parentElement) {
    const { overflowX, overflowY } = getComputedStyle(node);
    if (/auto|scroll/.test(overflowY) || /auto|scroll/.test(overflowX)) return node;
  }
  return null;
}

/**
 * Brings `element` into view inside its nearest scrolling ancestor, by the
 * least it takes, and moves nothing else. `scrollIntoView` scrolls EVERY
 * scrollable ancestor up to the window — including the ones with
 * `overflow: hidden`, which can still be scrolled by script — so a list
 * keeping its active move in view pushed the page, or whatever canvas the
 * list sits on, along with it.
 */
export function scrollWithin(element: HTMLElement, behavior: ScrollBehavior = "auto"): void {
  const scroller = scrollerOf(element);
  if (!scroller) return;

  // The rects are in the page's px, with the zoom in them, while the
  // scroller's sizes are in its own: the difference has to cross over.
  const zoom = scroller.currentCSSZoom || 1;
  const frame = scroller.getBoundingClientRect();
  const box = element.getBoundingClientRect();
  const top = (box.top - frame.top) / zoom - scroller.clientTop;
  const bottom = (box.bottom - frame.top) / zoom - scroller.clientTop;
  const left = (box.left - frame.left) / zoom - scroller.clientLeft;
  const right = (box.right - frame.left) / zoom - scroller.clientLeft;

  const dy = top < 0 ? top : bottom > scroller.clientHeight ? bottom - scroller.clientHeight : 0;
  const dx = left < 0 ? left : right > scroller.clientWidth ? right - scroller.clientWidth : 0;
  if (dx !== 0 || dy !== 0) scroller.scrollBy({ top: dy, left: dx, behavior });
}
