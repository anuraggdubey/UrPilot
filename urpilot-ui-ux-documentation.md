# UrPilot — Frontend UI/UX Documentation
### Design System & Page-by-Page Specification
*Companion to `urpilot-technical-documentation.md`. Last verified: July 22, 2026.*

---

## 0. Design Direction

The reference (Bantér Club) works because every element is doing one job with no
decoration: hairline borders instead of shadows, flat fills instead of gradients, a
bold condensed display face for anything that needs to command attention, and a
tiny set of accent colors used sparingly. That's the exact language this doc ports
over — not the cycling imagery, the *system*: flat surfaces, square-cornered cards,
pill-shaped primary buttons, black hairline rules, one confident accent color doing
the "this is active" job.

The gap to close: the reference is a marketing site with room to breathe. UrPilot's
primary surface is a **352px-wide side panel** — a voice console, not a storefront.
So the system below keeps the reference's flatness and type confidence but drops
anything that needs horizontal room (multi-column hero grids, large photography
blocks) and replaces it with what a voice UI actually needs: a state-driven mic
button, a live transcript strip, and calm, legible answer cards.

**Signature element:** the **mic button** is this product's one moment of boldness —
a large flat circle that changes fill color by state (idle / listening / thinking)
with a soft pulse ring, echoing the reference's circular arrow-nav buttons. Every
other component stays quiet and disciplined around it.

---

## 1. Design Tokens

### 1.1 Color

| Token | Hex | Used for |
|---|---|---|
| `--color-cream` | `#F5F0E6` | Base background, side panel + options page |
| `--color-ink` | `#17160F` | Primary text, borders, icons |
| `--color-ink-soft` | `#5C594C` | Secondary text, captions, placeholder |
| `--color-surface` | `#FFFFFF` | Card fills, input fills |
| `--color-mustard` | `#EFB92E` | Primary accent — mic idle/ready, primary buttons |
| `--color-mustard-deep` | `#C9950F` | Primary button hover/active fill |
| `--color-olive` | `#454F32` | Secondary accent — success, saved, "on" states |
| `--color-coral` | `#C1452B` | Listening/recording indicator, destructive actions, live badges |
| `--color-line` | `#17160F` at 12% | Hairline dividers on cream |
| `--color-line-strong` | `#17160F` at 100%, 1px | Card/button borders |

Only mustard, olive, and coral are "live" colors — never mix them decoratively.
Each maps to exactly one meaning (primary / positive / attention) everywhere in
the product, so a user learns the vocabulary once.

### 1.2 Typography

| Role | Face | Notes |
|---|---|---|
| Display | **Archivo Expanded**, 700–800 weight | Panel headers, empty-state headlines, section titles. Tight tracking, all-caps for short labels only (e.g. "LISTENING"), sentence case for headlines. |
| Body / UI | **Inter**, 400–600 weight | Buttons, list items, form labels, transcript text |
| Mono (optional) | **IBM Plex Mono**, 400 | URLs, site-template variables (`{q}`), timestamps in history |

Type scale (side panel, 352px canvas):

| Token | Size / line-height | Use |
|---|---|---|
| `display-lg` | 28px / 32px | Options-page section headers only (more room there) |
| `display-md` | 20px / 24px | Side panel state headline ("Listening…", "Here's what I found") |
| `body-md` | 15px / 22px | Transcript text, list item labels |
| `body-sm` | 13px / 18px | Secondary text, timestamps, helper copy |
| `label-xs` | 11px / 14px, uppercase, +0.06em tracking | Eyebrows: "SAVED LINKS", "SITE TEMPLATES", status chips |

### 1.3 Shape, Spacing, Elevation

- **Border radius: 0 by default.** The only rounded shapes in the system are the
  mic button (circle), status/badge pills (`radius: 999px`, matching the
  reference's "MID-YEAR SALE" and "Shop Now" pills), and toggle switches.
  Everything else — cards, inputs, panels — stays square-cornered flat, matching
  the reference's product cards and nav blocks.
- **No drop shadows, anywhere.** Depth is communicated with a 1px `--color-line-strong`
  border and, where needed, a solid background color shift — never blur/shadow.
- **Spacing scale:** 4 / 8 / 12 / 16 / 24 / 32px. Side panel content sits in a
  16px gutter; options page uses a 32px gutter.
- **Dividers:** 1px hairline (`--color-line`), full-bleed, used between list rows
  instead of card shadows — directly borrowed from the reference's use of rules
  between nav items and footer columns.

### 1.4 Motion

Flat doesn't mean static — buttons and cards get purposeful, cheap animations
(no shadows or blur, just color/transform), specified fully in §4.

---

## 2. Component Library

### 2.1 Buttons

**Primary (flat fill, pill)** — the "Shop Now" equivalent.
```
Default:  bg mustard, text ink, 1px ink border, radius 999px, weight 600
Hover:    bg mustard-deep, translateY(-1px)
Active:   translateY(0), bg mustard-deep
Focus:    2px ink outline, 2px offset
```
Used for: the one primary action per screen — "Start listening," "Save link,"
"Add template."

**Secondary (flat outline, square)**
```
Default:  bg transparent, text ink, 1px ink border, radius 0
Hover:    bg ink, text cream (full invert — same trick the reference uses on its
          circular arrow-nav buttons and footer nav pills)
Active:   bg ink-soft
```
Used for: "Cancel," "Edit," "Open options."

**Icon button (circular, borderless)**
```
Default:  40×40px circle, bg transparent, icon ink
Hover:    bg ink at 8%, icon unchanged
Active:   bg ink at 14%, scale(0.96)
```
Used for: mic toggle (small variant in header), close, delete-row (×), reorder handle.

**Destructive text button**
```
Default:  text coral, underline on hover only (underline slides in left→right,
          120ms) — no border, no fill; reserved for "Remove," "Clear history"
```

### 2.2 Cards

Flat, square-cornered, 1px ink border, white fill on cream background —
directly matching the reference's flat product cards (no shadow, no radius,
image/content on a plain surface with a thin rule separating it from price/label).

```
.card {
  background: var(--color-surface);
  border: 1px solid var(--color-line-strong);
  border-radius: 0;
  padding: 12px;
}
.card:hover {           /* only on interactive cards (saved links, templates) */
  transform: translate(-2px, -2px);
  box-shadow: 2px 2px 0 var(--color-ink);  /* hard offset shadow, not blur —
                                               reads as flat/graphic, not depth */
}
```

That hard offset-shadow-on-hover is the one "shadow-like" effect permitted in the
system — it's a flat graphic device (like a printed sticker lifting), not a soft
elevation shadow, and it echoes the reference's die-cut sticker treatment on the
"MID-YEAR SALE" badge.

**List-row card** (saved links, site templates, history): same flat card, but
full-width, content laid out in a single row — label left, meta center, actions
right, drag handle far left. Rows separate by hairline divider instead of
individual card borders when stacked, to avoid visual noise in a 352px panel.

### 2.3 Inputs

```
Default:  bg surface, 1px ink border, radius 0, padding 10px 12px
Focus:    border becomes 2px mustard-deep, no glow/shadow
Error:    border 2px coral, helper text below in coral, body-sm
Disabled: bg cream, text ink-soft, border ink at 30%
```

### 2.4 Toggle / Switch

Used for: push-to-talk vs. always-listen (future), TTS auto-play on/off.
```
Track: 36×20px, radius 999px, bg ink-soft (off) / olive (on)
Thumb: 16px circle, cream, no shadow, slides with 150ms ease-out
```

### 2.5 Badges / Status Pills

Matches the reference's black "MID-YEAR SALE" pill and card price tags.
```
.badge { radius: 999px; padding: 2px 10px; font: label-xs; border: 1px solid ink; }
--listening   → bg coral,   text cream   ("● LIVE")
--saved       → bg olive,   text cream   ("SAVED")
--idle        → bg transparent, text ink-soft
```

### 2.6 Mic Button (signature component)

The one large-scale, high-confidence shape in the whole product — see §4.2 for
full state spec.

### 2.7 Transcript / Caption Strip

Full-width strip pinned above the mic button. Not a chat bubble (no radius, no
tail) — a flat cream-on-ink or ink-on-cream text band, matching the reference's
flat marquee ticker ("PERFORMANCE JERSEYS • FREE SHIPPING…") in spirit: plain
text on a solid flat field, no card chrome.
```
Interim transcript: text ink-soft, italic, opacity 0.7
Final transcript:   text ink, weight 500
```

### 2.8 Header / Nav Bar

Side panel header: flat ink bar (matches reference's black top nav strip), 44px
tall, logo mark left, settings icon-button right. Options page: same ink bar,
full width, with the section nav (Saved Links / Site Templates / Settings) as
flat text tabs with a 2px mustard underline on the active tab — no pill, no
rounded tab shape, matching the reference's flat black nav pills at the footer.

---

## 3. Page-by-Page Specification

### 3.1 Side Panel — Idle State (default view)

```
┌─────────────────────────────────┐
│ ▣ URPILOT                    ⚙ │  ← ink header bar
├─────────────────────────────────┤
│                                   │
│         "Ready when you          │  ← display-md, centered
│          are."                   │
│                                   │
│        ┌───────────┐             │
│        │           │             │
│        │     ●     │             │  ← mic button, mustard, idle
│        │           │             │
│        └───────────┘             │
│                                   │
│   Ctrl+Shift+L or tap to talk    │  ← body-sm, ink-soft
│                                   │
├─────────────────────────────────┤
│ QUICK ACTIONS                    │  ← label-xs eyebrow
│ ▢ Open my stuff                  │  ← flat list-row card
│ ▢ Search on YouTube               │
│ ▢ Search the web                  │
└─────────────────────────────────┘
```
- Quick Actions list: flat cards, one per configured shortcut, tapping executes
  the same action voice would (accessibility + discoverability — a user
  shouldn't need to already know the voice commands).
- Empty state (no saved links yet): card replaced with a single dashed-border
  flat card: "No saved links yet — add some in Settings" + secondary button.

### 3.2 Side Panel — Listening State

- Header badge appears: `--listening` coral pill, "● LIVE", pulsing opacity
  (not scale — scale reads as bouncy/playful, opacity pulse reads as calm signal).
- Mic button fill switches mustard → coral, ring pulse animation starts (§4.2).
- Transcript strip slides up from behind the mic button (200ms ease-out),
  showing interim results updating in place.
- Headline changes to "Listening…" (display-md).
- A flat square "Stop" icon button (not the mic itself) appears bottom-right for
  explicit stop, since voice-only stop control is a bad accessibility pattern.

### 3.3 Side Panel — Processing / Searching State

- Mic button freezes on coral, ring pulse replaced by a flat 3-dot loader using
  the same ink-on-mustard tokens (no spinner circle — square-cornered dots
  ticking left-to-right, on-brand with the flat aesthetic).
- Headline: "Searching…" / "Reading the page…" / "Thinking…" depending on which
  backend call is in flight — always tell the user *which* step, never a bare
  "Loading."
- If the flow is chained (search → navigate → summarize), show a flat 3-step
  progress rail at the top: `Search ── Open ── Summarize`, each step's label
  filling ink-on-mustard as it completes. This is the one place a numbered /
  sequential marker earns its place — it's a real 3-step pipeline the user
  asked for in one sentence, not decoration.

### 3.4 Side Panel — Summary / Answer View

```
┌─────────────────────────────────┐
│ ▣ URPILOT                    ⚙ │
├─────────────────────────────────┤
│ ↳ stellar.org/docs/soroban       │  ← source line, mono, ink-soft, truncated
├─────────────────────────────────┤
│ Deploying a Soroban contract      │  ← display-md
│                                   │
│ 1. Install the Soroban CLI...     │  ← body-md, flat card, no radius
│ 2. Build with `soroban contract   │
│    build`...                      │
│ 3. Deploy to testnet with...      │
│                                   │
├─────────────────────────────────┤
│ [ ▸ Read aloud ]  [ Copy ]  [ ↻ ]│  ← primary pill + 2 secondary buttons
└─────────────────────────────────┘
```
- Summary renders as flat card(s), numbered steps only when the source content
  is genuinely sequential (a how-to) — a plain paragraph summary skips numbering
  entirely, per the same "don't decorate with structure that isn't real" rule.
- "Read aloud" is the primary pill button; while TTS is playing it becomes
  "■ Stop" with the mustard fill swapped to olive (borrowing the reference's
  green "in stock / confirmed" association) so playing vs. idle is legible at a
  glance without reading the label.
- Source line always visible and clickable (re-opens the tab) — never hide
  where an answer came from.

### 3.5 Side Panel — Error / Empty States

Flat card, coral 2px top border only (not full border — keeps it calm rather
than alarming), ink text:
```
Couldn't reach the search API.
Check your connection and try again.
[ Retry ]
```
- No apologetic copy ("Oops!", "Sorry!"). State what happened and the one next
  action, per the interface's own voice.
- Mic-permission-denied state gets its own full-panel flat illustration-free
  card (icon + headline + "Open Chrome settings" secondary button) — this is
  the single most common first-run failure and deserves a dedicated screen, not
  a generic error card.

### 3.6 Options Page — Saved Links ("Open My Stuff")

Full browser-tab width, 32px gutter, options-page header bar with flat text
tabs (§2.8).

```
SAVED LINKS                                    [ + Add link ]
─────────────────────────────────────────────────────────────
⠿  GitHub          github.com                      ✎  ×
⠿  Stellar Docs     stellar.org/docs                ✎  ×
⠿  Figma            figma.com                       ✎  ×
─────────────────────────────────────────────────────────────
Say "open my stuff" to launch all of these at once.
```
- Rows are flat list-row cards, drag handle (⠿) left for reordering — reorder
  updates the `order` field live via `chrome.storage.sync`, no separate "Save"
  button (this list is small and low-risk; save-on-change is correct here).
- "+ Add link" opens an inline flat-card form (label + URL fields) directly in
  the list, not a modal — keeps everything on one flat surface, no overlay
  chrome, consistent with "no shadows/blur" rule (modals need a scrim, which
  reads as elevation).
- Delete (×) is a destructive icon button; requires a second confirm tap
  (button label flips to "Confirm ×" for 3 seconds) rather than a modal dialog.

### 3.7 Options Page — Site Search Templates

Same layout pattern as 3.6, one difference: each row shows the editable URL
template with `{q}` in mono type, visually flagged with a mustard background
highlight on just that token, so users editing custom templates immediately see
what part is the variable.
```
YouTube     youtube.com/results?search_query={q}       ✎  ×
GitHub      github.com/search?q={q}                     ✎  ×
```
Defaults ship pre-filled (per tech doc §5.3) and are marked with a small
`label-xs` "DEFAULT" tag — resettable via a secondary button if a user edits
one and wants it back.

### 3.8 Options Page — Settings

Grouped flat cards, one per settings domain, each with a `label-xs` eyebrow:

- **VOICE** — push-to-talk shortcut display/edit, auto-restart-on-silence toggle
- **PLAYBACK** — auto-read summaries toggle, playback speed (flat segmented
  control: `1×  1.25×  1.5×`, square buttons, active segment mustard-filled —
  same visual pattern as the reference's flat pagination dots, just square)
- **MODEL** — read-only display of active Groq model + a link to swap it (Phase
  2, if exposed to end users)
- **ACCOUNT** (Phase 2 only, hidden until Supabase auth ships) — sign-in state,
  sync status

### 3.9 First-Run Onboarding

Three flat full-panel screens, dot-progress at bottom (square dots, not
circles, per the shape rule — active dot mustard-filled, others ink-outline
only):

1. **Welcome** — display-lg headline, one-sentence description of the product,
   primary pill "Get started."
2. **Mic permission** — explains *why* (per tech doc §11 checklist: "UrPilot
   listens only when you press the shortcut or tap the mic — never in the
   background"), primary pill triggers the actual browser permission prompt.
3. **Add your first link** — inline form straight from §3.6, so onboarding ends
   with the user already having configured one real thing rather than an empty
   product.

---

## 4. Motion & Micro-interaction Spec

Every animation in this system is a **flat color, position, or opacity change**
— never blur, glow, or soft shadow, keeping motion consistent with the flat
visual language.

### 4.1 Shared timing tokens

| Token | Duration | Easing | Use |
|---|---|---|---|
| `fast` | 100ms | ease-out | Icon button press, checkbox/toggle |
| `base` | 150–200ms | ease-out | Button hover, card hover-lift, tab underline |
| `slow` | 250–300ms | ease-in-out | Transcript strip slide-in, panel state transitions |

### 4.2 Mic button states

```
Idle:       fill mustard, 1px ink ring, no animation (calm, waiting)
Hover:      fill mustard-deep, scale(1.03)
Listening:  fill coral, outer ring opacity-pulses 0.4↔1 over 1.2s, looped
Processing: fill coral (held), 3-dot flat loader replaces the icon
Speaking:   fill olive, icon swaps to a flat equalizer glyph (3 static bars of
            different heights — not animated, to avoid motion competing with
            the audio itself)
```

### 4.3 Buttons

- Primary pill: `translateY(-1px)` + fill deepen on hover, `translateY(0)` on
  press — a tactile "press down" read with zero shadow.
- Secondary outline: full color invert on hover (150ms), directly reusing the
  reference's circular-arrow-button treatment.
- Destructive text: underline draws in left-to-right on hover only.

### 4.4 Cards

- Interactive list-row/card hover: `translate(-2px,-2px)` + hard 2px offset
  ink shadow appears (see §2.2) — this is the one "sticker lift" moment in the
  whole system, used consistently everywhere a card is clickable.
- Non-interactive cards (summary text, transcript) never animate on hover —
  reserving motion for actionable elements keeps it meaningful.

### 4.5 Page/state transitions

Side panel state changes (idle → listening → processing → summary) cross-fade
+ 8px vertical slide, 200ms — no full-panel wipe/slide, since the panel is
narrow and large horizontal motion feels janky at that width.

### 4.6 Reduced motion

`prefers-reduced-motion: reduce` → replace the mic pulse ring with a static
coral fill + the "● LIVE" badge alone carries the listening signal; all
translate/scale transitions collapse to opacity-only.

---

## 5. Iconography

Single stroke-weight (1.5px) line icon set, square line-caps (not rounded) to
match the flat/square-cornered system — recommend **Lucide** (already available
if a React icon library is wanted) with stroke width overridden to 1.5.

Core set needed: mic, mic-off, settings (gear), plus, pencil (edit), x (delete),
grip-vertical (drag handle), external-link, copy, play, square (stop),
chevron-down (accordion), check.

---

## 6. Accessibility Checklist

- [ ] Mic button reachable and toggleable via keyboard (`Ctrl+Shift+L`) in
      addition to click — never voice-only or mouse-only.
- [ ] All state changes (listening/processing/error) are conveyed by more than
      color alone — badge text + icon change accompany every color shift.
- [ ] Visible 2px focus outline on every interactive element (buttons, list
      rows, tabs, toggle) — no `outline: none` without a replacement.
- [ ] Color contrast: ink (`#17160F`) on cream (`#F5F0E6`) and surface white
      both clear WCAG AA for body text; mustard is used only for large text
      (18px+) or as a fill behind ink text, never as small text on cream.
- [ ] Transcript strip and summary view are screen-reader-announced via
      `aria-live="polite"` (interim) and `aria-live="assertive"` (final
      transcript / new summary arriving).
- [ ] `prefers-reduced-motion` respected per §4.6.
- [ ] Destructive actions (delete link/template) require the two-tap confirm
      pattern (§3.6), never a silent single click.

---

## 7. Layout & Responsive Notes

| Surface | Width | Notes |
|---|---|---|
| Side panel | Fixed 352px (Chrome side panel default) | Single column throughout, 16px gutter |
| Options page | Fluid, max-width 880px, centered | 2-column layout above 640px (nav rail left, content right); collapses to stacked flat tabs below 640px |
| Offscreen doc | No UI | N/A — not rendered, headless speech recognition only |

---

## 8. Implementation Notes (Tailwind mapping)

Since the stack (per tech doc §3) is Tailwind CSS, tokens above map directly
into `tailwind.config.ts`:

```ts
export default {
  theme: {
    extend: {
      colors: {
        cream: '#F5F0E6',
        ink: '#17160F',
        'ink-soft': '#5C594C',
        surface: '#FFFFFF',
        mustard: { DEFAULT: '#EFB92E', deep: '#C9950F' },
        olive: '#454F32',
        coral: '#C1452B',
      },
      borderRadius: {
        DEFAULT: '0px',   // flat by default — opt into 'full' explicitly
      },
      fontFamily: {
        display: ['"Archivo Expanded"', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      boxShadow: {
        flat: '2px 2px 0 0 #17160F',   // the one permitted "shadow" — hard offset, no blur
      },
    },
  },
};
```

Set `borderRadius.DEFAULT` to `0px` globally so every unstyled element defaults
flat, and only components explicitly using `rounded-full` (mic button, pills,
toggle) break that rule — this keeps the "flat by default" decision enforced at
the config level rather than relying on every component remembering it.

---

## 9. Open Decisions for You

1. **Display face** — Archivo Expanded is the working recommendation (free,
   Google Fonts, close cousin of the reference's condensed grotesk). Flag if
   you'd rather match even closer with a paid face like Neue Haas Grotesk.
2. **Mic pulse vs. static** — the listening-state pulse ring is a small motion
   exception to an otherwise very calm system; happy to make it fully static
   (badge-only signal) if you want zero ambient animation.
3. **Options page 2-column nav rail vs. flat top tabs everywhere** — defaulted
   to a rail above 640px since the page has three real sections; a single
   long-scroll page with flat top tabs throughout is a simpler alternative if
   you'd rather not build a second nav pattern.
