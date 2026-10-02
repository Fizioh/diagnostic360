import type { ReadinessDomain } from "../../domain/types";

export interface DomainAccent {
  chip: string;
  bar: string;
  initial: string;
}

const PALETTE: DomainAccent[] = [
  {
    chip: "border-neon-cyan/45 bg-neon-cyan/15 text-neon-cyan shadow-[0_0_10px_rgba(46,230,255,0.25)]",
    bar: "bg-neon-cyan shadow-[0_0_14px_rgba(46,230,255,0.5)]",
    initial: "R",
  },
  {
    chip: "border-neon-violet/45 bg-neon-violet/15 text-neon-violet shadow-[0_0_10px_rgba(180,140,255,0.25)]",
    bar: "bg-neon-violet shadow-[0_0_14px_rgba(180,140,255,0.45)]",
    initial: "P",
  },
  {
    chip: "border-neon-blue/45 bg-neon-blue/15 text-neon-blue shadow-[0_0_10px_rgba(77,159,255,0.25)]",
    bar: "bg-neon-blue shadow-[0_0_14px_rgba(77,159,255,0.45)]",
    initial: "S",
  },
  {
    chip: "border-neon-amber/45 bg-neon-amber/15 text-neon-amber shadow-[0_0_10px_rgba(255,184,77,0.2)]",
    bar: "bg-neon-amber shadow-[0_0_14px_rgba(255,184,77,0.4)]",
    initial: "A",
  },
  {
    chip: "border-neon-pink/45 bg-neon-pink/15 text-neon-pink shadow-[0_0_10px_rgba(255,110,180,0.2)]",
    bar: "bg-neon-pink shadow-[0_0_14px_rgba(255,110,180,0.4)]",
    initial: "D",
  },
  {
    chip: "border-signal/45 bg-signal/10 text-signal shadow-neon-green",
    bar: "bg-signal shadow-[0_0_14px_rgba(61,255,154,0.45)]",
    initial: "G",
  },
  {
    chip: "border-neon-cyan/35 bg-neon-cyan/10 text-neon-cyan",
    bar: "bg-neon-cyan/90",
    initial: "·",
  },
];

export function domainAccent(domain: ReadinessDomain, index: number): DomainAccent {
  const base = PALETTE[index % PALETTE.length];
  const letter = domain.slice(0, 1).toUpperCase();
  return { ...base, initial: letter === "·" ? base.initial : letter };
}
