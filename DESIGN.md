# Design system

<!-- Generated after Match-radar desk finish pass. Seed 72c51568. -->

## World

**Match radar desk** — marketplace-green action energy in a freelancer / job-seeker application workspace. The home hero is an edge-to-edge desk photograph with a synthetic FIT SIGNAL radar dial. Operate screens inherit the same tokens with calmer density.

## Color

| Role | Value | Use |
|------|-------|-----|
| Ink / Navy | `#0b1f0c` | Text, dark bands |
| Accent | `#108a00` | Primary CTA, active nav |
| Accent soft | `#e4f5e2` | Soft fills |
| Surface | `#eef3ee` | Page ground |
| Panel | `#ffffff` | Forms, operate surfaces |
| Line | `#c9d6cb` | Borders / rules |

Light ambient office daylight. Accents committed on conversion actions.

## Typography

- Display: **Geologica**
- Body / UI: **Atkinson Hyperlegible**
- Mono: JetBrains Mono (code / measurement only)

## Layout & responsive

- Mobile-first: full-bleed hero (`100vw` breakout), photographic auth band above forms on small screens, 44px+ controls, bottom tab bar for all visitors.
- Desktop: hero remains edge-to-edge; auth can use split photography + form; content max-width `7xl`.
- Cards are for interactive units only — not icon+title+blurb grids as page structure.

## Motion

- Authored moment: radar sweep on FIT dials (`prefers-reduced-motion` disables).
- Page enter fades stay utility-quiet.

## Imagery

`frontend/public/images/`: `hero-desk.jpg`, `resume-work.jpg`, `apply-together.jpg`. Synthetic demo percentages must stay labeled.

## Components

`rf-*` primitives in `index.css` + `components/ui.jsx`. Accent buttons for primary conversion; navy for Operate emphasis.
