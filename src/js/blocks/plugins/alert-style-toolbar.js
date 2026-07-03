/**
 * Block toolbar dropdown for selecting alert styles on AlertsDLX blocks.
 */

import { useMemo } from "@wordpress/element";
import { addFilter } from "@wordpress/hooks";
import { createHigherOrderComponent } from "@wordpress/compose";
import { BlockControls } from "@wordpress/block-editor";
import {
  ToolbarItem,
  ToolbarGroup,
  DropdownMenu,
  MenuGroup,
  MenuItem,
} from "@wordpress/components";
import { styles as stylesIcon } from "@wordpress/icons";
import { __ } from "@wordpress/i18n";
import { ALERT_BLOCK_NAMES } from "../utils/alert-parent-inspector";
import {
  getAlertStyleOptions,
  applyAlertStyle,
  openAlertInspectorTab,
  getCurrentStyleLabel,
} from "../utils/alert-style-utils";

/**
 * HOC that adds an alert style dropdown to alert block toolbars.
 *
 * @param {Function} BlockEdit Original BlockEdit component.
 * @return {Function}
 */
const withAlertStyleToolbar = createHigherOrderComponent((BlockEdit) => {
  return (props) => {
    const { name, attributes, setAttributes, clientId } = props;

    if (!ALERT_BLOCK_NAMES.includes(name)) {
      return <BlockEdit {...props} />;
    }

    const { alertType, className } = attributes;

    const { presets, customLabel } = useMemo(
      () => getAlertStyleOptions(name),
      [name]
    );

    const currentStyleLabel = getCurrentStyleLabel(
      alertType,
      presets,
      customLabel
    );

    return (
      <>
        <BlockControls>
          <ToolbarGroup label={__("Alert style", "alerts-dlx")}>
            <ToolbarItem>
              {(toggleProps) => (
                <DropdownMenu
                  icon={stylesIcon}
                  label={__("Alert style", "alerts-dlx")}
                  text={currentStyleLabel}
                  className="alerts-dlx-alert-style-toolbar"
                  toggleProps={toggleProps}
                >
                  {({ onClose }) => (
                    <>
                      <MenuGroup label={__("Styles", "alerts-dlx")}>
                        {presets.map((style) => (
                          <MenuItem
                            key={style.name}
                            role="menuitemradio"
                            isSelected={alertType === style.name}
                            onClick={() => {
                              applyAlertStyle({
                                className,
                                styleName: style.name,
                                setAttributes,
                              });
                              onClose();
                            }}
                            icon={alertType === style.name ? "yes" : null}
                          >
                            {style.label}
                          </MenuItem>
                        ))}
                        <MenuItem
                          role="menuitemradio"
                          isSelected={"custom" === alertType}
                          onClick={() => {
                            applyAlertStyle({
                              className,
                              styleName: "custom",
                              setAttributes,
                            });
                            openAlertInspectorTab(clientId, "styles");
                            onClose();
                          }}
                          icon={alertType === "custom" ? "yes" : null}
                        >
                          {customLabel}
                        </MenuItem>
                      </MenuGroup>
                    </>
                  )}
                </DropdownMenu>
              )}
            </ToolbarItem>
          </ToolbarGroup>
        </BlockControls>
        <BlockEdit {...props} />
      </>
    );
  };
}, "withAlertStyleToolbar");

addFilter(
  "editor.BlockEdit",
  "alerts-dlx/alert-style-toolbar",
  withAlertStyleToolbar
);
