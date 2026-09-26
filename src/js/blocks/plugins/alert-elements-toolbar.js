/**
 * Block toolbar dropdown for alert element visibility on AlertsDLX blocks.
 */

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
import { __ } from "@wordpress/i18n";
import { ALERT_BLOCK_NAMES } from "../utils/alert-parent-inspector";
import {
  ALERT_ELEMENT_TOGGLES,
  toggleAlertElement,
} from "../utils/alert-elements-utils";

/**
 * HOC that adds alert element visibility toggles to alert block toolbars.
 *
 * @param {Function} BlockEdit Original BlockEdit component.
 * @return {Function}
 */
const withAlertElementsToolbar = createHigherOrderComponent((BlockEdit) => {
  return (props) => {
    const { name, attributes, setAttributes } = props;

    if (!ALERT_BLOCK_NAMES.includes(name)) {
      return <BlockEdit {...props} />;
    }

    return (
      <>
        <BlockControls>
          <ToolbarGroup label={__("Alert elements", "alerts-dlx")}>
            <ToolbarItem>
              {(toggleProps) => (
                <DropdownMenu
                  icon={"admin-generic"}
                  label={__("Alert elements", "alerts-dlx")}
                  className="alerts-dlx-alert-elements-toolbar"
                  toggleProps={toggleProps}
                >
                  {() => (
                    <MenuGroup label={__("Alert elements", "alerts-dlx")}>
                      {ALERT_ELEMENT_TOGGLES.map((toggle) => {
                        const isEnabled = attributes[toggle.attribute];

                        return (
                          <MenuItem
                            key={toggle.attribute}
                            role="menuitemcheckbox"
                            isSelected={isEnabled}
                            icon={isEnabled ? "yes" : null}
                            onClick={() => {
                              toggleAlertElement(
                                toggle.attribute,
                                isEnabled,
                                setAttributes
                              );
                            }}
                          >
                            {toggle.label}
                          </MenuItem>
                        );
                      })}
                    </MenuGroup>
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
}, "withAlertElementsToolbar");

addFilter(
  "editor.BlockEdit",
  "alerts-dlx/alert-elements-toolbar",
  withAlertElementsToolbar,
  10
);
