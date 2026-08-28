# Contributing to AlertsDLX

Thanks for helping maintain AlertsDLX. This guide covers local setup, coding standards, and how to ship changes.

For AI agents, also read [AGENTS.md](AGENTS.md). For a system overview, see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Requirements

- Node.js (LTS recommended) and npm
- PHP 8.0+ with WordPress 6.8+ for testing
- Composer (optional; autoload already committed under `lib/`)
- WordPress Coding Standards / PHPCS for PHP linting

## Setup

```bash
git clone https://github.com/ronalfy/alerts-dlx.git
cd alerts-dlx
npm install
```

Symlink or copy the plugin into a local WordPress `wp-content/plugins/` directory and activate **AlertsDLX**.

## Development

```bash
npm run start   # Watch mode: rebuilds build/ and dist/ on change
npm run build   # Production build
```

- Block sources: `src/js/blocks/`
- Theme SCSS: `src/scss/`
- Admin settings React app: `src/react/Settings/`
- PHP: `php/` (PSR-4 under `DLXPlugins\AlertsDLX\`)

Built assets in `build/` and `dist/` are part of the release package. Run `npm run build` before opening a PR that touches JS/SCSS.

## Coding standards

### PHP

- Follow WordPress PHP Coding Standards (`phpcs.xml.dist` references WordPress-Core and WordPress-Docs).
- Namespace: `DLXPlugins\AlertsDLX`.
- End code comments with a period.
- Prefer existing helpers in `php/Functions.php` and allowlists in `php/Options.php`.

```bash
# Example if phpcs is available on your PATH
phpcs --standard=phpcs.xml.dist php/ alerts-dlx.php
```

### JavaScript / React

- Match existing patterns in `src/js/blocks/` and `src/react/`.
- Prefer `@wordpress/*` packages already used by the project.
- Keep shared block UI in `src/js/blocks/plugins/` and `src/js/blocks/components/` rather than duplicating per theme.

### CSS / SCSS

- Do not break the public class contract documented in [styles.md](styles.md).
- Theme-specific styles belong in `src/scss/{bootstrap|chakra|material|shoelace}/`.

## Pull requests

1. Branch from the default branch with a focused change.
2. Run `npm run build` if you changed frontend or admin assets.
3. Update `readme.txt` changelog when the change ships in a release.
4. Describe the user-facing impact and any migration / compatibility notes.
5. Do not rename block names (`mediaron/alerts-dlx-*`) or core attributes without a migration plan.

## Release checklist

1. Bump version in `alerts-dlx.php` (`Version` header and `ALERTS_DLX_VERSION`).
2. Update Stable tag and changelog in `readme.txt`.
3. Run `npm run build`.
4. Package a zip if needed: `npx grunt` → `alerts-dlx.zip`.
5. Tag the release on GitHub and deploy to WordPress.org SVN as appropriate.
6. User docs / announcements live in [alerts-dlx-docs](https://github.com/MediaRon/alertsdlx-docs) — update there when behavior changes.

## Support and issues

- GitHub issues: [ronalfy/alerts-dlx](https://github.com/ronalfy/alerts-dlx/issues)
- User documentation: [AlertsDLX Docs](https://docs.dlxplugins.com/product/alertsdlx/)
- This plugin is [up for adoption](ADOPTION.md).
