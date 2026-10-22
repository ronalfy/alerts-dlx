# Shortcode Builder

The Shortcode Builder is a visual admin tool for constructing `[alertsdlx]` shortcodes without memorizing every parameter. It is available under **AlertsDLX → Shortcode Builder** in the WordPress admin.

## Opening the Builder

1. In the WordPress admin, go to **AlertsDLX → Shortcode Builder**.
2. Select an alert group (Bootstrap, Chakra, Material, or Shoelace).
3. Configure styles, content, icon, button, and display conditions in the sidebar panels.
4. Copy the generated shortcode or insert it directly into the editor.

<!-- TODO: image - images/alerts-dlx-editor-chakra-side-options.jpg -->
<!-- Caption: Shortcode Builder Interface -->

## Builder Panels

### Alert Group and Style

Choose the alert group and alert type. Selecting **Custom** opens the color palette for custom colors.

### Content

Set the alert title and description. The description can also be entered as the inner content of the generated shortcode.

### Icon

* Pick a preset icon from Material, Chakra, or Bootstrap icon sets.
* Paste custom SVG markup.
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

## Presets and Global Styles

The builder supports presets and global styles. Once you save a configuration, you can reuse it across your site. Global styles let you define default values that new shortcodes inherit.

## Generated Shortcode

As you adjust options, the builder updates the preview and the generated shortcode in real time. Copy the shortcode and paste it into any content area that processes shortcodes.

## Related

* [Shortcode Usage](../shortcodes/alertsdlx.md) — Full `[alertsdlx]` reference.
* [Display Conditions](../shortcodes/display-conditions.md) — Conditional display rules.
