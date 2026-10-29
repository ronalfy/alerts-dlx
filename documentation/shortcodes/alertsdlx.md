---
title: "Shortcode Usage"
---

# Shortcode Usage

To use Singular Alerts as a shortcode, you can use the following format:

```markup
[alertsdlx alert_group="bootstrap"]Alert Description[/alertsdlx]
```

Here are the parameters you can use, with examples for each.

## unique_id

Add a unique ID around the alerts container. This is useful if you need to style the alert.

```html
[alertsdlx unique_id="my-unique-id" alert_title="this is a title"]Alert Description[/alertsdlx]
```

## global_style

Slug of a published global style. Appearance (design, colors, icon, width, margin, and font size) comes from that style when the shortcode renders. Title, description, buttons, dismiss, display conditions, and alignment stay on the shortcode.

```html
[alertsdlx global_style="custody-notice" alert_title="Heading"]Body text[/alertsdlx]
```

Editing the global style updates every shortcode that uses its slug. Renaming the slug means updating those shortcodes. If the slug is missing or unpublished, the shortcode renders its own appearance attributes.

## alert_group

The type of alert style to use. This can be:

* bootstrap
* chakra
* material
* shoelace

## alert_type

For Bootstrap, alert types can be:

* primary
* secondary
* success
* danger
* warning
* info
* light
* dark
* custom (see custom colors)

For Chakra, alert types can be:

* success
* info
* warning
* error
* custom (see custom colors)

For Material, alert types can be:

* success
* info
* warning
* error
* custom (see custom colors)

For Shoelace, alert types can be:

* primary
* success
* neutral
* warning
* danger
* custom (see custom colors)

Example shortcode use:

```
[alertsdlx alert_title="this is a title" alert_group="bootstrap" mode="light" alert_type="secondary" ]Alert Description[/alertsdlx]
```

## align

Can be:

* center
* wide
* full
* left
* right

Example shortcode use:

```
[alertsdlx alert_title="this is a title" alert_group="bootstrap" mode="light" align="left" alert_type="secondary" ]Alert Description[/alertsdlx]
```

## alert_title

Use this parameter if you'd like to set an alert title.

```
[alertsdlx alert_title="this is a title"]
```

## alert_description

Use this parameter to set the alert description.

```
[alertsdlx alert_title="this is a title" alert_description="this is a test"]
```

You can also place the description within the shortcode.

```
[alertsdlx alert_title="this is a title"]This is a much longer description that can go inside the shortcode.[/alertsdlx]
```

## maximum_width and maximum_width_unit

Set the maximum width for the alert.

Can be any CSS unit. For example:

* px
* em
* %
* vw
* vh

The following sets a max width of 500 pixels.

```
[alertsdlx alert_title="this is a title" alert_description="test" maximum_width_unit="px" maximum_width="500"]
```

## icon

This takes SVG markup if you would like an icon to show. You may need to replace the double quotes with single quotes in order to have it work within the shortcode.

For example:

```
[alertsdlx alert_title="this is a title" alert_description="test" icon="<svg xmlns='http://www.w3.org/2000/svg' height='1em' viewBox='0 0 448 512'><path d='M256 0H192V51.2C119 66 64 130.6 64 208v88L0 368v48H448V368l-64-72V208c0-77.4-55-142-128-156.8V0zm32 448H224 160c0 17 6.7 33.3 18.7 45.3s28.3 18.7 45.3 18.7s33.3-6.7 45.3-18.7s18.7-28.3 18.7-45.3z'/></svg>"]
```

## icon_size

Set the size of the icon in pixels. This works with both SVG icons and image icons.

```
[alertsdlx alert_title="this is a title" alert_description="test" icon_size="48"]
```

## icon_vertical_alignment

Can be:

* top
* centered

Example:

```
[alertsdlx alert_title="this is a title" alert_description="test" icon="<svg xmlns='http://www.w3.org/2000/svg' height='1em' viewBox='0 0 448 512'><path d='M256 0H192V51.2C119 66 64 130.6 64 208v88L0 368v48H448V368l-64-72V208c0-77.4-55-142-128-156.8V0zm32 448H224 160c0 17 6.7 33.3 18.7 45.3s28.3 18.7 45.3 18.7s33.3-6.7 45.3-18.7s18.7-28.3 18.7-45.3z'/></svg>" icon_vertical_alignment="centered"]
```

## icon_appearance

Can be:

* default
* rounded

Example:

```
[alertsdlx alert_title="this is a title" alert_description="test" icon="<svg xmlns='http://www.w3.org/2000/svg' height='1em' viewBox='0 0 448 512'><path d='M256 0H192V51.2C119 66 64 130.6 64 208v88L0 368v48H448V368l-64-72V208c0-77.4-55-142-128-156.8V0zm32 448H224 160c0 17 6.7 33.3 18.7 45.3s28.3 18.7 45.3 18.7s33.3-6.7 45.3-18.7s18.7-28.3 18.7-45.3z'/></svg>" icon_appearance="rounded"]
```

## icon_source

Can be:

* icon
* image

Use with `image_url` below.

## image_url

If `icon_source` is an `image`, then provide the image's URL to display in place of an icon.

Example:

```
[alertsdlx alert_title="this is a title" alert_description="test" icon_source="image" image_url="https://domain.local/wp-content/uploads/2025/12/cropped-site-icon-green.png"]
```

## base_font_size

In pixels, what should be the base font size of the alert? The size of the text and icons scales to the base font size, particularly on mobile and desktop.

Example:

```
[alertsdlx alert_title="this is a title" alert_description="test" base_font_size="20"]
```

## variant

What variant to use for the alert?

For Bootstrap, variants are:

* default
* centered

For Chakra, variants are:

* subtle
* solid
* left-accent
* top-accent
* centered

For Material, variants are:

* default
* outlined
* filled
* centered

For Shoelace, variants are:

* top-accent
* left-accent
* solid
* centered

Shortcode example:

```
[alertsdlx alert_group="chakra" variant="solid" alert_type="warning" icon="" alert_title="There has been a mistake"]An error Occurred[/alertsdlx]
```

## mode

Choose dark or light mode. Properties can be:

* dark
* light

[alertsdlx alert_group="chakra" alert_type="warning" alert_title="Dark Mode"]Dark mode isn't available for the <strong>bootstrap</strong> alert group.[/alertsdlx]

```
[alertsdlx alert_group="chakra" variant="solid" alert_type="warning" icon="" mode="dark" alert_title="There has been a mistake"]An error Occurred[/alertsdlx]
```

## button_text and button_url

If showing a button, what text should go inside the button? In order to print a button, a URL must also be specified.

```
[alertsdlx alert_group="chakra" variant="solid" alert_type="warning" icon="" mode="light" alert_title="There has been a mistake" button_text="Accept" button_url="https://mediaron.com"]An error Occurred[/alertsdlx]
```

## button_target

This can be `true` or `false`. If `true`, the URL will open in a new window.

```
[alertsdlx alert_group="chakra" variant="solid" alert_type="warning" icon="" mode="light" alert_title="There has been a mistake" button_text="Accept" button_url="https://mediaron.com" button_target="true"]An error Occurred[/alertsdlx]
```

## button_rel_no_follow

This can be `true` or `false`. If `true`, the URL will be wrapped in a no-follow attribute.

```
[alertsdlx alert_group="chakra" variant="solid" alert_type="warning" icon="" mode="light" alert_title="There has been a mistake" button_text="Accept" button_url="https://mediaron.com" button_target="true" button_rel_no_follow="true"]An error Occurred[/alertsdlx]
```

## Custom Colors

If you have a custom alert type for parameter `alert_type`, you can specify these in the shortcode:

* **color_primary** (primarily used for the text color)
* **color_border**
* **color_accent** (used for the link color)
* **color_alt** (used as a background color for the button)
* color_alt_hover (background color hover for buttons)
* color_alt_text (text color for buttons)
* color_alt_text_hover (text color for buttons on hover)
* **color_bold** (used as an icon color)
* **color_light** (primarily used as a background color)

```
[alertsdlx alert_group="bootstrap" alert_type="custom" color_primary="#333" color_border="#000" color_accent="#035e88" color_alt="#0277bd" color_bold="#03a9f4" color_light="#e5f6fd"]Alert Description[/alertsdlx]
```

## Close Button

You can add a close button to the alert. Use the following parameters together:

* **close_button_enabled** — Whether to show the close button (`true` or `false`)
* **close_button_expiration** — Time in seconds to remember dismissal. Set to `0` for session-only (no cookie persistence).

See [Dismissible Alerts](../overview/dismissible-alerts.md) for more detail.

```
[alertsdlx alert_group="bootstrap" close_button_enabled="true" close_button_expiration="86400"]Alert Description[/alertsdlx]
```

## Display Conditions

You can conditionally show or hide a shortcode based on date, day of week, URL parameters, or user roles. See [Display Conditions](display-conditions.md) for the full list of parameters and examples.
