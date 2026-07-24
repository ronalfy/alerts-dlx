# Adoption handoff

AlertsDLX is listed for adoption on WordPress.org (`adopt-me`). This checklist is for transferring ownership and for new maintainers taking over.

Adoption interest: [Adopt a Plugin form](https://mediaron.com/contact/adopt-a-plugin/)

## Repositories and distribution

| Asset | Location | Notes |
|-------|----------|-------|
| Plugin source | [github.com/ronalfy/alerts-dlx](https://github.com/ronalfy/alerts-dlx) | Primary development |
| User / developer docs | [github.com/ronalfy/alerts-dlx-docs](https://github.com/ronalfy/alerts-dlx-docs) | GitBook-style docs; not inside the plugin zip |
| WordPress.org plugin | Slug `alerts-dlx` | SVN deployment + plugin directory listing |
| Product / marketing pages | dlxplugins.com / mediaron.com | May need rebrand or redirects after transfer |

Transfer GitHub ownership (or add maintainers), WordPress.org plugin ownership, and docs hosting access as part of the handoff.

## Branding and URLs to review after transfer

Search the plugin and docs for strings that still point at the previous owner:

- Author / Contributor names (`ronalfy`, Ronald Huereca)
- Namespace and Composer package: `DLXPlugins\AlertsDLX`, `dlxplugins/alerts-dlx`
- REST namespace: `dlxplugins/alerts-dlx/v1`
- Block names: `mediaron/alerts-dlx-*` (stable in content — prefer leaving names even if brand changes)
- Donate / sponsor links (for example GitHub Sponsors)
- Docs and support URLs (`docs.dlxplugins.com`, `dlxplugins.com`, `mediaron.com`)
- Adoption callouts in `readme.txt` / `README.md` once a new maintainer is confirmed

Renaming PHP namespaces or Composer packages is optional and disruptive; prioritize WordPress.org ownership and public URLs first.

## Stability promises

New maintainers should treat these as compatibility contracts:

1. **Block names** (`mediaron/alerts-dlx-bootstrap`, `-chakra`, `-material`, `-shoelace`) — changing them breaks existing posts unless you ship a migration.
2. **Block attributes** in each `block.json` — renames need `deprecated` blocks or attribute migration.
3. **CSS class contract** in [styles.md](styles.md) — themes and custom CSS depend on it.
4. **Shortcode** `[alertsdlx]` attribute names — used in page builders and classic content.
5. **Option key** `alerts_dlx` — changing it needs a migration from existing sites.

## Known quirks

- PHP package/vendor branding is `DLXPlugins`; block namespace prefix is historical `mediaron/`.
- Chakra block source lives in `src/js/blocks/chakraui/` while the alert group slug is `chakra`.
- Built assets (`build/`, `dist/`) are committed and included in the release zip — always run `npm run build` before packaging.
- Admin settings use admin-ajax, not the REST API; REST is used for the URL/page search picker only.
- Disabling a block theme in settings only removes it from the inserter; existing blocks still render.

## Recommended first week for a new maintainer

1. Read [AGENTS.md](AGENTS.md), [CONTRIBUTING.md](CONTRIBUTING.md), and [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).
2. Confirm WordPress.org SVN and GitHub access; clone the docs repo.
3. Spin up a local WP install, activate the plugin, exercise all four blocks + shortcode + dismiss + settings.
4. Decide which public URLs and author metadata to update (and schedule a minor release if needed).
5. Remove or update the “up for adoption” messaging once ownership is settled.

## Security

See [SECURITY.md](SECURITY.md) for how to receive vulnerability reports after transfer. Update the contact method to the new maintainer’s preferred channel.
