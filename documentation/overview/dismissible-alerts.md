# Dismissible Alerts

Singular Alerts supports dismissible alerts with an optional close button. When a visitor dismisses an alert, the plugin can remember that choice using a browser cookie.

## Enabling the Close Button

### In the Block Editor

1. Select an alert block.
2. Enable the **Close Button** toggle in the block toolbar or in the **Settings** sidebar panel.

When the close button is enabled, a **Close expiration** toolbar control appears with presets for how long dismissal should be remembered.

### In Shortcodes

Use these parameters together:

* `close_button_enabled="true"`
* `close_button_expiration` — time in seconds to remember dismissal

Example (remember for 24 hours):

```
[alertsdlx alert_group="bootstrap" close_button_enabled="true" close_button_expiration="86400"]Alert Description[/alertsdlx]
```

See the full [shortcode reference](../shortcodes/alertsdlx.md).

## How Dismissal Works

When a visitor clicks the close button:

1. The alert animates out and is removed from the page.
2. If expiration is greater than `0`, a cookie is set named `alerts-dlx-{uniqueId}` with the value `dismissed`.
3. On subsequent page loads, the server checks for that cookie before rendering. If found, the alert is not output at all.

### Expiration Values

| Value | Behavior |
| --- | --- |
| `0` | Session-only — no cookie is saved. The alert reappears on the next page load. |
| `3600` | Remember for 1 hour |
| `86400` | Remember for 24 hours |
| `604800` | Remember for 7 days |
| Custom | Any positive integer (seconds) |

Use toolbar presets in the block editor or set `close_button_expiration` directly in shortcodes.

## Unique IDs

Each alert has a `uniqueId` attribute used for cookie names and CSS targeting. If you need a stable ID for styling or dismissal across environments, set `unique_id` in shortcodes or use the block's anchor/HTML anchor support.

## Site-Wide Notices

Dismissible alerts work well in FSE template parts or global headers. A visitor who dismisses a site-wide notice will not see it again until the cookie expires (or they clear cookies).

For conditional display (logged-in users only, empty cart, etc.), pair Singular Alerts with a visibility plugin such as [Block Visibility](https://blockvisibilitywp.com/).
