import "./js/blocks/alert";
import "./js/blocks/material";
import "./js/blocks/chakraui";
import "./js/blocks/bootstrap";
import "./js/blocks/shoelace";
import "./js/blocks/plugins/advanced-inner-blocks";
import "./js/blocks/plugins/editorial-only";
import "./js/blocks/plugins/custom-colors";
import "./js/blocks/plugins/icon-image-selector";
import "./js/blocks/plugins/inner-block-parent-toolbar";
import "./js/blocks/plugins/alert-group-guard";
import "./js/blocks/plugins/alert-style-toolbar";
// Imported after the style toolbar so this control renders immediately to its left.
import "./js/blocks/plugins/alert-group-toolbar";
import "./js/blocks/plugins/alert-elements-toolbar";
import "./js/blocks/plugins/alert-close-expiration-toolbar";
import "./js/blocks/plugins/button-sidebar-panel";
import "./js/blocks/plugins/global-style-resolution";
import "./js/blocks/plugins/margin-spacing-defaults";
import AlertsLogo from "./js/blocks/components/icons/AlertsLogo";
import GreenAlertsLogo from "./js/blocks/components/icons/GreenAlertsLogo";

(function () {
  wp.blocks.updateCategory("alertsdlx", {
    icon: <GreenAlertsLogo width={16} height={16} />,
  });
  wp.blocks.updateCategory("alertsdlx-legacy", {
    icon: <AlertsLogo width={16} height={16} />,
  });
})();
