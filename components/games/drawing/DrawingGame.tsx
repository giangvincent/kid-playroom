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
const WIDTH = 720;
const HEIGHT = 480;

type Point = { x: number; y: number };

export function DrawingGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const drawingRef = useRef(false);
  const lastRef = useRef<Point | null>(null);
  const [color, setColor] = useState(COLORS[0].hex);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d") ?? null;
    if (!ctx) {
      return;
    }
    ctx.fillStyle = BACKGROUND;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctxRef.current = ctx;
  }, []);

  function toPoint(event: PointerEvent<HTMLCanvasElement>): Point {
    const canvas = canvasRef.current;
    if (!canvas) {
      return { x: 0, y: 0 };
    }
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * WIDTH,
      y: ((event.clientY - rect.top) / rect.height) * HEIGHT,
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
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
  }

  return (
    <div className="flex w-full max-w-3xl flex-col items-center gap-4">
      <canvas
        ref={canvasRef}
        width={WIDTH}
        height={HEIGHT}
        onPointerDown={handleDown}
        onPointerMove={handleMove}
        onPointerUp={handleUp}
        onPointerLeave={handleUp}
        onPointerCancel={handleUp}
        style={{ aspectRatio: `${WIDTH} / ${HEIGHT}` }}
        className="w-full touch-none border-4 border-ink shadow-[6px_6px_0_0_var(--color-ink)]"
      />
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
