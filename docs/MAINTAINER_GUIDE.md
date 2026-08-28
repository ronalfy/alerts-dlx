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
