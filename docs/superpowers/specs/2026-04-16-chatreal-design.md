# ChatReal Design System — "Precision Warmth"

**Date:** 2026-04-16
**Status:** Approved
**Version:** 1.0

---

## 1. Concept & Vision

ChatReal is redesigned as an enterprise-grade real-time communication application that embodies **"Precision Warmth"** — the intersection of Linear's precise, dark, high-contrast DNA and Notion's warmth and editorial personality. The result is a dark-first chat application that feels technically sophisticated AND human: not cold, not clinical, but warm precision.

This is a portfolio piece designed for award recognition (Awwwards, Webby, Red Dot) and job application showcase. Every interaction should feel intentional, every visual detail should reward attention.

---

## 2. Design Language

### 2.1 Aesthetic Direction

**Reference:** Linear.app meets Notion — precise geometry with humanist warmth.

**Character:** Technical sophistication with warmth. Dark, rich surfaces with violet accents. Editorial typography hierarchy. Micro-interactions that feel satisfying and refined.

### 2.2 Color Palette

#### Dark Mode (Primary)

| Token | Value | Usage |
|-------|-------|-------|
| `--color-base` | `#0A0A0B` | Primary background |
| `--color-elevated` | `#141417` | Panels, cards, sidebars |
| `--color-surface` | `#1C1C21` | Hover states, input backgrounds |
| `--color-border-subtle` | `rgba(255, 255, 255, 0.06)` | Dividers, subtle separations |
| `--color-border-visible` | `rgba(255, 255, 255, 0.12)` | Visible borders, card outlines |
| `--color-accent` | `#8B5CF6` | Primary actions, links, highlights |
| `--color-accent-hover` | `#7C3AED` | Accent hover state |
| `--color-accent-gradient` | `linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)` | Gradient buttons, glows |
| `--color-text-primary` | `#FAFAFA` | Primary text, headings |
| `--color-text-secondary` | `#A1A1AA` | Secondary text, descriptions |
| `--color-text-muted` | `#71717A` | Timestamps, placeholders |
| `--color-success` | `#22C55E` | Online status, success states |
| `--color-warning` | `#F59E0B` | Away status, warnings |
| `--color-error` | `#EF4444` | Busy status, errors |
| `--color-presence-online` | `#22C55E` | User online |
| `--color-presence-away` | `#F59E0B` | User away |
| `--color-presence-busy` | `#EF4444` | User do not disturb |
| `--color-presence-offline` | `#71717A` | User offline |

#### Light Mode (Secondary)

| Token | Value | Usage |
|-------|-------|-------|
| `--color-base` | `#FAFAFA` | Primary background |
| `--color-elevated` | `#FFFFFF` | Panels, cards, sidebars |
| `--color-surface` | `#F4F4F5` | Hover states, input backgrounds |
| `--color-border-subtle` | `rgba(0, 0, 0, 0.04)` | Dividers, subtle separations |
| `--color-border-visible` | `rgba(0, 0, 0, 0.08)` | Visible borders, card outlines |
| `--color-accent` | `#7C3AED` | Primary actions (deeper violet for contrast) |
| `--color-accent-hover` | `#6D28D9` | Accent hover state |
| `--color-accent-gradient` | `linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)` | Gradient buttons, glows |
| `--color-text-primary` | `#18181B` | Primary text, headings |
| `--color-text-secondary` | `#52525B` | Secondary text, descriptions |
| `--color-text-muted` | `#A1A1AA` | Timestamps, placeholders |

### 2.3 Typography

**Font Family:** Geist (primary)
**Fallback Stack:** `Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`

| Token | Size | Line Height | Weight | Usage |
|-------|------|-------------|--------|-------|
| `--text-xs` | 11px | 1.4 | 400 | Timestamps, badges |
| `--text-sm` | 13px | 1.5 | 400/500 | Secondary text, metadata |
| `--text-base` | 15px | 1.6 | 400 | Body text, messages |
| `--text-lg` | 18px | 1.4 | 500/600 | Channel names, section headers |
| `--text-xl` | 22px | 1.3 | 600 | Screen titles |
| `--text-2xl` | 28px | 1.2 | 600 | Hero headings (auth screen) |
| `--text-3xl` | 36px | 1.1 | 700 | Display text |

**Font Weights:**
- `--font-normal`: 400
- `--font-medium`: 500
- `--font-semibold`: 600
- `--font-bold`: 700

### 2.4 Spacing System

Base unit: 4px

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | 4px | Tight spacing |
| `--space-2` | 8px | Small gaps |
| `--space-3` | 12px | Inner padding (small) |
| `--space-4` | 16px | Default padding |
| `--space-5` | 20px | Comfortable padding |
| `--space-6` | 24px | Section spacing |
| `--space-8` | 32px | Large gaps |
| `--space-10` | 40px | XL spacing |
| `--space-12` | 48px | XXL spacing |
| `--space-16` | 64px | Screen padding |
| `--space-20` | 80px | Hero spacing |

**Component Padding Rhythm:**
- Compact (badges, tags): `4px 8px`
- Default (inputs, buttons): `10px 16px`
- Comfortable (cards, panels): `16px 20px`
- Spacious (screen sections): `24px 32px`

### 2.5 Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 6px | Tags, small badges |
| `--radius-md` | 10px | Buttons, inputs, small cards |
| `--radius-lg` | 16px | Message bubbles, panels |
| `--radius-xl` | 24px | Modals, large overlays |
| `--radius-full` | 9999px | Avatars, pill buttons |

### 2.6 Motion Philosophy

**Principle:** Refined and intentional. Not playful, not bouncy. Quick, precise, satisfying.

| Token | Value | Usage |
|-------|-------|-------|
| `--duration-instant` | 50ms | Hover states |
| `--duration-fast` | 150ms | Micro-interactions (buttons, toggles) |
| `--duration-normal` | 250ms | Panel slides, modal opens |
| `--duration-slow` | 400ms | Page transitions, complex reveals |

**Easing Curves:**

| Token | Value | Usage |
|-------|-------|-------|
| `--ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | Primary — exits, reveals |
| `--ease-in-out` | `cubic-bezier(0.65, 0, 0.35, 1)` | Symmetric — toggles |
| `--ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Optional — subtle spring |

**Signature Animations:**
- **Sidebar collapse/expand:** 250ms, ease-out, width transform
- **Thread panel slide:** 300ms, ease-out, translateX + opacity
- **Message entrance:** 200ms fade-up, staggered 30ms between messages on load
- **Hover states:** 100ms background transitions
- **Button press:** scale(0.98) on active, 50ms

### 2.7 Shadow System

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 1px 2px rgba(0, 0, 0, 0.3)` | Subtle depth |
| `--shadow-md` | `0 4px 12px rgba(0, 0, 0, 0.4)` | Cards, elevated elements |
| `--shadow-lg` | `0 8px 24px rgba(0, 0, 0, 0.5)` | Modals, dropdowns |
| `--shadow-glow` | `0 0 20px rgba(139, 92, 246, 0.3)` | Accent glow for focus states |

**Glass Effect (Overlays):**
```css
--glass-bg: rgba(20, 20, 23, 0.8);
--glass-border: rgba(255, 255, 255, 0.08);
--glass-blur: blur(20px) saturate(180%);
```

---

## 3. Layout & Structure

### 3.1 Architecture

**Two-column with slide-overs:**

```
┌─────────────────────────────────────────────────────────────┐
│  ┌──────────────┐  ┌──────────────────────────────────────┐  │
│  │              │  │                                      │  │
│  │   Sidebar    │  │           Main Chat Area             │  │
│  │   (240px)    │  │                                      │  │
│  │              │  │                                      │  │
│  │  Collapsible │  │                                      │  │
│  │   + Rich     │  │                                      │  │
│  │   expanded   │  │                                      │  │
│  │              │  │                                      │  │
│  └──────────────┘  └──────────────────────────────────────┘  │
│                            (Thread slides over from right)   │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Sidebar Modes

| Mode | Width | Content |
|------|-------|---------|
| Collapsed | 64px | Icon-only, presence dots, unread badges |
| Expanded | 240px | Icon + name + last message + timestamp |

**Transition:** 250ms ease-out, width transform with content fade

### 3.3 Thread Panel

- Width: 400px
- Slides from right edge
- Glass background with border
- Header: conversation title + close button
- Message thread with reply chain
- Compose area at bottom

---

## 4. Component Specifications

### 4.1 Message Bubble (Editorial/Comic Style)

| Property | Value |
|----------|-------|
| Border radius | 18px |
| Padding | 12px 16px |
| Max width | 72% of chat area |
| User's messages | Accent gradient left border (3px) |
| Others' messages | Subtle border (`--color-border-visible`) |
| Avatar + name header | First message in a sequence |
| Timestamp | On hover, slide up from bottom |

**States:**
- Default: Standard appearance
- Hover: Timestamp reveals, subtle background shift
- Selected: Accent border glow
- Error: Red border, retry indicator

### 4.2 Channel Item

| Property | Collapsed | Expanded |
|----------|-----------|----------|
| Height | 56px | 72px |
| Icon/Avatar | Yes | Yes |
| Presence dot | Yes | Yes |
| Name | No | Yes |
| Last message preview | No | Yes |
| Timestamp | No | Yes |
| Unread indicator | Bold text + accent dot | Bold text + accent dot |

**States:**
- Default: Standard appearance
- Hover: Background highlight
- Active: Subtle background + accent left border
- Unread: Bold text, accent color dot

### 4.3 Auth Screen (Immersive)

| Property | Value |
|----------|-------|
| Background | Full viewport gradient mesh (violet/indigo/blue, subtle animation) |
| Card max-width | 420px |
| Card border-radius | 24px |
| Card background | Glass effect with backdrop-blur |
| Logo | Top center |
| Tagline | Below logo |
| Form | Floating labels |
| Submit button | Gradient with hover glow |

### 4.4 Thread Panel

| Property | Value |
|----------|-------|
| Width | 400px |
| Background | Glass effect |
| Border | `--glass-border` |
| Header | Conversation title + close button |
| Message area | Scrollable thread with replies |
| Compose | Fixed at bottom |

---

## 5. Design Tokens Implementation

All tokens implemented as CSS custom properties in `tokens.css`:

```css
:root {
  /* Colors - Dark (default) */
  --color-base: #0A0A0B;
  --color-elevated: #141417;
  --color-surface: #1C1C21;
  --color-border-subtle: rgba(255, 255, 255, 0.06);
  --color-border-visible: rgba(255, 255, 255, 0.12);
  --color-accent: #8B5CF6;
  --color-accent-hover: #7C3AED;
  --color-accent-gradient: linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%);
  --color-text-primary: #FAFAFA;
  --color-text-secondary: #A1A1AA;
  --color-text-muted: #71717A;
  --color-success: #22C55E;
  --color-warning: #F59E0B;
  --color-error: #EF4444;
  --color-presence-online: #22C55E;
  --color-presence-away: #F59E0B;
  --color-presence-busy: #EF4444;
  --color-presence-offline: #71717A;

  /* Typography */
  --font-family: 'Geist', Inter, -apple-system, BlinkMacSystemFont, sans-serif;
  --text-xs: 11px;
  --text-sm: 13px;
  --text-base: 15px;
  --text-lg: 18px;
  --text-xl: 22px;
  --text-2xl: 28px;
  --text-3xl: 36px;
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;

  /* Spacing */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
  --space-20: 80px;

  /* Border Radius */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  --radius-full: 9999px;

  /* Motion */
  --duration-instant: 50ms;
  --duration-fast: 150ms;
  --duration-normal: 250ms;
  --duration-slow: 400ms;
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.5);
  --shadow-glow: 0 0 20px rgba(139, 92, 246, 0.3);

  /* Glass */
  --glass-bg: rgba(20, 20, 23, 0.8);
  --glass-border: rgba(255, 255, 255, 0.08);
  --glass-blur: blur(20px) saturate(180%);
}
```

---

## 6. Scope & Milestones

### Phase 1: Design System Foundation
- [ ] CSS tokens file (`tokens.css`)
- [ ] Typography styles
- [ ] Base component styles (buttons, inputs, badges)
- [ ] Animation utilities

### Phase 2: Layout Shell
- [ ] Main layout component (sidebar + chat area)
- [ ] Sidebar with collapse/expand
- [ ] Theme toggle (dark/light)

### Phase 3: Auth Screen
- [ ] Immersive background with gradient mesh
- [ ] Glass card auth form
- [ ] Floating label inputs
- [ ] Gradient submit button

### Phase 4: Chat Interface
- [ ] Message bubble component (editorial style)
- [ ] Message list with staggered entrance animation
- [ ] Compose area
- [ ] Typing indicators

### Phase 5: Channel Sidebar
- [ ] Channel item component (collapsed/expanded)
- [ ] Presence indicators
- [ ] Unread badges
- [ ] Hover/active states

### Phase 6: Thread Panel
- [ ] Slide-over animation
- [ ] Glass effect styling
- [ ] Thread header and close button
- [ ] Reply chain display

### Phase 7: Polish & Motion
- [ ] Micro-interactions on all components
- [ ] Page transition animations
- [ ] Loading states and skeletons
- [ ] Error states

---

## 7. Success Criteria

- [ ] Every screen feels cohesive — same design language throughout
- [ ] Signature moments that are portfolio screenshot-worthy:
  - Auth screen with immersive gradient background
  - Chat area with editorial message bubbles
  - Hybrid sidebar with smooth collapse/expand
  - Thread panel with frosted glass slide-over
- [ ] Smooth, refined motion on all interactions
- [ ] Light/dark mode both feel premium
- [ ] WCAG 2.1 AA accessibility compliance
- [ ] Responsive down to 1024px tablet width

---

## 8. Dependencies

- **Font:** Geist (self-hosted or Google Fonts fallback to Inter)
- **Framework:** React 18 + TypeScript
- **Styling:** CSS custom properties + Tailwind CSS utilities
- **Animation:** CSS transitions + Framer Motion for complex sequences
- **Icons:** Lucide React (consistent, clean)
