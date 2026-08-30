# Maintainer guide

## What lives where

`plugin/` contains the current upstream Alerts DLX source plus any local release-candidate changes.

`lab/` contains private maintainer tooling and evidence. Do not copy lab files upstream automatically.

## Before changing code

1. Confirm `UPSTREAM.json` still describes the reviewed starting commit.
2. Read the existing comments and maintainer docs around the code being changed.
3. Write down the user/developer behavior that must remain unchanged.
4. Prefer the smallest change that solves the proven problem.

## While changing code

- Use normal WordPress terminology.
- Preserve historical block names and saved attributes unless a migration has been designed and tested.
- Reuse shared helpers instead of duplicating behavior between the four alert styles.
- Explain compatibility workarounds in comments where the reason would otherwise be surprising.
- Avoid speculative cleanups in the same diff as a functional fix.

## Before accepting an RC

At minimum:

- plain dependency installation must work;
- maintenance checks must pass;
- production build must succeed;
- generated `build/` and `dist/` changes must be understood, not merely accepted;
- historical Gutenberg content must remain valid after reload;
- shortcode and frontend rendering must still work;
- dismiss behavior must remain compatible;
- the minimum supported WordPress/PHP floor must be tested for code releases.

## Before proposing work to Ronald

Summarize in ordinary language:

- what problem was found;
- what changed;
- what deliberately did not change;
- how it was tested;
- what the remaining risk is.

The goal is to make review easy, not to impress with process terminology.

## Anti-Bug Gate for editor and block changes

Before merging an editor/block change, use this seven-stage gate:

1. **Reproduce and bind the bug.** Record the exact affected block, design, action, expected result, actual result, and WordPress version before changing code.
2. **Integration-registry closure.** Any feature that applies to all AlertsDLX blocks must use the central alert-block registry. Do not create a second local allowlist of block names.
3. **Design-capability matrix.** For the canonical Alert, toolbar styles, color controls, icons, elements, buttons, dismiss controls, and other design-specific UI must follow the current `alertGroup`, not the canonical block name alone.
4. **Persistence matrix.** Exercise save/reload, duplicate/copy, transforms, design switching, and existing saved IDs/content. A UI fix is not complete if serialization or dismissal identity changes.
5. **Compatibility matrix.** Historical Bootstrap, Chakra, Material, and Shoelace blocks, shortcode/frontend output, WordPress 6.8, and current WordPress must remain green.
6. **Build/package gate.** `npm run test:maintenance`, production build, generated-file cleanliness, Node 20/22 CI, PHP syntax, and release-package checks must pass.
7. **Human canary review.** Before merge, perform one short editor smoke pass on the exact reported path and include the result in the PR. Do not treat green static tests as proof of visible editor behavior.

The automated registry/design checks live in
`maintenance-tests/editor-integration-contracts.mjs` and run as part of
`npm run test:maintenance`. Browser/canary evidence remains mandatory for
editor-facing changes until that matrix is automated in CI.
