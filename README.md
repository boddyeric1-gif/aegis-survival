# EMB AEGIS Wildlands — Glass Edition (v10.0)

**AEGIS** is an experimental, offline-first survival field reference and emergency-preparedness progressive web app (PWA) from EMB Creations. The current interface uses a glassmorphic dark teal theme, an emergency-first home screen, and searchable field manuals. **Manuals and rule-based references are the priority; the local AI is optional and experimental.**

**Open the app:** https://boddyeric1-gif.github.io/aegis-survival/

> **Safety notice:** This project is not medically reviewed, professionally validated, or certified for emergency use. Some guides are original educational drafts; historical sources may be outdated. In an immediate emergency, contact local emergency services and follow current official guidance. Do not rely on the app as your only emergency resource.

## What is included

| Area | Description |
| --- | --- |
| Home | Emergency-first shortcuts, manual search, quick navigation, and collapsible advanced tools. |
| Library / Field Guide | Searchable reference cards and practice fieldcraft guides. |
| Field Manual | Nine chapter-based sections, practical build projects, additional procedures, and shelter/earthworks guidance. |
| Emergency | Short rule-based emergency references; **not** a substitute for professional training or emergency services. |
| Supplies | Local preparedness and inventory features. |
| Radio & Signals | Offline text reference covering NOAA Weather Radio frequencies and communication planning. **No radio reception or transmission.** |
| Tools / Journal / Diagnostics | Supporting tools, records, and checks. |
| Optional local AI | Experimental on-device model support; not required for reading bundled manuals and may not work on every device. |

The field guides include materials, numbered procedures, checks, troubleshooting, and limitations. They are **not independently field-tested**. Excavation, below-grade shelters, and human-entry trenches require qualified professionals; the app does not provide a safe DIY substitute for engineered protection.

## Install and use offline

1. Open the site **while connected** in a supported browser (Chrome/Edge on desktop or Safari on iPhone).
2. Allow the first load and service-worker installation to finish. On iPhone, use **Share → Add to Home Screen** if desired; on desktop, use the browser's install option if available.
3. Open **Field Manual → Offline readiness → Verify offline files**. This checks the local cache for the bundled manual scripts and app entry point.
4. **Actually test offline:** turn on airplane mode, reopen the app, search for a guide, open a chapter, and navigate back to Home. Do this on each device you plan to use.
5. Keep a separate paper reference and backup power plan. Browser storage can be removed by the device, browser, or user, and an external link is not available offline merely because it appears in AEGIS.

**Bundled app content:** `index.html`, `wildlands-knowledge.js`, `wildlands-fieldcraft.js`, `wildlands-manual.js`, `manual-projects.js`, `manual-library-v7.js`, `deep-shelter-earthworks.js`, `ux-v9.js`, the offline checker, icons, and local runtime support files are listed in `sw.js` for precaching.

**Not automatically available offline:** external PDF manuals, linked official websites, streamed radio, online maps, and optional AI model downloads. Download and verify external documents separately before disconnecting.

**Preserving offline data:** Do **not** clear all site data just to refresh the UI. That may remove local records and downloaded model files. Try a normal reload or Ctrl+Shift+R after deployment. A service-worker update replaces its own versioned app cache while preserving the separately named `model-store-v1` cache; this is not a guarantee against browser storage eviction.

## Radio limitations

AEGIS cannot tune or transmit AM/FM/NOAA broadcasts from an iPhone PWA. Its **Radio & Signals** tab is an offline reference, not a receiver. NOAA Weather Radio uses seven VHF frequencies from **162.400 to 162.550 MHz**; reception requires a compatible radio. See https://www.weather.gov/nwr/ while connected to find local stations and save details on paper.

## Optional AI

The experimental local model is separate from the manuals. The app references a Qwen2.5-0.5B-Instruct quantized model and local `wllama` runtime. Model shards must be downloaded and validated before offline use; device memory and browser compatibility vary. **Do not rely on generated answers for medical, safety-critical, or hazardous construction decisions.**

Licenses and model attributions: [`llm/licenses.html`](llm/licenses.html). The repository's own educational guides are not an expert-reviewed certification.

## Repository layout

- `index.html` — application UI and integrated rule-based functionality.
- `wildlands-manual.js` — nine-chapter manual reader.
- `wildlands-knowledge.js` and `wildlands-fieldcraft.js` — searchable reference and practice guides.
- `manual-projects.js`, `manual-library-v7.js`, `deep-shelter-earthworks.js` — additional procedures.
- `ux-v9.js` — emergency-first search, navigation helpers, and radio reference.
- `manual-offline-check.js` — checks selected files in the current app cache.
- `sw.js` — versioned offline app cache and service worker.
- `manifest.webmanifest` and `icons/` — install metadata and icons.
- `llm/` — optional model runtime and attribution.
- `tests/runtime-sanity.cjs` — repository sanity checks.
- `QUALITY_GATES.md` — quality criteria and known limitations.

## Release and verification

The footer displays **EMB AEGIS Wildlands v10.0 · Glass Edition**. The service worker uses a separate internal **cache revision**, which can change after a patch without changing the user-facing product version. The old `ESI AEGIS v4` footer was an outdated hardcoded label, not evidence that the glass UI was v4.

GitHub Actions runs repository sanity checks and Pages deployment. A passing automated test verifies configured files and selected invariants; it **does not prove** every feature works on every device or that the manuals are safe and correct. Perform the offline airplane-mode test above before depending on a device.

**Current limitations / backlog:** unify all manual-search sources; validate browser compatibility and accessibility on real devices; review and source-check technical guidance; improve offline document import; improve safety checks for emergency procedures. The PWA cannot supply radio hardware.

## Contributing

When changing an offline asset, update the `sw.js` precache list and cache revision as needed, and keep the prefix expected by `manual-offline-check.js` in sync. Do not remove the `model-store-v1` cache during app-shell updates. Run `node tests/runtime-sanity.cjs` and perform manual browser/offline tests before release.

---
**EMB Creations · Experimental, not professionally validated.**
