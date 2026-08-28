# Code readability standard

Alerts DLX should be understandable to the original author, a future maintainer, and a potential acquirer without private project vocabulary.

## Naming

Prefer names that describe the WordPress/product concept directly.

Good:

- `getAlertGroupForBlockName`
- `hideDismissedAlerts`
- `check-doc-links`
- `release-package`
- `enabled_block_styles`

Avoid opaque internal codes, numbered gates, or labels that require a separate legend.

## Comments

Comments should explain **why** a behavior exists when the reason is not obvious from the code.

Good example:

> Client-side hide-on-load is required so dismissal works under full-page caches that skip PHP cookie checks for anonymous visitors.

Do not comment obvious syntax. Do document compatibility reasons, historical behavior, and user-facing constraints.

## Tests

A failed test should tell a maintainer what user or developer promise was broken.

Good test/report language:

- `Bootstrap keeps its public block name`
- `Stored settings remain compatible`
- `Transforms carry existing inner blocks`
- `Release package includes the files WordPress.org users need`

Avoid test names that only contain ticket numbers or private audit identifiers.

## Release notes

Describe effects in ordinary product language:

- `Fixed clean developer setup on current Node/npm.`
- `Added regression checks for existing block and shortcode compatibility.`
- `Updated documentation repository references.`

Do not advertise internal process machinery as a user feature.

## Architecture changes

When a refactor preserves behavior, document both sides:

1. what code became simpler;
2. which old behavior must remain unchanged.

Example:

> The four alert editors now share one settings component. Existing block names, saved attributes, frontend markup, and transforms remain unchanged.

That kind of sentence is useful to Ronald, reviewers, future developers, and future buyers.
