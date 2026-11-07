---
title: "Dialog Alerts"
---

# Dialog Alerts

An alert can stay out of the page until a visitor opens it. Turn on **Open in a dialog** in the block's Alert Settings, or set `modal_enabled="true"` on the `[alertsdlx]` shortcode.

The block editor keeps the alert on the canvas, with a blue dashed border and an Alert Dialogue label. On the front end the alert is inside a closed `<dialog class="alerts-dlx-dialog">` until a trigger opens it. Closing the dialog — Escape, the backdrop, or the close control — only hides it. The same trigger can open it again, including after a later page load. Dialog alerts do not set a dismiss cookie.

Give the alert a stable **Unique ID**. Triggers use that id.

## Ways to open the dialog

Replace `promo` with the alert's unique id.

* Link: `<a href="#promo">Open the alert</a>`. The hash stays in the URL, and a visit to that URL opens the dialog. `#promo-dialog` also works.
* Button class: `<button type="button" class="modal-promo">Open the alert</button>`. `alerts-dlx-open-promo` is the same kind of class with a name that will not clash with other modal styles.
* Data attribute, on a link or a button: `<button type="button" data-alerts-dlx-open="promo">Open the alert</button>`.
* Native button command, where the browser supports it: `<button type="button" commandfor="promo-dialog" command="show-modal">Open the alert</button>`.

Class and data triggers do not change the URL. The hash link does.

Another script can open the same dialog:

```js
document.dispatchEvent(
  new CustomEvent( 'alerts-dlx-open', { detail: { id: 'promo' } } )
);
```

A dialog always includes the close button. In the editor that setting stays on and cannot be switched off while **Open in a dialog** is enabled. Its expiration time stays hidden, because closing the dialog does not remember a dismissal.
