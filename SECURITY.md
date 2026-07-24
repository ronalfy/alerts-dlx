# Security policy

## Supported versions

Please report security issues against the latest released version of AlertsDLX on [WordPress.org](https://wordpress.org/plugins/alerts-dlx/) or the current default branch on GitHub.

## Reporting a vulnerability

**Do not** open a public GitHub issue for security vulnerabilities.

Prefer one of these private channels:

1. **GitHub Security Advisories** on [ronalfy/alerts-dlx](https://github.com/ronalfy/alerts-dlx/security/advisories) (use “Report a vulnerability” if available).
2. **WordPress.org plugin security** processes for plugins hosted in the directory, when applicable.
3. Contact the current maintainer via the [adoption / contact form](https://mediaron.com/contact/adopt-a-plugin/) if advisory filing is unavailable.

Include:

- Plugin version and WordPress / PHP versions
- Steps to reproduce
- Impact (for example XSS, privilege escalation, CSRF)
- Any proof-of-concept details (kept private until a fix is released)

Please allow reasonable time for a fix and coordinated disclosure before publishing details.

## Scope notes for maintainers

- Custom SVG icons and shortcode/HTML content must remain sanitized.
- Admin AJAX and REST endpoints must keep capability and nonce checks.
- Headline tags and theme slugs must stay allowlisted (`Options` helpers).

After ownership transfer, update this file with the new maintainer’s preferred private contact.
