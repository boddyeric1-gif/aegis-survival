# AEGIS reliability release gates

AEGIS is an experimental reference prototype, **not a validated emergency service**.

## Release gates (all required before claiming device-ready)
1. Offline shell: launch from Home Screen in airplane mode after a complete browser restart.
2. Model persistence: download once, restart, update service worker, restart; confirm SHA-256 verified cached shards without redownload.
3. Local inference: run the three built-in prompts, capture generated outputs and timing, then repeat fully offline.
4. Safety triage: do not elevate unconfirmed model-only immediate-danger predictions to confirmed emergency alerts.
5. State integrity: clearing a situation removes prior answer banners and hazard state.
6. Regression: verify real CO exposure, heat-stroke symptoms, bleeding, and non-emergency hypotheticals against independently reviewed references.
7. iPhone: repeat gates 1–6 on iOS Safari Home Screen PWA; desktop passes do not substitute.
8. Recovery: interrupt model load; preserve cached files, show precise state and retry without redownload.
9. Storage: document storage eviction risk and the consequences of uninstalling the PWA.

## Current evidence
- Surface Pro ran three local structured-inference prompts in the v4.4.0 build. This proves execution, **not accuracy**.
- iPhone previously interrupted model initialization; no successful iOS inference confirmed.
- Browser-cache metadata recovery was added in v4.4.2; physical persistence still unverified.
- Emergency text and AI interpretation are not independently certified.

## Product presentation rule
Show AEGIS as an **experimental offline-first research and software engineering showcase**, not a proven life-saving tool. No claims of expert validation or guaranteed offline inference until the above gates are documented.
