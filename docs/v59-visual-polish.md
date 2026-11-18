# v59 Wildlands refinement

## Design scope

Refine the existing v58 Wildlands design; retain the near-black/forest surfaces, champagne-gold accents, shield mark, section order, hero copy and mobile navigation. No new imagery, layout replacement, features or data migration. The existing live design and the user's iPhone recording are the visual reference.

## App-wide changes

Shared panel spacing, form proportions, readable line heights, field labels, focus treatment, control radii and borders now carry across the main sections. Home cards retain their layout with more consistent detail typography. Library excerpts, expanded guides, Bushcraft lesson panels and Household forms get the same finish. Community retains its full-screen group-text flow and separate notification control; compact-height spacing prevents composer clipping. Emergency, reference tools, journal, messages, diagnostics, menus and device settings share the refined control treatment.

AI chat uses semantic message classes with distinct user/assistant bubbles, clearer speaker labels, comfortable answer typography, a quiet outer thread and a cohesive composer. Message content, guide routing, storage keys, saved conversations and model runtime behavior are unchanged.

## Visual comparison ledger

- Palette: existing forest/near-black/gold colors retained; borders and muted text refined within that palette.
- Hierarchy: original headings and visible copy retained; section headings, form labels and body line heights made more consistent.
- Geometry: existing grids, card families, drawers, forms and group-text layout retained; padding/radii/control proportions aligned.
- Icons: shield and existing navigation/category icons preserved. No new icon family or imagery.
- Responsive layout: no sideways page overflow across all 13 non-community sections at 454 CSS pixels; the bottom bar remains exactly at the viewport bottom. Menu also checked at 340 CSS pixels. Community checked separately, including compact-height composer spacing.
- Accessibility: high-contrast and large-text modes checked for horizontal overflow; low-power mode confirmed to remove shadows. Reduced-motion and 16-pixel form text retained.

## Validation

Browser interaction checks cover Home, Library search, Bushcraft, Household, guide-backed chat send, Community layout/notification-button visibility, Radio, Emergency, tools, journal, official messages, diagnostics, release notes, administration entry, section menu and Device preferences. No community message was sent and no notification subscription was changed. Preferences used for preview checks were restored.

The browser was checked at 1363, 454 and 340 CSS-pixel widths using browser zoom for narrow layouts. Device emulation is unavailable in this environment. These checks do not replace an actual iPhone/Safari keyboard/safe-area test. The existing v57 navigation compositing properties are preserved.

Run all repository suites and release hash checks before merge. Live publication must show v59 and the new visual layer after the app-shell update.
