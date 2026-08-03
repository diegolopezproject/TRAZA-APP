"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent, PointerEvent, ReactNode } from "react";
import { useReducedMotion } from "motion/react";

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

interface GestureState {
  pointerId: number;
  startX: number;
  startY: number;
  lastX: number;
  lastY: number;
  lastTime: number;
  velocityX: number;
  velocityY: number;
  axis: DayDeckAxis | null;
}

export interface DayDeckProps {
  total: number;
  currentIndex: number;
  label: string;
  renderItem: (index: number, active: boolean) => ReactNode;
  onIndexChange: (index: number) => void;
  onOpenCurrent: () => void;
}

const axisLockDistance = 10;

export function DayDeck({ total, currentIndex, label, renderItem, onIndexChange, onOpenCurrent }: DayDeckProps) {
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
    () => [currentIndex - 1, currentIndex, currentIndex + 1].filter((index) => index >= 0 && index < total),
    [currentIndex, total],
  );
  const dragProgress = Math.min(1, Math.abs(offset.x) / Math.max(1, stageWidth));
  const incomingIndex = offset.x < 0 ? currentIndex + 1 : offset.x > 0 ? currentIndex - 1 : currentIndex;

  function reset(duration = reducedMotion ? 0 : 220) {
    setSettling(duration > 0);
    setOffset({ x: 0, y: 0 });
    setAxis(null);
    setPressed(false);
    if (duration > 0) timerRef.current = window.setTimeout(() => setSettling(false), duration);
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (settling || !event.isPrimary) return;
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
    if (!gesture.axis && Math.hypot(x, y) >= axisLockDistance) {
      gesture.axis = Math.abs(x) >= Math.abs(y) ? "x" : "y";
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
      setOffset({ x: atStart || atEnd ? x * .2 : x, y: 0 });
    } else if (gesture.axis === "y") {
      event.preventDefault();
      setOffset({ x: 0, y: y < 0 ? Math.max(-132, y) : y * .14 });
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
      offsetX: offset.x,
      offsetY: offset.y,
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
      }, reducedMotion ? 0 : 120);
      return;
    }
    if (resolved.index !== currentIndex) {
      const direction = resolved.index > currentIndex ? -1 : 1;
      const width = stageWidth;
      setPressed(false);
      setSettling(!reducedMotion);
      setOffset({ x: direction * (width + 12), y: 0 });
      timerRef.current = window.setTimeout(() => {
        onIndexChange(resolved.index);
        setSettling(false);
        setAxis(null);
        setOffset({ x: 0, y: 0 });
      }, reducedMotion ? 0 : 220);
      return;
    }
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
    <div className="ds-day-deck" data-axis={axis ?? "pending"} data-pressed={pressed || undefined}>
      <div
        ref={stageRef}
        className={`ds-day-deck__stage${settling ? " is-settling" : ""}`}
        role="region"
        aria-roledescription="deck"
        aria-label={label}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishPointer}
        onPointerCancel={finishPointer}
      >
        {visibleIndices.map((index) => {
          const slot = index - currentIndex;
          const style = {
            transform: `translate3d(calc(${slot * 100}% + ${slot * 12}px + ${offset.x}px), ${index === currentIndex ? offset.y : 0}px, 0)`,
          } as CSSProperties;
          return <div className={`ds-day-deck__card${index === currentIndex ? " is-current" : ""}`} data-index={index} data-slot={slot} key={index} style={style}>{renderItem(index, index === currentIndex)}</div>;
        })}
      </div>
      <div className="ds-day-deck__indicator" role="progressbar" aria-label={`${currentIndex + 1} de ${total}`} aria-valuemin={1} aria-valuemax={total} aria-valuenow={currentIndex + 1}>
        {Array.from({ length: total }, (_, index) => {
          const active = index === currentIndex;
          const incoming = index === incomingIndex && incomingIndex !== currentIndex;
          const scale = active ? 1 + dragProgress * .22 : incoming ? .78 + dragProgress * .22 : .78;
          return <span key={index} className={`${active ? "is-active" : ""}${incoming ? " is-incoming" : ""}`} style={{ "--segment-scale": scale, "--segment-progress": dragProgress } as CSSProperties} />;
        })}
      </div>
    </div>
  );
}
