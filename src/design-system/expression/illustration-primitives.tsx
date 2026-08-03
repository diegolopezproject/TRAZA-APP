import { useId } from "react";
import type { ReactNode, SVGProps } from "react";

export function BuildingBlock({ x, y, width, height, ...props }: SVGProps<SVGRectElement> & { x: number; y: number; width: number; height: number }) { return <rect x={x} y={y} width={width} height={height} rx="3" {...props} />; }
export function ArchBlock({ x, y, width, height, ...props }: SVGProps<SVGPathElement> & { x: number; y: number; width: number; height: number }) { return <path d={`M${x} ${y + height}V${y + height / 2}Q${x + width / 2} ${y} ${x + width} ${y + height / 2}V${y + height}Z`} {...props} />; }
export function DomeBlock({ cx, cy, radius, ...props }: SVGProps<SVGPathElement> & { cx: number; cy: number; radius: number }) { return <path d={`M${cx - radius} ${cy}A${radius} ${radius} 0 0 1 ${cx + radius} ${cy}Z`} {...props} />; }
export function BridgeBlock({ x, y, width, height, ...props }: SVGProps<SVGPathElement> & { x: number; y: number; width: number; height: number }) { return <path d={`M${x} ${y + height}V${y}H${x + width}V${y + height}M${x} ${y + height / 2}Q${x + width / 2} ${y + height} ${x + width} ${y + height / 2}`} fill="none" {...props} />; }
export function RouteLine(props: SVGProps<SVGPathElement>) { return <path pathLength="1" fill="none" strokeLinecap="round" strokeDasharray="1" {...props} />; }
export function EditorialShape(props: SVGProps<SVGPathElement>) { return <path {...props} />; }
export function WindowGrid({ x, y, columns, rows, gap = 18 }: { x: number; y: number; columns: number; rows: number; gap?: number }) { return <g>{Array.from({ length: columns * rows }, (_, index) => <rect key={index} x={x + index % columns * gap} y={y + Math.floor(index / columns) * gap} width="7" height="9" rx="2" />)}</g>; }
export function Skyline({ children, ...props }: SVGProps<SVGGElement>) { return <g {...props}>{children}</g>; }
export function TheatreFrame({ x, y, width, height, ...props }: SVGProps<SVGPathElement> & { x: number; y: number; width: number; height: number }) { return <path d={`M${x} ${y + height}V${y}H${x + width}V${y + height}M${x + width * .18} ${y + height}V${y + height * .28}M${x + width * .82} ${y + height}V${y + height * .28}`} {...props} />; }
export function TransportLine(props: SVGProps<SVGPathElement>) { return <RouteLine {...props} />; }
export function LightMarker(props: SVGProps<SVGCircleElement>) { return <circle r="8" {...props} />; }

export function GrainTexture({ children, seed = 7 }: { children: ReactNode; seed?: number }) { const id = useId().replaceAll(":", ""); return <><defs><filter id={id} x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".72" numOctaves="2" seed={seed} result="noise" /><feComposite in="noise" in2="SourceGraphic" operator="in" result="texture" /><feBlend in="SourceGraphic" in2="texture" mode="multiply" /></filter></defs><g filter={`url(#${id})`}>{children}</g></>; }
