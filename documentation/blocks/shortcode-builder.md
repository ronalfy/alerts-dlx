---
title: "Shortcode Builder"
---

# Shortcode Builder

The Shortcode Builder is a visual admin tool for constructing `[alertsdlx]` shortcodes without memorizing every parameter. It is available under **AlertsDLX → Shortcode Builder** in the WordPress admin.

## Opening the Builder

1. In the WordPress admin, go to **AlertsDLX → Shortcode Builder**.
2. Optionally choose a published global style. Appearance then comes from that style.
3. Configure content, button, alignment, and display conditions. Without a global style, also set the design, icon, and colors.
4. Copy the generated shortcode and paste it into any content area that processes shortcodes.

<!-- TODO: image - images/alerts-dlx-editor-chakra-side-options.jpg -->
<!-- Caption: Shortcode Builder Interface -->

## Builder Panels

### Alert Group and Style

Choose the alert group and alert type. Selecting **Custom** opens the color palette for custom colors. These appearance controls stay locked while a global style is selected.

### Content

Set the alert title and description. The description can also be entered as the inner content of the generated shortcode.

### Icon

* Open the icon picker and choose a preset from the Material, Chakra, or Bootstrap icon sets.
* Paste SVG on the picker's Custom SVG tab, then click **Set Icon**.
* Switch to an image icon and provide an image URL.
* Adjust **Icon size** and **Icon vertical alignment**.

<!-- TODO: image - images/alerts-blocks-icon-picker.jpg -->
<!-- Caption: Icon Picker in the Shortcode Builder -->

### Button

Enable a button and set:

* Button text
* Button URL
* Open in new tab
* `rel` attributes (nofollow, sponsored)

### Display Conditions

Toggle **Display Conditions** to schedule the alert or restrict it by URL parameters and user roles. See [Display Conditions](../shortcodes/display-conditions.md) for details on each rule.

<!-- TODO: image - images/alerts-dlx-editor-chakra-side-options.jpg -->
<!-- Caption: Display Conditions Panel -->

## Global style

At the top of **Appearance**, choose a published global style. The generated shortcode stores `global_style="your-slug"` and does not copy that style's appearance attributes. Title, description, buttons, dismiss, display conditions, and alignment stay editable.

Clear the global style to keep its current appearance on the shortcode and edit those fields directly.

If the slug is not a published global style, the builder keeps the slug, shows a notice, and leaves appearance editable.

## Generated Shortcode

As you adjust options, the builder updates the preview and the generated shortcode in real time. Copy the shortcode and paste it into any content area that processes shortcodes.

## Related

* [Shortcode Usage](../shortcodes/alertsdlx.md) — Full `[alertsdlx]` reference.
* [Display Conditions](../shortcodes/display-conditions.md) — Conditional display rules.
