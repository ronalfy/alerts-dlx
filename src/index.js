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
import "./js/blocks/plugins/alert-elements-toolbar";
import "./js/blocks/plugins/alert-close-expiration-toolbar";
import "./js/blocks/plugins/button-sidebar-panel";
import AlertsLogo from "./js/blocks/components/icons/AlertsLogo";

(function () {
  wp.blocks.updateCategory("alertsdlx", {
    icon: <AlertsLogo width={16} height={16} />,
  });
})();
