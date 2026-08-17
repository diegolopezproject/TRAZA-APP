"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, Key, KeyboardEvent, PointerEvent, ReactNode } from "react";
import { useReducedMotion } from "motion/react";
import { deckMotion } from "@/lib/motion";

export type DayDeckAxis = "x" | "y";

export interface DayDeckGestureInput {
  axis: DayDeckAxis;
  currentIndex: number;
  total: number;
  offsetX: number;
  offsetY: number;
  velocityX: number;
  velocityY: number;
  width: number;
}

export function resolveDayDeckGesture(input: DayDeckGestureInput) {
  const horizontalThreshold = Math.min(112, Math.max(72, input.width * .22));
  if (input.axis === "y") {
    return { index: input.currentIndex, open: input.offsetY < -72 || input.velocityY < -.52 };
  }
  const direction = input.offsetX < 0 ? 1 : -1;
  const dominantVelocity = Math.abs(input.velocityX) >= .5 && Math.sign(input.velocityX) === Math.sign(input.offsetX);
  const commits = Math.abs(input.offsetX) >= horizontalThreshold || dominantVelocity;
  return {
    index: commits ? Math.max(0, Math.min(input.total - 1, input.currentIndex + direction)) : input.currentIndex,
    open: false,
  };
}

export const dayDeckAxisLockDistance = 10;

export function resolveDayDeckAxis(offsetX: number, offsetY: number, lockDistance = dayDeckAxisLockDistance): DayDeckAxis | null {
  if (Math.hypot(offsetX, offsetY) < lockDistance) return null;
  return Math.abs(offsetX) >= Math.abs(offsetY) ? "x" : "y";
}

export function resistDayDeckEdge(offset: number, atEdge: boolean) {
  if (!atEdge) return offset;
  return Math.sign(offset) * Math.min(36, 36 * (1 - Math.exp(-Math.abs(offset) / 72)));
}

interface GestureState {
  pointerId: number;
  startX: number;
  startY: number;
  lastX: number;
  lastY: number;
  lastTime: number;
  velocityX: number;
  velocityY: number;
  offsetX: number;
  offsetY: number;
  axis: DayDeckAxis | null;
}

export interface DayDeckProps {
  total: number;
  currentIndex: number;
  label: string;
  renderItem: (index: number, active: boolean, progress: ReactNode) => ReactNode;
  getItemKey?: (index: number) => Key;
  onIndexChange: (index: number) => void;
  onOpenCurrent: () => void;
  /** Visual-QA seam used by Storybook; production leaves this undefined. */
  diagnosticOffset?: { x: number; y: number };
  diagnosticPressed?: boolean;
  diagnosticSettling?: boolean;
}

export function visibleDayDeckIndices(currentIndex: number, total: number): number[] {
  return [currentIndex - 1, currentIndex, currentIndex + 1].filter((index) => index >= 0 && index < total);
}

export function DayDeck({ total, currentIndex, label, renderItem, getItemKey, onIndexChange, onOpenCurrent, diagnosticOffset, diagnosticPressed, diagnosticSettling }: DayDeckProps) {
  const reducedMotion = useReducedMotion();
  const stageRef = useRef<HTMLDivElement>(null);
  const gestureRef = useRef<GestureState | null>(null);
  const timerRef = useRef<number | null>(null);
  const [axis, setAxis] = useState<DayDeckAxis | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [settling, setSettling] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [stageWidth, setStageWidth] = useState(360);

  useEffect(() => () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
  }, []);

  const visibleIndices = useMemo(
    () => visibleDayDeckIndices(currentIndex, total),
    [currentIndex, total],
  );
  const renderedOffset = diagnosticOffset ?? offset;
  const horizontalProgress = axis === "x" ? Math.min(1, Math.abs(renderedOffset.x) / Math.max(1, stageWidth)) : 0;
  const horizontalTarget = renderedOffset.x < 0 ? currentIndex + 1 : currentIndex - 1;

  function renderProgress(index: number) {
    return <span className="ds-day-cover__progress" aria-hidden="true">
      {Array.from({ length: total }, (_, segment) => {
        let strength = segment === index ? 1 : 0;
        if (index === currentIndex && horizontalProgress > 0 && horizontalTarget >= 0 && horizontalTarget < total) {
          if (segment === currentIndex) strength = 1 - horizontalProgress;
          if (segment === horizontalTarget) strength = horizontalProgress;
        }
        return <i key={segment} style={{ "--ds-segment-active": strength } as CSSProperties} />;
      })}
    </span>;
  }

  function reset(duration = reducedMotion ? 0 : deckMotion.settleDurationMs) {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    setSettling(duration > 0);
    setOffset({ x: 0, y: 0 });
    setAxis(null);
    setPressed(false);
    if (duration > 0) timerRef.current = window.setTimeout(() => setSettling(false), duration);
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (settling || !event.isPrimary) return;
    if (event.target instanceof Element && event.target.closest("button, a, input, select, textarea, [role='button']")) return;
    const now = performance.now();
    gestureRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      lastX: event.clientX,
      lastY: event.clientY,
      lastTime: now,
      velocityX: 0,
      velocityY: 0,
      offsetX: 0,
      offsetY: 0,
      axis: null,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    setStageWidth(event.currentTarget.clientWidth);
    setPressed(true);
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const gesture = gestureRef.current;
    if (!gesture || gesture.pointerId !== event.pointerId) return;
    const x = event.clientX - gesture.startX;
    const y = event.clientY - gesture.startY;
    if (!gesture.axis) {
      gesture.axis = resolveDayDeckAxis(x, y);
      setAxis(gesture.axis);
    }
    const now = performance.now();
    const elapsed = Math.max(1, now - gesture.lastTime);
    gesture.velocityX = (event.clientX - gesture.lastX) / elapsed;
    gesture.velocityY = (event.clientY - gesture.lastY) / elapsed;
    gesture.lastX = event.clientX;
    gesture.lastY = event.clientY;
    gesture.lastTime = now;
    if (gesture.axis === "x") {
      event.preventDefault();
      const atStart = currentIndex === 0 && x > 0;
      const atEnd = currentIndex === total - 1 && x < 0;
      gesture.offsetX = resistDayDeckEdge(x, atStart || atEnd);
      gesture.offsetY = 0;
      setOffset({ x: gesture.offsetX, y: 0 });
    } else if (gesture.axis === "y") {
      event.preventDefault();
      gesture.offsetX = 0;
      gesture.offsetY = y < 0 ? Math.max(-132, y) : resistDayDeckEdge(y, true);
      setOffset({ x: 0, y: gesture.offsetY });
    }
  }

  function finishPointer(event: PointerEvent<HTMLDivElement>) {
    const gesture = gestureRef.current;
    if (!gesture || gesture.pointerId !== event.pointerId) return;
    gestureRef.current = null;
    const resolved = gesture.axis ? resolveDayDeckGesture({
      axis: gesture.axis,
      currentIndex,
      total,
      offsetX: gesture.offsetX,
      offsetY: gesture.offsetY,
      velocityX: gesture.velocityX,
      velocityY: gesture.velocityY,
      width: stageWidth,
    }) : { index: currentIndex, open: false };
    if (resolved.open) {
      setPressed(false);
      setSettling(!reducedMotion);
      setOffset({ x: 0, y: reducedMotion ? 0 : -28 });
      timerRef.current = window.setTimeout(() => {
        setOffset({ x: 0, y: 0 });
        setSettling(false);
        setAxis(null);
        onOpenCurrent();
      }, reducedMotion ? 0 : deckMotion.settleDurationMs / 2);
      return;
    }
    if (resolved.index !== currentIndex) {
      const direction = resolved.index > currentIndex ? -1 : 1;
      const width = stageWidth;
      setPressed(false);
      setSettling(!reducedMotion);
      setOffset({ x: direction * width, y: 0 });
      timerRef.current = window.setTimeout(() => {
        onIndexChange(resolved.index);
        setSettling(false);
        setAxis(null);
        setOffset({ x: 0, y: 0 });
      }, reducedMotion ? 0 : deckMotion.settleDurationMs);
      return;
    }
    reset();
  }

  function cancelPointer(event: PointerEvent<HTMLDivElement>) {
    if (gestureRef.current?.pointerId !== event.pointerId) return;
    gestureRef.current = null;
    reset();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const next = event.key === "ArrowLeft" ? currentIndex - 1
      : event.key === "ArrowRight" ? currentIndex + 1
        : event.key === "Home" ? 0
          : event.key === "End" ? total - 1
            : null;
    if (next === null) return;
    event.preventDefault();
    onIndexChange(Math.max(0, Math.min(total - 1, next)));
  }

  return (
    <div className="ds-day-deck" data-axis={axis ?? "pending"} data-drag-progress={horizontalProgress.toFixed(3)} data-pressed={diagnosticPressed || pressed || undefined}>
      <div
        ref={stageRef}
        className={`ds-day-deck__stage${diagnosticSettling || settling ? " is-settling" : ""}`}
        role="region"
        aria-roledescription="deck"
        aria-label={label}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishPointer}
        onPointerCancel={cancelPointer}
      >
        {visibleIndices.map((index) => {
          const slot = index - currentIndex;
          const style = {
            transform: `translate3d(calc(${slot * 100}% + ${renderedOffset.x}px), ${index === currentIndex ? renderedOffset.y : 0}px, 0)`,
          } as CSSProperties;
          return <div className={`ds-day-deck__card${index === currentIndex ? " is-current" : ""}`} data-index={index} data-slot={slot} key={getItemKey?.(index) ?? index} style={style}>{renderItem(index, index === currentIndex, renderProgress(index))}</div>;
        })}
      </div>
    </div>
  );
}
