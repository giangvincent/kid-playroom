"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import { cx } from "@/lib/cx";

const COLORS = [
  { hex: "#1d2b53", name: "Xanh đậm" },
  { hex: "#ff004d", name: "Đỏ" },
  { hex: "#ffa300", name: "Cam" },
  { hex: "#ffec27", name: "Vàng" },
  { hex: "#00e436", name: "Xanh lá" },
  { hex: "#29adff", name: "Xanh dương" },
  { hex: "#ff77a8", name: "Hồng" },
  { hex: "#fff1e8", name: "Trắng" },
];
const BACKGROUND = COLORS[COLORS.length - 1].hex;
const BRUSH = 16;

type Point = { x: number; y: number };

export function DrawingGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const drawingRef = useRef(false);
  const lastRef = useRef<Point | null>(null);
  const [color, setColor] = useState(COLORS[0].hex);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }
    ctxRef.current = ctx;

    const repaint = (snapshot: HTMLCanvasElement | null) => {
      ctx.fillStyle = BACKGROUND;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      if (snapshot) {
        ctx.drawImage(snapshot, 0, 0);
      }
    };

    const resize = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (width === 0 || height === 0) {
        return;
      }
      if (canvas.width === width && canvas.height === height) {
        return;
      }
      // Keep the current drawing alive across resizes (e.g. entering
      // fullscreen must not wipe the board).
      const snapshot = document.createElement("canvas");
      snapshot.width = canvas.width;
      snapshot.height = canvas.height;
      snapshot.getContext("2d")?.drawImage(canvas, 0, 0);
      canvas.width = width;
      canvas.height = height;
      repaint(snapshot);
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  function toPoint(event: PointerEvent<HTMLCanvasElement>): Point {
    const canvas = canvasRef.current;
    if (!canvas) {
      return { x: 0, y: 0 };
    }
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * canvas.width,
      y: ((event.clientY - rect.top) / rect.height) * canvas.height,
    };
  }

  function stamp(point: Point) {
    const ctx = ctxRef.current;
    if (!ctx) {
      return;
    }
    ctx.fillStyle = color;
    ctx.fillRect(point.x - BRUSH / 2, point.y - BRUSH / 2, BRUSH, BRUSH);
  }

  function drawTo(point: Point) {
    const from = lastRef.current;
    if (!from) {
      stamp(point);
      return;
    }
    const distance = Math.hypot(point.x - from.x, point.y - from.y);
    const steps = Math.max(1, Math.round(distance / (BRUSH / 2)));
    for (let i = 1; i <= steps; i += 1) {
      stamp({
        x: from.x + ((point.x - from.x) * i) / steps,
        y: from.y + ((point.y - from.y) * i) / steps,
      });
    }
  }

  function handleDown(event: PointerEvent<HTMLCanvasElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    drawingRef.current = true;
    const point = toPoint(event);
    lastRef.current = point;
    stamp(point);
  }

  function handleMove(event: PointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current) {
      return;
    }
    const point = toPoint(event);
    drawTo(point);
    lastRef.current = point;
  }

  function handleUp() {
    drawingRef.current = false;
    lastRef.current = null;
  }

  function clear() {
    const ctx = ctxRef.current;
    if (!ctx) {
      return;
    }
    ctx.fillStyle = BACKGROUND;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }

  return (
    <div className="flex w-full flex-1 self-stretch flex-col items-center gap-4">
      <div className="relative min-h-0 w-full flex-1">
      <canvas
        ref={canvasRef}
        onPointerDown={handleDown}
        onPointerMove={handleMove}
        onPointerUp={handleUp}
        onPointerLeave={handleUp}
        onPointerCancel={handleUp}
        className="absolute inset-0 h-full w-full touch-none border-4 border-ink shadow-[6px_6px_0_0_var(--color-ink)]"
      />
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {COLORS.map((option) => (
          <button
            key={option.hex}
            type="button"
            aria-label={option.name}
            onClick={() => setColor(option.hex)}
            style={{ backgroundColor: option.hex }}
            className={cx(
              "h-16 w-16 border-4 border-ink",
              color === option.hex &&
                "outline outline-4 outline-offset-2 outline-primary",
            )}
          />
        ))}
        <button
          type="button"
          onClick={clear}
          className="ml-2 flex h-16 items-center border-4 border-ink bg-paper px-5 text-lg font-bold shadow-[4px_4px_0_0_var(--color-ink)]"
        >
          Xoá hết
        </button>
      </div>
    </div>
  );
}
