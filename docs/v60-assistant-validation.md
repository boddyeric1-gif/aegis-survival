# v60 assistant validation — 2026-11-18

## Trigger and scope
The supplied iPhone recording asks for a recipe using brown rice, chicken broth, kidney beans, canned chicken, corn, potatoes, pineapple and green beans. SmolLM2 invents can sizes, says to rinse broth and stops in the second cooking step. A short token budget explains truncation, not the ingredient reasoning failure.

## Native model comparison
Compared the existing SmolLM2-360M Q4_K_M with pinned Qwen3-0.6B Q4_K_M (bartowski, revision 60b85c0e3d8fe0f6474f406922a26d12aca4550d). Local llama-cpp-python CPU inference, one thread, 2048-token context, temperature zero, 320 output tokens. Qwen3 used the ChatML non-thinking prefix; SmolLM2 used its embedded chat template. These are server CPU observations, not iPhone performance measurements or bundled-WASM compatibility proof.

SmolLM2 invented soy sauce, oil, garlic and extra vegetables; the answer hit the limit. Both models reused chicken broth after the explicit correction that none was available. Qwen3 also gave an incorrect tinder/kindling definition. Therefore no new model assets, network hosts, default selection or downloads are changed in v60. This small comparison is a rejection of this candidate/configuration, not a general model benchmark.

## Implemented behavior
- A compositional offline planner extracts supported pantry ingredients from user turns only, applies explicit removals and pantry resets, and creates grain bowls, potato pots and ready-to-eat/no-heat plates. It never invents package sizes or confirmed quantities. Ambiguous beans/proteins are held out pending clarification.
- Existing saved chat is the source of task state; reopening preserves it. State is bounded by the existing 24-message history and is not a permanent household inventory. Unsupported foods/questions fall through to the existing assistant.
- Existing guide-backed shelter/fire/knot paths remain unchanged.
- Free-form model completions preserve finish reasons through completeDetailed; the legacy complete API remains a string. Length-limited or visibly unfinished long replies carry a persisted incomplete marker and a Continue answer button. Continuation is user-triggered and bounded; no automatic inference loop.
- Explicit follow-ups on unknown topics retain recent real role-tagged turns. This improves supplied context, not intrinsic reasoning.

## Automated coverage
`tests/assistant-planning.cjs`: recorded question, broth removal, canned/dried ambiguity, pronoun clarification, no stove, restored stove, pantry replacement, allergy removal, no assistant-invented facts, hypothetical isolation, topic changes and 25 saved-history reopens.

`tests/chat-completion.cjs`: actual send/render/save/restart flow, cutoff marker and Continue control, original request plus partial answer passed to continuation, completed follow-up and recipe corrections without inference.

`tests/download-recovery.cjs`: detailed finish metadata alongside unchanged legacy string completion, runtime lock and persistent model recovery coverage.

All existing runtime suites are rerun before merge. Browser replay checks the exact ingredient question, correction after reload and no-stove follow-up with no installed model. Physical iPhone inference, OS process termination and real airplane-mode tests remain device-specific.

## Sources for bundled food-safety rules
- FDA Bad Bug Book, phytohaemagglutinin: https://www.fda.gov/media/83271/download
- Health Canada, lectins in dry legumes (canned beans already processed): https://www.canada.ca/en/health-canada/services/food-nutrition/food-safety/chemical-contaminants/natural-toxins/lectins-legumes.html
- USDA FSIS leftovers: https://ask.fsis.usda.gov/article/How-do-I-handle-leftovers-safely
