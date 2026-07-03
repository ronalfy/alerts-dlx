/**
 * Block toolbar dropdown for close button expiration on AlertsDLX blocks.
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
  ALERT_CLOSE_EXPIRATION_PRESETS,
  applyCloseButtonExpiration,
} from "../utils/alert-close-expiration-utils";

/**
 * HOC that adds close button expiration presets to alert block toolbars.
 *
 * @param {Function} BlockEdit Original BlockEdit component.
 * @return {Function}
 */
const withAlertCloseExpirationToolbar = createHigherOrderComponent(
  (BlockEdit) => {
    return (props) => {
      const { name, attributes, setAttributes } = props;

      if (!ALERT_BLOCK_NAMES.includes(name)) {
        return <BlockEdit {...props} />;
      }

      const { closeButtonEnabled, closeButtonExpiration } = attributes;

      if (!closeButtonEnabled) {
        return <BlockEdit {...props} />;
      }

      return (
        <>
          {" "}
          <BlockEdit {...props} />
          <BlockControls>
            <ToolbarGroup label={__("Close expiration", "alerts-dlx")}>
              <ToolbarItem>
                {(toggleProps) => (
                  <DropdownMenu
                    icon={"clock"}
                    label={__(
                      "Close button and expiration visibility duration",
                      "alerts-dlx"
                    )}
                    className="alerts-dlx-close-expiration-toolbar"
                    toggleProps={{
                      ...toggleProps,
                      children: (
                        <>
                          <span>{__("Close Expiration", "alerts-dlx")}</span>
                        </>
                      ),
                    }}
                  >
                    {({ onClose }) => (
                      <MenuGroup
                        label={__(
                          "When closed, close the alert for how long?",
                          "alerts-dlx"
                        )}
                      >
                        {ALERT_CLOSE_EXPIRATION_PRESETS.map((preset) => (
                          <MenuItem
                            key={preset.seconds}
                            role="menuitemradio"
                            isSelected={
                              closeButtonExpiration === preset.seconds
                            }
                            icon={
                              closeButtonExpiration === preset.seconds
                                ? "yes"
                                : null
                            }
                            onClick={() => {
                              applyCloseButtonExpiration(
                                preset.seconds,
                                setAttributes
                              );
                              onClose();
                            }}
                          >
                            {preset.label}
                          </MenuItem>
                        ))}
                      </MenuGroup>
                    )}
                  </DropdownMenu>
                )}
              </ToolbarItem>
            </ToolbarGroup>
          </BlockControls>
        </>
      );
    };
  },
  "withAlertCloseExpirationToolbar"
);

addFilter(
  "editor.BlockEdit",
  "alerts-dlx/alert-close-expiration-toolbar",
  withAlertCloseExpirationToolbar
);
