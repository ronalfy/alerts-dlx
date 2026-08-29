# AlertsDLX maintenance checks

These checks protect the plugin's public compatibility promises during maintenance and refactoring.

They intentionally use plain language so a future maintainer can tell what failed without learning a private audit vocabulary.

## Checks

`dependency-health.mjs`
: Confirms RC1 keeps the reviewed React and WordPress Components versions and uses only the explicit repository-local npm compatibility setting. It does **not** claim the historical dependency graph has been modernized.

`public-contracts.mjs`
: Protects the public plugin version, Stable tag, shortcode, option key, and historical block names.

`block-metadata.mjs`
: Protects the saved block attribute schemas that existing posts depend on.

`transform-contracts.mjs`
: Protects all 12 transforms among Bootstrap, Chakra, Material, and Shoelace and checks that transforms carry existing attributes/inner blocks through the shared helper.

`settings-contracts.mjs`
: Protects the `alerts_dlx` option key and existing settings/defaults.

`release-package.mjs`
: Confirms the Grunt packaging configuration still includes the expected plugin payload.

`check-doc-links.mjs`
: Fails when the retired docs-repository URL returns to maintained source/docs files.

`runtime-smoke.php`
: Lightweight PHP/WordPress runtime assertions for the shortcode, options and block registrations. It is designed to run inside a real WordPress test/site environment rather than mocking WordPress globally.

## Dependency note

The current upstream package ranges contain historical peer declarations that make modern npm reject a plain install even though the existing plugin build is reproducible. RC1 intentionally uses a repository-local compatibility setting instead of upgrading `@wordpress/components`, because the plugin imports that package's stylesheet into its own admin CSS. Components modernization therefore belongs in a separate visual-regression-backed change.

## Important

These checks complement, not replace, real Gutenberg/editor/frontend tests. A static check can tell us that a contract still exists in source; it cannot prove the entire user interaction by itself.
