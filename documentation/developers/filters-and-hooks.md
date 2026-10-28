---
title: "Filters and Hooks"
---

# Filters and Hooks

Singular Alerts exposes WordPress filters for customizing fonts, headlines, block availability, content processing, and branding.

Add filter callbacks in a custom plugin or your theme's `functions.php`.

## Fonts

### `alerts_dlx_load_fonts`

Control whether Singular Alerts loads the bundled Lato Google Font.

```php
add_filter( 'alerts_dlx_load_fonts', '__return_false' );
```

### `alerts_dlx_default_font_family`

Set the font family used when custom fonts are disabled.

```php
add_filter(
	'alerts_dlx_default_font_family',
	function () {
		return 'Raleway, sans-serif';
	}
);
```

See [Custom Fonts](custom-fonts.md) for a complete example.

## Headline and Title

### `alerts_dlx_headline_style`

Filter the HTML element used for alert titles (`h1`–`h6` or `div`).

```php
add_filter(
	'alerts_dlx_headline_style',
	function () {
		return 'h3';
	}
);
```

**Security note:** The return value is validated server-side. Only `h1`, `h2`, `h3`, `h4`, `h5`, `h6`, and `div` are allowed in output. Any other value falls back to `h2`.

### `alerts_dlx_headline_custom_classes`

Filter space-separated CSS classes applied to alert title elements (in addition to `alerts-dlx-title`).

```php
add_filter(
	'alerts_dlx_headline_custom_classes',
	function ( $classes ) {
		return $classes . ' no-toc';
	}
);
```

### `alerts_dlx_headline_force_size`

Filter whether alert title font size is forced over theme styles.

```php
add_filter( 'alerts_dlx_headline_force_size', '__return_true' );
```

## Block Themes

### `alerts_dlx_enabled_block_styles`

Filter which alert block themes are available. Default includes `bootstrap`, `chakra`, `material`, and `shoelace`.

```php
add_filter(
	'alerts_dlx_enabled_block_styles',
	function ( $styles ) {
		return array( 'chakra' );
	}
);
```

## Content and Colors

### `alerts_dlx_the_content`

Filter alert description content before output (shortcode inner content and `alert_description`). Runs through the same pipeline as `the_content` filters.

```php
add_filter( 'alerts_dlx_the_content', 'wpautop' );
```

### `alerts_dlx_color_palette`

Filter the color palette available for custom alert colors in the block editor.

```php
add_filter(
	'alerts_dlx_color_palette',
	function ( $palette ) {
		// Modify $palette array.
		return $palette;
	}
);
```

## REST API

### `alerts_dlx_rest_post_types_to_search`

Filter post types searched when picking button links in the block editor. Default: public, viewable post types (posts, pages, and public custom post types). Attachments, revisions, and nav menu items are excluded.

```php
add_filter(
	'alerts_dlx_rest_post_types_to_search',
	function ( $post_types ) {
		$post_types[] = 'product';
		return $post_types;
	}
);
```

## Branding (Admin)

These filters customize plugin metadata shown in the WordPress admin:

| Filter | Default |
| --- | --- |
| `alerts_dlx_plugin_name` | AlertsDLX |
| `alerts_dlx_plugin_description` | Plugin description string |
| `alerts_dlx_plugin_uri` | https://dlxplugins.com/plugins/alertsdlx |
| `alerts_dlx_plugin_author` | MediaRon LLC |
| `alerts_dlx_plugin_author_uri` | https://mediaron.com |
| `alerts_dlx_plugin_support_uri` | https://dlxplugins.com/support/ |
| `alerts_dlx_plugin_docs_uri` | https://alertsdlx.dlxplugins.com/ |
| `alerts_dlx_plugin_menu_title` | AlertsDLX |

Example:

```php
add_filter(
	'alerts_dlx_plugin_name',
	function () {
		return 'My Custom Alerts';
	}
);
```

## Related

* [Headline and Title Settings](../overview/headline-and-title-settings.md)
* [Finding the Admin Settings](../getting-started/finding-the-admin-settings.md)
