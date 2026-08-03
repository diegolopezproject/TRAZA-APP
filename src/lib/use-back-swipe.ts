"use client";

import { animate, useMotionValue, useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";
import type { PointerEventHandler } from "react";
import { backSwipeMotion } from "./motion";

export interface BackSwipeGesture {
  distance: number;
  velocity: number;
  width: number;
}

export function resolvesBackSwipe({ distance, velocity, width }: BackSwipeGesture): boolean {
  return distance >= Math.min(112, width * .28) || (distance >= 40 && velocity >= .5);
}

interface ActiveGesture {
  pointerId: number;
  startX: number;
  startY: number;
  lastX: number;
  lastTime: number;
  velocity: number;
  horizontal: boolean | null;
}

export function useBackSwipe(onBack: () => void) {
  const x = useMotionValue(0);
  const reducedMotion = useReducedMotion();
  const gestureRef = useRef<ActiveGesture | null>(null);
  const committedRef = useRef(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
  }, []);

  const onPointerDown: PointerEventHandler<HTMLDivElement> = (event) => {
    if (!event.isPrimary || committedRef.current) return;
    const now = performance.now();
    gestureRef.current = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, lastX: event.clientX, lastTime: now, velocity: 0, horizontal: null };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove: PointerEventHandler<HTMLDivElement> = (event) => {
    const gesture = gestureRef.current;
    if (!gesture || gesture.pointerId !== event.pointerId) return;
    const dx = Math.max(0, event.clientX - gesture.startX);
    const dy = event.clientY - gesture.startY;
    if (gesture.horizontal === null && Math.hypot(dx, dy) >= 8) gesture.horizontal = dx > Math.abs(dy);
    if (!gesture.horizontal) return;
    event.preventDefault();
    const now = performance.now();
    gesture.velocity = (event.clientX - gesture.lastX) / Math.max(1, now - gesture.lastTime);
    gesture.lastX = event.clientX;
    gesture.lastTime = now;
    x.set(Math.min(window.innerWidth * .86, dx));
  };

  const finish: PointerEventHandler<HTMLDivElement> = (event) => {
    const gesture = gestureRef.current;
    if (!gesture || gesture.pointerId !== event.pointerId) return;
    gestureRef.current = null;
    const distance = x.get();
    if (gesture.horizontal && resolvesBackSwipe({ distance, velocity: gesture.velocity, width: window.innerWidth })) {
      committedRef.current = true;
      if (reducedMotion) {
        x.set(0);
        committedRef.current = false;
        onBack();
      } else {
        animate(x, window.innerWidth, backSwipeMotion.complete);
        timerRef.current = window.setTimeout(() => {
          x.set(0);
          committedRef.current = false;
          onBack();
        }, backSwipeMotion.complete.duration * 1000);
      }
      return;
    }
    animate(x, 0, reducedMotion ? { duration: 0 } : backSwipeMotion.cancel);
  };

  const cancel: PointerEventHandler<HTMLDivElement> = () => {
    gestureRef.current = null;
    animate(x, 0, reducedMotion ? { duration: 0 } : backSwipeMotion.cancel);
  };

  return { x, zoneProps: { onPointerDown, onPointerMove, onPointerUp: finish, onPointerCancel: cancel } };
}
