---
title: "Finding the Admin Settings"
---

# Finding the Admin Settings

Singular Alerts adds a site-wide settings screen for headline options, enabled block themes, and debug mode.

## Finding the Admin Settings from the Plugins Screen

On the **Plugins** screen, find **Singular Alerts** and click the **Settings** link in the plugin row.

## Finding the Admin Settings from the Menu

In the WordPress admin menu, go to **Settings → AlertsDLX**.

## Available Settings

### Alert Title Options

Configure how alert titles render across your site (blocks and shortcodes).

#### Title Element

Choose the HTML element used for alert titles:

* `h1` through `h6`
* `div`

The default is `h2`. This helps match your site's heading hierarchy for SEO and accessibility. For more guidance, see [Headline and Title Settings](../overview/headline-and-title-settings.md).

#### Custom Headline Classes

Add comma-separated CSS class names applied to alert titles in addition to the default `alerts-dlx-title` class. You can enter `my-class` or `.my-class` — both formats are accepted.

Common use case: exclude alert titles from table-of-contents plugins by adding a class your TOC plugin ignores (for example, `no-toc`).

#### Force Headline Size

When enabled, Singular Alerts adds `!important` CSS rules to alert title font size and weight so plugin styles win over aggressive theme CSS. Enable this if your theme overrides alert headline sizing.

### Alert Themes

Select which alert block themes appear in the block inserter:

* Bootstrap
* Chakra
* Material
* Shoelace

At least one theme must remain enabled. Disabling a theme hides it from the inserter only — existing alerts on your site are not affected.

### Debug Mode

When enabled, Singular Alerts shows useful debugging information in the admin area. Leave this off on production sites unless you are troubleshooting.

## Saving Settings

Use the save bar at the bottom of the screen to **Save**, **Discard** unsaved changes, or **Reset** all settings to defaults.
