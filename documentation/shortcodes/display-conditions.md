# Display Conditions

Display conditions let you show or hide an alert based on date, day of week, URL parameters, or user roles. They are available in the block sidebar and as `[alertsdlx]` shortcode parameters.

## Enabling Display Conditions

All conditional rules are ignored unless `conditions_enabled` is set to `true`.

### In the Block Editor

1. Select an alert block.
2. Open the **Display Conditions** panel in the block sidebar.
3. Enable **Display Conditions**.
4. Configure one or more rules.

### In Shortcodes

Add `conditions_enabled="true"` and then set the rules you need.

```
[alertsdlx alert_group="bootstrap" conditions_enabled="true" start_date="2026-01-01T00:00" end_date="2026-01-31T23:59"]New year announcement[/alertsdlx]
```

## Available Parameters

### conditions_enabled

Turns display conditions on or off. Must be `true` for any rule to take effect.

```
[alertsdlx conditions_enabled="true" ...]...[/alertsdlx]
```

### start_date and end_date

Schedule the alert between two dates and times. Use the format `YYYY-MM-DDTHH:MM` (ISO datetime-local).

* `start_date` — show the alert on or after this date/time.
* `end_date` — show the alert on or before this date/time.

```
[alertsdlx alert_group="chakra" conditions_enabled="true" start_date="2026-12-01T00:00" end_date="2026-12-31T23:59"]Holiday hours[/alertsdlx]
```

### days_of_week

Restrict the alert to specific days. Provide a comma-separated list of lowercase day names.

Allowed values: `monday`, `tuesday`, `wednesday`, `thursday`, `friday`, `saturday`, `sunday`.

```
[alertsdlx alert_group="material" conditions_enabled="true" days_of_week="monday,wednesday,friday"]Weekend prep reminder[/alertsdlx]
```

### url_params

Show the alert only when specific URL query parameters are present and match. Multiple parameters can be supplied.

In the shortcode builder, this is configured as a list of key/value pairs. In the shortcode, it is passed as an array-style attribute.

```
[alertsdlx alert_group="shoelace" conditions_enabled="true" url_params="{\"source\":\"newsletter\"}"]Welcome, newsletter reader[/alertsdlx]
```

When using the shortcode builder, add each parameter key and value through the URL parameter repeater.

### required_roles

Show the alert only to logged-in users with at least one of the specified roles. Provide a comma-separated list of role slugs.

```
[alertsdlx alert_group="bootstrap" conditions_enabled="true" required_roles="administrator,editor"]Staff notice[/alertsdlx]
```

## How Conditions Are Evaluated

When `conditions_enabled` is true, the alert is rendered only if **all** active rules pass:

* If `start_date` and/or `end_date` are set, the current time must fall within the range.
* If `days_of_week` is set, today must be one of the listed days.
* If `url_params` is set, every listed parameter must be present in the current URL with a matching value.
* If `required_roles` is set, the current user must be logged in and have at least one of the listed roles.

If any active rule fails, the alert is not output.

## Combining Conditions

You can combine multiple rules. For example, show a Black Friday banner only on Fridays in November:

```
[alertsdlx alert_group="chakra" alert_type="warning" conditions_enabled="true" start_date="2026-11-01T00:00" end_date="2026-11-30T23:59" days_of_week="friday"]Black Friday deals are live[/alertsdlx]
```

## Related

* [Alert Blocks Overview](../blocks/alert-blocks-overview.md) — Block sidebar options.
* [Shortcode Usage](alertsdlx.md) — Full `[alertsdlx]` parameter reference.
