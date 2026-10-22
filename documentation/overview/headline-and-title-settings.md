---
title: "Headline and Title Settings"
---

# Headline and Title Settings

Singular Alerts provides site-wide controls for how alert titles are rendered. These settings apply to all alert blocks and shortcodes on your site.

Configure them under **Settings → AlertsDLX**. See [Finding the Admin Settings](../getting-started/finding-the-admin-settings.md).

## Title Element (h1–h6 or div)

Alert titles use a configurable HTML heading element. The default is `h2`.

### Why It Matters

* **SEO** — Match your site's heading hierarchy. If page titles are `h1`, alert titles are often `h2` or `h3`.
* **Accessibility** — Screen readers use heading structure to navigate content.
* **Theme compatibility** — Some themes style `h3` or `h4` differently than `h2`.

Allowed values: `h1`, `h2`, `h3`, `h4`, `h5`, `h6`, `div`.

The `div` option outputs a non-heading element when you want alert titles to avoid affecting document outline.

## Custom Headline Classes

Add comma-separated CSS classes applied to alert titles alongside the default `alerts-dlx-title` class.

### Table of Contents Exclusion

Many TOC plugins scan headings on a page. If alert titles appear in your table of contents, add a class your TOC plugin excludes:

```
no-toc, alerts-heading-exclude
```

Enter classes in **Settings → AlertsDLX → Custom Headline Classes**. Both `my-class` and `.my-class` formats are accepted.

### Third-Party Integrations

Custom classes also help when other plugins or theme CSS target specific selectors. Add integration-specific classes without modifying plugin templates.

## Force Headline Size

Aggressive theme CSS sometimes overrides alert title font size, weight, or line height. When **Force Headline Size** is enabled, Singular Alerts adds a wrapper class (`is-headline-size-forced`) and applies `!important` rules so plugin title styles take precedence.

Enable this if alert titles look too large, too small, or inconsistent compared to the block editor preview.

## Developer Filters

Developers can filter headline behavior programmatically. See [Filters and Hooks](../developers/filters-and-hooks.md) for `alerts_dlx_headline_style`, `alerts_dlx_headline_custom_classes`, and `alerts_dlx_headline_force_size`.

Note: `alerts_dlx_headline_style` is validated server-side — only `h1` through `h6` and `div` are allowed in output, regardless of filter return value.
