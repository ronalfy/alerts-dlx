/**
 * Toolbar controls on alert inner blocks to jump to parent alert Settings/Styles.
 */

import { addFilter } from "@wordpress/hooks";
import { createHigherOrderComponent } from "@wordpress/compose";
import { useSelect } from "@wordpress/data";
import { BlockControls } from "@wordpress/block-editor";
import { ToolbarGroup, ToolbarButton } from "@wordpress/components";
import { cog, styles } from "@wordpress/icons";
import { __ } from "@wordpress/i18n";
import {
  ALERT_BLOCK_NAMES,
  getAlertAncestorClientId,
  openAlertParentInspectorTab,
} from "../utils/alert-parent-inspector";

/**
 * HOC that adds alert parent navigation to inner block toolbars.
 *
 * @param {Function} BlockEdit Original BlockEdit component.
 * @return {Function}
 */
const withInnerBlockParentToolbar = createHigherOrderComponent((BlockEdit) => {
  return (props) => {
    const { clientId, name } = props;

    if (ALERT_BLOCK_NAMES.includes(name)) {
      return <BlockEdit {...props} />;
    }

    const alertAncestorClientId = useSelect(
      (selectFn) => getAlertAncestorClientId(clientId, selectFn),
      [clientId]
    );

    return (
      <>
        {alertAncestorClientId && (
          <BlockControls group="other">
            <ToolbarGroup className="alerts-dlx-inner-block-parent-toolbar">
              <ToolbarButton
                icon={cog}
                label={__("Alert settings", "alerts-dlx")}
                onClick={() => {
                  openAlertParentInspectorTab(
                    alertAncestorClientId,
                    "settings"
                  );
                }}
              />
              <ToolbarButton
                icon={styles}
                label={__("Alert styles", "alerts-dlx")}
                onClick={() => {
                  openAlertParentInspectorTab(alertAncestorClientId, "styles");
                }}
              />
            </ToolbarGroup>
          </BlockControls>
        )}
        <BlockEdit {...props} />
      </>
    );
  };
}, "withInnerBlockParentToolbar");

addFilter(
  "editor.BlockEdit",
  "alerts-dlx/inner-block-parent-toolbar",
  withInnerBlockParentToolbar
);
