# EMB AEGIS Wildlands — Offline Field Guide & Live Broadcast (v16)

**AEGIS** is an experimental, offline-first survival field reference and emergency-preparedness progressive web app (PWA) from EMB Creations. The current interface uses EMB Studios' signature near-black interface with restrained champagne-gold accents, an emergency-first home screen, and searchable field manuals. **Manuals and rule-based references are the priority; the local AI is optional and experimental.**

**Open the app:** https://boddyeric1-gif.github.io/aegis-survival/

> **Safety notice:** This project is not medically reviewed, professionally validated, or certified for emergency use. Some guides are original educational drafts; historical sources may be outdated. In an immediate emergency, contact local emergency services and follow current official guidance. Do not rely on the app as your only emergency resource.

## v16: Live Supabase broadcasts (shared EMB OS project)

AEGIS now reads published announcements from the isolated `public.aegis_messages` table in the existing EMB OS Supabase project, with local offline caching and unread markers. The public publishable key is safe to include in the browser; secret/service keys are never included. Messages refresh on open, reconnect, resume, manual check and every 15 minutes while visible.

The Admin tab uses the fixed display username `ADMIN-EMB` plus **the existing EMB Supabase account password**; the corresponding account email is mapped internally, verified by Supabase Auth over HTTPS. The authorized admin is the existing EMB business account, allowlisted in the private `aegis_admins` table. Supabase row-level security independently enforces admin-only INSERT; public clients have SELECT only on published messages and no access to the admin allowlist. The password previously provided in chat was **not** installed or embedded in the site.

**To publish:** Admin → username ADMIN-EMB → the existing EMB OS Supabase Auth account password → select severity, compose, confirm. If that account's password is unknown, reset it via Supabase Auth. Do not reuse the exposed chat password. The session is memory-only and clears when the page unloads.

**Limitations:** This is an in-app polling inbox, not OS push. Offline clients receive new messages only after reconnecting; a closed iOS PWA does not receive alerts. There is no reply feature. Supabase project resources and Auth are shared with EMB OS; AEGIS's tables and permissions are isolated.

## Earlier v15: Messages inbox and secure-admin integration scaffold

A prominent **Messages** inbox now sits beside Updates and Admin. The existing offline-cached public announcement feed is shown in Messages with unread counts; release notes remain in Updates. The Admin tab contains a severity selector (General, Community, Important, Emergency), subject, message composer, confirmation and lock controls.

**Security gate:** The admin composer is intentionally locked until a separate authenticated publishing API is configured as `window.AEGIS_BROADCAST_API` **before** `broadcast-admin-v15.js` loads. The API must implement `POST /login` (server-verified username/password returning a short-lived session token) and `POST /publish` (verify token and admin role; validate and publish to the actual message feed). This release **does not claim to provide a live authenticated broadcast service**. The supplied credential is not embedded in any public source or build. Rotate any credential shared in chat before production setup. Do not configure a public password or hash in frontend code.

For a real secure deployment, provision a dedicated AEGIS backend with server-side salted password hashing or managed Auth, role authorization, audit logs, rate limits, and a message store with public read / admin-only write. GitHub Pages alone cannot verify passwords or securely publish authenticated messages. Push notifications to closed iOS PWAs require opt-in, a service-worker push handler and server-side Web Push delivery.

**Situation Advisor:** Distinguishes tarp, knife, sleeping bag and blanket as separate reported equipment types, addressing the missing-item issue visible in the November 6 iPhone recording. More device regression testing is still required.

## Earlier v14: Updates tab and community announcements

The **Updates** tab sits beside Diagnostics and contains an offline-cached release changelog plus a community announcement inbox. The inbox checks `announcements.json` while the app is open and online (on launch, on resume, after reconnection, manually, and at intervals). Users see an unread count and can mark messages as read. The last successfully retrieved feed is stored locally for offline reading.

**Maintainer publishing workflow:** Edit `announcements.json` in the repository's `main` branch, append an announcement with a **unique** `id`, `published` ISO timestamp, `severity` (`info`, `warning`, or `critical`), `title`, and `body`; commit and wait for GitHub Pages to deploy. Do not put secrets or personal data in public messages. All users who open the app online after deployment can retrieve it. You can also ask the connected assistant to publish a specific announcement to GitHub. Update `updates.json` with each release and bump the service-worker cache when bundled files change.

**Important limitations:** This is a *polling inbox*, **not native push**. It cannot reach an iPhone PWA that is closed, offline, or suspended, and cannot guarantee immediate delivery. A true push system requires a secure authenticated publisher, subscriber storage, a push service and an HTTPS backend (e.g. VAPID/Web Push), plus iOS permission and installation requirements. Never embed an admin token in the public PWA.

The Field Guide also adds practical bank fishing, tarp sleeping-system, three-strand cordage and lost-person signaling lessons, each with material lists, sequential steps and safety limits.

## Earlier v13: Field Guide expansion and unified manual

The **Field Guide** and **Field Manual** are deliberately separate workspaces. Field Guide now includes a dedicated **Live Capture, Hunting & Gathering** reference with six new structured guides: a ventilated box-trap mechanical prototype, a collapsible funnel-enclosure prototype, humane capture planning, wildlife sign observation, field harvest identification, and game-meat safety. The trap projects are educational, nonlethal mechanism prototypes—not verified species-specific live-trap designs. Real capture requires lawful permissions, frequent checks, animal welfare safeguards and species-specific expertise.

The **Field Manual** now has one searchable, purpose-filtered procedure catalog that groups overlapping titles and moves the legacy stacked collections into an Advanced section. This is a navigation consolidation, not a claim that all underlying content is unique or professionally validated.

The offline assistant includes deterministic procedure retrieval, explicit reported-supply checks, and session-only topic/inventory recall. The installed PWA checks for service-worker updates on launch, resume and reconnect, while retaining offline fallback. iOS behavior must still be tested on a physical device.

### Current development priorities

1. Field-test and independently review high-risk guidance, particularly wildlife handling, water treatment and medical content.
2. Replace repetitive draft text with complete, distinct, skill-tested lessons and illustrations.
3. Improve Field Guide/Field Manual cross-navigation and unified search relevance.
4. Validate the iPhone PWA update cycle and real airplane-mode behavior after deployment.
5. Expand lawful nonlethal wildlife observation and capture planning only with species-specific welfare and regulatory references.

## Earlier: Illustrated field reader pilot

Field Manual now begins with three curated, mobile-friendly walkthroughs: boiling water for microbes, a mild-weather lean-to rain tarp, and a 72-hour no-cook food kit. Each includes a labeled schematic, sequential steps, a materials list, checkable inspections, mistakes to avoid, safety boundaries, and source notes. This is a **pilot**, not a complete replacement for the existing library, and the new content is not independently expert-reviewed or field-tested. Eight additional practical food-acquisition and fieldcraft references are also included, covering hunting observation, bank fishing, archery safety and equipment, humane trap selection, edible plant and mushroom identification, food safety, and lost-person signaling. These are **not yet comprehensive standalone training guides**; existing manual sections remain below unchanged.

## Expanded v11 manual audit

All 48 procedures in the v7 practical library now include a materials/preparation section, completion checks, troubleshooting guidance, and a transparent reference-status label. Nine previously superficial entries were rewritten with more explicit procedural sequencing, including water boiling, wood mallet, ground insulation, signaling, wildlife observation, fishing, practice snare/deadfall models and food ration planning. The existing user-selectable high-contrast and large-text accessibility modes are preserved. **This does not mean all 48 procedures are independently validated or equally detailed**, and other manual collections still require the same editorial treatment. The bow and trapping sections do not provide fully validated functional weapon/trap construction plans. Real-world skill practice and qualified safety review remain essential.

## What is included

| Area | Description |
| --- | --- |
| Home | Emergency-first shortcuts, manual search, quick navigation, a 60-second Quick Start, and collapsible advanced tools. |
| Library / Field Guide | Searchable reference cards and practice fieldcraft guides. |
| Field Manual | Nine chapter-based sections, practical build projects, additional procedures, and shelter/earthworks guidance. |
| Emergency | Short rule-based emergency references; **not** a substitute for professional training or emergency services. |
| Supplies | Local preparedness and inventory features. |
| Radio & Signals | Offline text reference covering NOAA Weather Radio frequencies and communication planning. **No radio reception or transmission.** |
| Tools / Journal / Diagnostics | Supporting tools, records, and checks. |
| Optional local AI | Experimental on-device model support; not required for reading bundled manuals and may not work on every device. |

The field guides include materials, numbered procedures, checks, troubleshooting, and limitations. They are **not independently field-tested**. Excavation, below-grade shelters, and human-entry trenches require qualified professionals; the app does not provide a safe DIY substitute for engineered protection.

## Quick Start & Field Key

Tap **? Quick Start & Key** in the app header, or **New here? Open the 60-second AEGIS guide** on Home. The guide explains every main tab, gives a four-step getting-started workflow, and lets you jump to a section directly. It is bundled offline with the app shell; it does not require AI.

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
- `quick-start.js` — offline help dialog and section navigation key.
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
**EMB Creations · Signature black-and-gold theme · Experimental, not professionally validated.**

### Field Guide intent fix

The local deterministic assistant now routes shelter, water, and lost-person requests to goal-first guidance before it searches inventory-based craft recipes. In particular, 'I have a tarp, knife, rope, blankets, and a sleeping bag. I need to make shelter' no longer produces a horseshoe pack or stone-knife project. The v11 footer label now identifies the release. This is a targeted regression fix, not a claim that every natural-language request is understood.


## v17: Admin login correction
The admin interface now shows only username and password. `ADMIN-EMB` maps to the existing EMB business Supabase Auth account internally; publishing still requires a valid Supabase password and a matching allowlisted admin user. The password shared in chat is not provisioned. Network failures show connectivity diagnostics rather than being treated as incorrect credentials. Footer now displays v17.
