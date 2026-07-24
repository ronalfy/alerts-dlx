# AGENTS.md — AlertsDLX

Guidance for AI coding agents working in this repository.

## Product

AlertsDLX is a WordPress plugin for styled alert boxes, callouts, and notifications. It ships four Gutenberg blocks (Bootstrap, Chakra, Material, Shoelace) plus the `[alertsdlx]` shortcode. Site-wide settings live under **Settings → AlertsDLX**.

- Requires WordPress 6.8+, PHP 8.0+.
- Text domain: `alerts-dlx`.
- PHP namespace: `DLXPlugins\AlertsDLX`.
- Block names use the `mediaron/` prefix (for example `mediaron/alerts-dlx-bootstrap`). Do not rename block names without a migration plan.

## Repo map

| Path | Role |
|------|------|
| `alerts-dlx.php` | Bootstrap, constants, `plugins_loaded` wiring |
| `php/` | Autoloaded PHP classes (`Options`, `Admin`, `Blocks`, `Rest`, `Functions`) |
| `src/js/blocks/` | Block editor JS (one folder per theme + shared plugins/components/utils) |
| `src/js/dismiss/` | Frontend dismissible-alert script |
| `src/react/Settings/` | Admin settings React app |
| `src/scss/` | Theme stylesheets and shared SCSS |
| `build/` | `@wordpress/scripts` block build output (committed for releases) |
| `dist/` | Webpack output for styles, dismiss script, admin settings |
| `lib/` | Composer autoload (vendor dir) |
| `styles.md` | Styling contract: alert types, variants, modes, CSS classes |
| `docs/ARCHITECTURE.md` | Runtime architecture for maintainers |
| `readme.txt` | WordPress.org plugin readme (changelog, FAQ) |
| `README.md` | GitHub landing page |

User-facing documentation lives in a **separate** repo: [alerts-dlx-docs](https://github.com/ronalfy/alerts-dlx-docs) (published at [docs.dlxplugins.com](https://docs.dlxplugins.com/product/alertsdlx/)). Do not duplicate GitBook content here.

## Commands

```bash
npm install
npm run start    # Development watch (wp-scripts + webpack)
npm run build    # Production assets into build/ and dist/
npx grunt        # Create alerts-dlx.zip for distribution
```

PHP coding standards use WordPress PHPCS (`phpcs.xml.dist`). After PHP edits, run PHPCS / the project PHP beautifier when available.

## Hard constraints

1. **Preserve the styling contract.** Frontend and editor classes (`alerts-dlx`, `template-{group}`, `is-style-{type}`, `is-appearance-{variant}`, `is-dark-mode`) are part of the public CSS API. See `styles.md`.
2. **Preserve block attributes and names.** Existing post content depends on `block.json` attributes and `mediaron/alerts-dlx-*` names. Renames need explicit migration / deprecation.
3. **Load assets only when needed.** Theme styles and dismiss JS are enqueued conditionally; do not globally enqueue all themes.
4. **WordPress coding standards.** PHP and JS should follow WP conventions. Put periods at the end of code comments.
5. **Sanitize untrusted input.** Custom SVG icons, shortcode attributes, and REST payloads must stay sanitized (existing helpers and allowlists).
6. **Do not invent a fifth alert group** without updating PHP allowlists, SCSS, block registration, admin settings, and `styles.md`.

## Key extension points

- Action: `alerts_dlx_loaded` (after plugin bootstrap).
- Content filter: `alerts_dlx_the_content` (shortcode/description processing).
- Filters for fonts, headlines, enabled themes, and branding — documented in the docs repo under `developers/filters-and-hooks.md`.

Options are stored in the `alerts_dlx` option (see `php/Options.php`).

## Where to look first

| Task | Start here |
|------|------------|
| Frontend / shortcode markup | `php/Blocks.php` (`frontend()`, `shortcode()`) |
| Admin settings UI | `src/react/Settings/`, `php/Admin.php`, `php/Rest.php` |
| Block editor UX | `src/js/blocks/{theme}/edit.js`, `src/js/blocks/plugins/` |
| Theme CSS | `src/scss/{theme}/styles.scss`, `styles.md` |
| Helpers / paths | `php/Functions.php` |

## Related docs

- [Architecture](docs/ARCHITECTURE.md)
- [Contributing](CONTRIBUTING.md)
- [Adoption handoff](ADOPTION.md)
- [Security](SECURITY.md)
- [Styles & alert types](styles.md)
