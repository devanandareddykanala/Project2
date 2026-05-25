# Develvyn -- The Family Suite Design Brief

| Aspect | Detail |
|--------|--------|
| **App Name** | Develvyn -- The Family Suite |
| **Category** | Productivity / Family Organization |
| **Tone** | Calm, professional, clear, trustworthy |
| **Primary Colour** | #2E7D32 (Develvyn green) |
| **Typography** | Inter (body), Playfair Display (display) |
| **Radius** | 12px (lg), 8px (md), 4px (sm) |
| **Spacing** | 0.25rem base unit, card padding 16px |
| **Aesthetic** | Card-based, clean grid, minimal decoration, high-contrast text |

## Palette

| Token | Light | Dark | Purpose |
|-------|-------|------|----------|
| **Primary** | #2E7D32 | #2E7D32 | Buttons, active states, highlights |
| **Background** | #f5f5f7 | #0a0a0a | Page background |
| **Card** | #ffffff | #1a1a1a | Elevated surfaces |
| **Foreground** | #1c1c1e | #f5f5f7 | Body text |
| **Border** | #e5e5ea | #2a2a2a | Dividers |
| **Muted** | #f2f2f7 | #2a2a2a | Secondary backgrounds |
| **Destructive** | #ff3b30 | #ff453a | Errors, deletions |

## Structural Zones

| Zone | Treatment | Purpose |
|------|-----------|----------|
| **Header** | bg-card, border-b border-border | Navigation, app title |
| **Sidebar** | bg-sidebar, border-r border-sidebar-border | Mode selector, menu |
| **Content** | bg-background | Main flow, card stack |
| **Cards** | bg-card, shadow-sm, radius-lg | Content containers |
| **Footer** | bg-muted/20, border-t border-border | Secondary actions |

## Animations

- **fade-in** (0.3s) — screen entry
- **fade-up** (0.5s, staggered) — list entry
- **float** (6s infinite) — subtle motion for decorative elements
- **mood-pop** (0.35s) — button/card interaction

## Motion Timing

All transitions use ease-out cubic. No bouncing or easing-in. Smooth, predictable interaction feedback.

## Constraints

- No glow, gradients, or neon effects
- Text always uses semantic tokens (--foreground, --muted-foreground)
- Colours always from design tokens, never literals
- Responsive: mobile-first, sm/md/lg breakpoints
- Dark mode preserves visual hierarchy and contrast

## Signature Detail

Develvyn logo (uploaded image, never recreated) appears in header and splash screens. Green accent on primary CTAs reinforces brand identity without visual noise.
