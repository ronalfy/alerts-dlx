# Features

For such a small plugin, Singular Alerts comes with many features.

### Shortcode and Block Support

Whether using the classic or block editor, you can use Singular Alerts to output beautiful alert boxes.

See [Shortcode Usage](../shortcodes/alertsdlx.md) for the full `[alertsdlx]` reference.

### Four Alert Blocks — and Many Styles to Choose From

The plugin comes with blocks inspired by four UI component libraries:

* Bootstrap
* Chakra
* Material
* Shoelace

Each has its own unique style and variations, which can be configured on the block itself or in the sidebar options.

<!-- TODO: image - images/alerts-dlx-editor-chakra-side-options.jpg -->
<!-- Caption: Chakra Alert Sidebar Options -->

### Styles Make the Block Customizable

Each block has several theme styles to choose from. For example, the Bootstrap alert block has a handful of available style options.

<!-- TODO: image - images/alerts-dlx-editor-block-alert-types-bootstrap.jpg -->
<!-- Caption: Bootstrap Alert Block with Several Style Options -->

Please view the example below for how multiple blocks can look depending on the style chosen.

<!-- TODO: image - images/alerts-dlx-editor-three-blocks.jpg -->
<!-- Caption: Different Alert Styles -->

### Style Variants

In addition to different styles, each block has its own variants.

<!-- TODO: image - images/alerts-dlx-editor-chakra-warning-solid-variant.jpg -->
<!-- Caption: Chakra Alert Block With Warning Style and Solid Variant -->

Here's an example of a centered variant of the Warning style.

<!-- TODO: image - images/alerts-dlx-editor-chakra-warning-centered-variant.jpg -->
<!-- Caption: Chakra UI Centered Variant (Warning style) -->

### Icon Selector

Singular Alerts comes with a custom icon selector that allows for easy insertion of different icons.

Simply click on the icon and you'll be able to select a new one.

<!-- TODO: image - images/alerts-dlx-editor-block-icon-selector.jpg -->
<!-- Caption: The Icon Selector Makes Selecting an Icon Easy -->

In addition to icons, you can also insert your own SVGs instead of the pre-selected icons.

<!-- TODO: image - images/alerts-dlx-editor-icon-svg-selector.jpg -->
<!-- Caption: Insert Custom SVG Code for Custom Icons -->

[alertsdlx alert_group="chakra" alert_type="info" alert_title="Inspired by GenerateBlocks"]The icon selector and SVG compatibility was inspired by the <a href="https://wordpress.org/plugins/generateblocks/">GenerateBlocks</a> plugin.[/alertsdlx]

Singular Alerts has icons from the following sources.

* [Google Fonts Material Icons](https://fonts.google.com/icons)
* [Chakra UI Icons](https://github.com/chakra-ui/chakra-ui/tree/main/packages/components/icons/src) (GitHub)
* [Bootstrap Icons](https://icons.getbootstrap.com/)

### Disable or Enable Elements

With the block options, you can enable or disable the title, description, icon, and button.

<!-- TODO: image - images/alerts-dlx-editor-alert-settings-side-panel.jpg -->
<!-- Caption: Enable or Disable Alert Options -->

For example, a button isn't shown by default. You can enable a button using the above options.

<!-- TODO: image - images/alerts-dlx-editor-chakra-left-accent-w-button.jpg -->
<!-- Caption: Chakra Alert with a Button -->

[alertsdlx alert_group="chakra" alert_type="info" alert_title="Buttons"]The UI libraries didn't include button styles, but CTAs are important for alerts, so it was added in as a feature.[/alertsdlx]

### Button Link Options

With the inclusion of buttons comes a mechanism to link out to your resource. Add a link and set it to launch in a new window, and modify the `rel` attributes for nofollow or sponsored links.

<!-- TODO: image - images/alerts-dlx-editor-button-link-options.jpg -->
<!-- Caption: Button Link Options -->

### Set the Container's Maximum Width

The block has different alignment options, but if you choose a centered, wide, or full-width alignment, you may find the block to be too wide when viewed on the front-end.

With a Maximum Width option, you can adjust how wide your alert block can be when viewed at wider widths.

<!-- TODO: image - images/alerts-dlx-editor-max-width-option.jpg -->
<!-- Caption: Maximum Width Option -->

Each width can be adjusted via pixel, percentage, or viewport width.

### Change the Base Font Size

The styles for the alert blocks are all relative to a base font size. You can adjust this base to be smaller or bigger depending on your needs.

<!-- TODO: image - images/alerts-dlx-editor-adjust-font-size.jpg -->
<!-- Caption: Adjust a Base Font Size -->

### Icon Size

Fine-tune the size of the alert icon independently of the base font size. This is useful when you want a larger or smaller icon relative to the alert text.

### Typography

The Lato Google Font is used on the front-end to allow the alerts to stand out even more. You can disable it and use your own font via filters — see [Custom Fonts](../developers/custom-fonts.md).

<!-- TODO: image - images/alerts-dlx-editor-chakra-solid-preview.jpg -->
<!-- Caption: Chakra Solid Info Alert Block -->

<!-- TODO: image - images/alerts-dlx-editor-bootstrap-warning-preview.jpg -->
<!-- Caption: Bootstrap Warning Alert Block -->

### Display Conditions

Show or hide alerts based on date, day of week, URL parameters, or user roles. Display conditions are available in the block sidebar and in the `[alertsdlx]` shortcode. See [Display Conditions](../shortcodes/display-conditions.md).

### Site-Wide Admin Settings (2.4.0+)

Configure headline elements, custom title classes, enabled block themes, and more under **Settings → AlertsDLX**. See [Finding the Admin Settings](../getting-started/finding-the-admin-settings.md).
