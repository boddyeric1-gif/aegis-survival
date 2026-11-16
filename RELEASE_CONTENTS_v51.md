# AEGIS v51 — complete package contents

This release includes the v50 conversational/Bushcraft upgrade and v51 Mobile installation/persistence corrections. AI generation runs on the device; no paid cloud model is required.

| Component | Included |
| --- | --- |
| Mobile AI | SmolLM2-360M-Instruct Q4_K_M; 270,590,880 bytes; 33 same-site files, each at most 8 MiB and SHA-256 verified. |
| Surface/Desktop AI | Existing Qwen2.5-0.5B-Instruct Q4_K_M; 491,400,032 bytes in 21 files. Existing cache keys preserved. |
| Local runtime | wllama/llama.cpp WebAssembly; desktop and Safari/iOS compatibility runtime and worker. |
| Conversation | Recent conversation, explicit equipment facts and corrections, general questions, relevant bundled guide/manual retrieval, Auto / Guide / Local AI modes, saved history and export. Compact v51 instructions. |
| Field Library | Searchable 676-page extracted text of FM 3-05.70 (May 2002), page references, saved pages, plus original AEGIS field manuals, practical skills, fieldcraft, project guides, pioneer recipes and household references. |
| Bushcraft | 26 lessons, 130 embedded step diagrams and captions, enlargement navigation, all-category search, favorites, practice checks, notes and practice export. Six core coaching lessons include reasons, inspection checks, troubleshooting and exercises. |
| Household | People/pets, supplies, action assignments, communication/meeting plans, manual references, readiness and backup import/export. |
| Other sections | Emergency references, tools, journal/imported documents, Radio & Signals directory/favorites, diagnostics, updates, admin and message interface. |
| PWA | Home Screen manifest/icons, install walkthrough, quick-start guide, offline app shell and manuals. |
| Persistence | Separate model cache plus persistent IndexedDB fallback survive app-shell updates; hash-matched unchanged shell assets are reused; verified partial model downloads resume; cached model files can recover after verification metadata loss. |
| Source and checks | Application source, release notes, attribution/licenses, hash-generation helper, CI and 11 regression scripts. |

## All 26 Bushcraft lessons

- Tarp lean-to
- A-frame tarp shelter
- Ground insulation bed
- Shelter site selection
- Rainwater diversion
- Tinder preparation
- Fire lay planning
- Firewood moisture sorting
- Emergency water storage
- Water source risk check
- Rain collection setup
- Foraging observation journal
- Food storage rotation
- Wildlife sign observation
- Humane live-capture planning
- Animal track recording
- Simple wooden mallet
- Camp utensil care
- Bowline knot
- Taut-line hitch
- Square lashing practice
- Landmark route notes
- Compass orientation
- Leave-no-trace camp routine
- Rainproof supply storage
- Household repair inventory

## What downloads and what stays saved

The optional Mobile and Surface models are packaged with the site but downloaded to each device only when requested. Switching profiles preserves both saved models. Reopening reinitializes the runtime using cached model bytes; initialization is not a fresh download. Household records, chat, favorites and practice notes remain local to that browser/install. Household and practice exports are separate.

App updates copy unchanged files from the previous shell after checking their SHA-256. Only changed or missing shell files need network access. A failed update retains the previous working shell. Neither update cleanup nor model switching deletes model-store-v1.

Safari tabs and the Home Screen app may use separate storage contexts. Download from the Home Screen app you intend to use. Do not uninstall the app or clear website data to update it. iOS can evict browser storage under pressure; a web app cannot guarantee otherwise.

## External or separately downloaded features

The original FM PDF is not bundled in this package: extracted manual text is. Original-PDF access/download, radio audio and directory updates, external links, remote messages/admin and analytics use the network. Live radio audio is not cached. No live offline maps are included. All AI inference is local after installation.

## Verification limits

The complete package passes the 11 local regression scripts, including real packaged model-byte checks, cached-model boot from both file stores without network, CacheStorage quota fallback, interrupted/corrupt download handling, shell update reuse and rollback. Diagrams are original schematic teaching aids, not expert-certified technical drawings. Actual iPhone download, force-close/reopen and airplane-mode inference must still be verified on the physical phone. No guarantee of model accuracy, speed or iOS storage retention is made.
