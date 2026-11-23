# SeatSync — design direction

This records the research and the decisions behind the redesign, so later changes stay
inside one system instead of drifting back into generic template styling.

## Research sources

- Skills installed globally with `npx skills add … -g -a opencode --copy`:
  - `frontend-design` from `anthropics/skills` (199k GitHub stars; 1.2M installs on skills.sh).
    Used for anti-slop checks: no all-caps eyebrows, middle-dot meta strings, arrow suffixes,
    gradient washes, or fade-in-on-every-section.
  - `web-design-guidelines` from `vercel-labs/agent-skills` (34.8k stars; 896k installs).
    Used for accessibility, focus states, form rules, reduced motion, touch targets, and theming.
  - `design-taste-frontend` from `Leonxlnx/taste-skill` (120k stars; anti-slop skill).
    Used for the deal: palette, type pairing, one section per screen, equal edges, quiet motion.
- `shadcn/ui` (128k stars): Tabs semantics and composition (`TabsList` → `TabsTrigger` →
  `TabsContent`), neutral/flat surfaces, one component system you own rather than override.
- Material Design 3 top app bar: 64 dp small bar, 56 dp on compact widths, leading identity,
  trailing actions, visible selected indicator, 44–48 dp touch targets.
- Uber's operational palette (black / white / signal green `#06C167`, amber `#FFC862`,
  red `#E11900`, blue `#276EF1`): status colours that mean something, used as accents on
  neutral surfaces, not as decoration.

## The plan (dealt with design-taste-frontend)

- **Kind:** software (campus operations tool), not a marketing brochure.
- **Palette:** `#0B0B0C` canvas, `#151517` surface, `#F4F4F5` ink, `#06C167` action.
  Light theme inverts to `#F4F4F5` / `#FFFFFF` / `#0B0B0C` / `#067A46`.
  Why: a desk-allocation tool borrows dispatch semantics — green available, amber held,
  red released — on a quiet neutral ground.
- **Type:** Mona Sans (display 500, text 400) + Geist Mono for desk codes and figures.
  Loaded from Google Fonts with preconnect and `display=swap`.
- **Layout:** 12-column grid, equal left/right edges, 64/56 px app bar, one section per
  screen on the landing page, four-column footer with a bottom line.
- **Motion:** one hero entrance, one stat-row moment, hover lift of 2 px on interactive
  things, immediate press feedback. No scroll reveals, no tilt, no glass, no card loops.
- **Copy:** sentence case, plain verbs, specific button labels ("View my bookings", not
  "Go"), no arrow suffix, no invented facts.

## Deliberate rejections

The previous build used frosted glass, 22 px radii on everything, all-caps eyebrows,
middle-dot meta strings, a white gradient primary button, blue glows, a tilt effect on the
pass, and a per-card fade-in. Those are the default generated-page look; all are removed.
