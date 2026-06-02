import { useCallback, useEffect, useRef, useState } from "react";

type Options = {
  min: number;
  max: number;
  default: number;
  storageKey: string;
};

function readInitialWidth(opts: Options): number {
  if (typeof window === "undefined") return opts.default;
  try {
    const saved = window.localStorage.getItem(opts.storageKey);
    if (!saved) return opts.default;
    const parsed = Number.parseInt(saved, 10);
    if (
      !Number.isNaN(parsed) &&
      parsed >= opts.min &&
      parsed <= opts.max
    ) {
      return parsed;
    }
  } catch {
    // ignore localStorage failures
  }
  return opts.default;
}

export function useResizableWidth(opts: Options) {
  const [width, setWidth] = useState(() => readInitialWidth(opts));
  const dragging = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(opts.default);

  useEffect(() => {
    try {
      window.localStorage.setItem(opts.storageKey, String(width));
    } catch {
      // ignore localStorage failures
    }
  }, [opts.storageKey, width]);

  const onMouseDown = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      event.preventDefault();
      dragging.current = true;
      startX.current = event.clientX;
      startWidth.current = width;

      const onMouseMove = (moveEvent: MouseEvent) => {
        if (!dragging.current) return;
        const delta = startX.current - moveEvent.clientX;
        const nextWidth = Math.min(
          opts.max,
          Math.max(opts.min, startWidth.current + delta),
        );
        setWidth(nextWidth);
      };

      const onMouseUp = () => {
        dragging.current = false;
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
      };

      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    },
    [opts.max, opts.min, width],
  );

  return { width, onMouseDown };
}
