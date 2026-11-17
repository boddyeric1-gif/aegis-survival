# v58 practical-conversation validation

## Actual model investigation

The packaged SmolLM2-360M-Instruct Q4_K_M GGUF (SHA-256 `2fa3f013dcdd7b99f9b237717fa0b12d75bbb89984cc1274be1471a465bac9c2`) was assembled from the existing 33 mobile shards and run with llama.cpp through llama-cpp-python, 1024-token context and deterministic temperature zero. This is a native CPU quality check, not an iPhone/WebAssembly speed or memory benchmark.

The recorded question was: “If I have a tarp, knife, some wood, and 9 feet of rope and I’m in the woods can I make a shelter? How?” Follow-ups included changing to three feet of rope and asking how to attach the corners.

The old prompt produced an incomplete answer that invented a groundsheet. Revised prompts could stay on the shelter topic, but still echoed reference text, misdescribed ridgeline attachment or claimed a three-foot rope could be used with fifteen-foot anchors. These results **failed** the practical-answer acceptance criteria. Prompt-only changes were therefore not accepted as the solution.

## Shipped behavior

`field-answers-v58.js` resolves a practical task from user turns and uses the actual registered procedure catalog. It produces source-backed steps without running the model. It does not claim that the user's supplies complete a design. For the recorded scenario it identifies the A-frame guide, notes its 15–30-foot cord requirement against nine feet described, presents the guide's assembly steps, and retains that task for follow-up. The three-foot correction supersedes nine feet. A corner question selects corner/reinforced tie-out steps and asks about attachment points and stakes.

Replies are labeled **Field Assistant** and status identifies the guide-backed path. Free-form AI remains experimental; v58 does not claim the 360M model became a capable general reasoning model. Unknown or unsupported questions can still reach that model and need device testing.

## Automated checks

`node tests/chat-conversation.cjs` loads the real guide catalog and FM index. It checks the recorded task, isolation from a failed introduction, actual instruction/requirement context, distinct message roles, specific corner steps, quantity corrections, no invented replacements, new-topic isolation and 25 serialized-chat reopen repetitions. `node tests/download-recovery.cjs` checks the real bridge's chat-API dispatch and response extraction with an API-shaped runtime double, alongside saved-model recovery checks.

All other repository suites must pass before release. A live-browser check must exercise the send controls, follow-up handling and reopening; iPhone airplane-mode validation remains a device-specific follow-up.
