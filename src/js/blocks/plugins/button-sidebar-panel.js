/**
 * Sidebar controls for alert button settings on AlertsDLX blocks.
 */

import { addFilter } from "@wordpress/hooks";
import { createHigherOrderComponent } from "@wordpress/compose";
import { InspectorControls } from "@wordpress/block-editor";
import {
  BaseControl,
  PanelBody,
  TextControl,
  ToggleControl,
} from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import { ALERT_BLOCK_NAMES } from "../utils/alert-parent-inspector";
import AlertButtonLinkControl from "../components/AlertButtonLinkControl";

/**
 * HOC that adds a button settings panel to alert block sidebars.
 *
 * @param {Function} BlockEdit Original BlockEdit component.
 * @return {Function} Enhanced BlockEdit component.
 */
const withButtonSidebarPanel = createHigherOrderComponent((BlockEdit) => {
  return (props) => {
    const { name, attributes, setAttributes } = props;

    if (!ALERT_BLOCK_NAMES.includes(name)) {
      return <BlockEdit {...props} />;
    }

    const {
      buttonEnabled,
      buttonText,
      buttonUrl,
      buttonTarget,
      buttonRelNoFollow,
      buttonRelSponsored,
    } = attributes;

    if (!buttonEnabled) {
      return <BlockEdit {...props} />;
    }

    return (
      <>
        <BlockEdit {...props} />
        <InspectorControls>
          <PanelBody
            title={__("Button", "alerts-dlx")}
            initialOpen={false}
            className="alerts-dlx-button-panel"
          >
            <TextControl
              label={__("Button Text", "alerts-dlx")}
              value={buttonText}
              onChange={(value) => {
                setAttributes({ buttonText: value });
              }}
              __nextHasNoMarginBottom={true}
            />
            <BaseControl
              label={__("Button Link", "alerts-dlx")}
              className="alerts-dlx-button-panel-link"
            >
              <AlertButtonLinkControl
                buttonUrl={buttonUrl}
                setAttributes={setAttributes}
              />
            </BaseControl>
            {!!buttonUrl && (
              <>
                <ToggleControl
                  label={__("Open link in a new tab", "alerts-dlx")}
                  checked={buttonTarget || false}
                  onChange={(value) => {
                    setAttributes({ buttonTarget: value });
                  }}
                />
                <ToggleControl
                  label={__('Add rel="nofollow"', "alerts-dlx")}
                  checked={buttonRelNoFollow || false}
                  onChange={(value) => {
                    setAttributes({ buttonRelNoFollow: value });
                  }}
                />
                <ToggleControl
                  label={__('Add rel="sponsored"', "alerts-dlx")}
                  checked={buttonRelSponsored || false}
                  onChange={(value) => {
                    setAttributes({ buttonRelSponsored: value });
                  }}
                />
              </>
            )}
          </PanelBody>
        </InspectorControls>
      </>
    );
  };
}, "withButtonSidebarPanel");

addFilter(
  "editor.BlockEdit",
  "alerts-dlx/button-sidebar-panel",
  withButtonSidebarPanel
);
