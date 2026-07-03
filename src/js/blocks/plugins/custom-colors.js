/**
 * AlertsDLX Admin-Only Plugin
 *
 * This plugin hooks into AlertsDLX Gutenberg blocks to add a custom panel
 * that only appears in the block editor (admin-side). It uses WordPress's
 * higher-order component pattern to wrap block edit functions and filters
 * to only affect blocks that are part of the AlertsDLX plugin.
 *
 * @since 1.0.0
 */

import { addFilter } from "@wordpress/hooks";
import { createHigherOrderComponent } from "@wordpress/compose";
import { InspectorControls, PanelColorSettings } from "@wordpress/block-editor";
import { Fill, PanelBody } from "@wordpress/components";
import { registerPlugin } from "@wordpress/plugins";
import { __ } from "@wordpress/i18n";
import BootstrapColors from "../bootstrap/colors";
import ChakraColors from "../chakraui/colors";
import MaterialColors from "../material/colors";
import ShoelaceColors from "../shoelace/colors";

// Get the colors for the block.
const getColors = (alertGroup) => {
  switch (alertGroup) {
    case "bootstrap":
      return BootstrapColors;
    case "chakra":
      return ChakraColors;
    case "material":
      return MaterialColors;
    case "shoelace":
      return ShoelaceColors;
    default:
      return [];
  }
};

/**
 * Higher-order component that wraps block edit functions to add our custom panel.
 *
 * This HOC intercepts the block edit component and conditionally renders
 * our custom InspectorControls panel when the block is selected.
 * It also adds CSS classes to the block wrapper for editorial-only and read-only blocks.
 *
 * @param {Function} BlockEdit - The original block edit component.
 * @return {Function} Enhanced block edit component with our custom panel and CSS classes.
 */
const withAlertsPanel = createHigherOrderComponent((BlockEdit) => {
  return (props) => {
    // List of AlertsDLX block namespaces.
    const alertsDLXBlockNamespaces = [
      "mediaron/alerts-dlx-bootstrap",
      "mediaron/alerts-dlx-chakra",
      "mediaron/alerts-dlx-material",
      "mediaron/alerts-dlx-shoelace",
    ];

    // Check if this is an AlertsDLX block.
    const isAlertsDLXBlock =
      props.name && alertsDLXBlockNamespaces.includes(props.name);

    // If it's not an AlertsDLX block, return the original component without our panel.
    if (!isAlertsDLXBlock) {
      return <BlockEdit {...props} />;
    }

    const {
      colorPrimary,
      colorBorder,
      colorAccent,
      colorAlt,
      colorAltHover,
      colorAltText,
      colorAltTextHover,
      colorBold,
      colorLight,
      alertType,
      uniqueId,
      alertGroup,
    } = props.attributes;
    const { setAttributes } = props;

    if ("custom" !== alertType) {
      return <BlockEdit {...props} />;
    }

    // Create the block content with or without the panel.
    let blockContent = <BlockEdit {...props} />;

    const styles = `
		#${uniqueId} {
			--alerts-dlx-${alertGroup}-color-primary: ${colorPrimary};
			--alerts-dlx-${alertGroup}-color-border: ${colorBorder};
			--alerts-dlx-${alertGroup}-color-accent: ${colorAccent};
			--alerts-dlx-${alertGroup}-color-alt: ${colorAlt};
			--alerts-dlx-${alertGroup}-color-alt-hover: ${colorAltHover};
			--alerts-dlx-${alertGroup}-color-alt-text: ${colorAltText};
			--alerts-dlx-${alertGroup}-color-alt-text-hover: ${colorAltTextHover};
			--alerts-dlx-${alertGroup}-color-bold: ${colorBold};
			--alerts-dlx-${alertGroup}-color-light: ${colorLight};
		}`;

    // Only show our panel when the block is selected in the editor and user has permissions.
    blockContent = (
      <>
        <style>{styles}</style>
        <BlockEdit {...props} />
      </>
    );

    return blockContent;
  };
}, "withAlertsPanel");

/**
 * Apply our higher-order component to all blocks in the editor.
 *
 * This filter runs on every block edit component, allowing us to
 * inject our custom panel into the InspectorControls sidebar and
 * add CSS classes for editorial-only and read-only blocks.
 */
addFilter("editor.BlockEdit", "alerts-dlx/with-alerts-panel", withAlertsPanel);
registerPlugin("custom-colors", {
  render: () => {
    return (
      <Fill name="alertsDLXStylePanelStart">
        {({ attributes, setAttributes }) => {
          if ("custom" !== attributes.alertType) {
            return null;
          }
          const {
            colorPrimary,
            colorBorder,
            colorAccent,
            colorAlt,
            colorAltHover,
            colorAltText,
            colorAltTextHover,
            colorBold,
            colorLight,
          } = attributes;
          return (
            <PanelBody
              title={__("Custom Alert Colors", "alerts-dlx")}
              initialOpen={true}
              className="alerts-dlx-panel"
            >
              <PanelColorSettings
                __experimentalIsRenderedInSidebar
                title={__("Alert Colors", "alerts-dlx")}
                colorSettings={[
                  {
                    label: __("Text Color", "alerts-dlx"),
                    value: colorPrimary,
                    onChange: (value) => {
                      setAttributes({ colorPrimary: value });
                    },
                  },
                  {
                    label: __("Border Color", "alerts-dlx"),
                    value: colorBorder,
                    onChange: (value) => {
                      setAttributes({ colorBorder: value });
                    },
                  },
                  {
                    label: __("Accent Color", "alerts-dlx"),
                    value: colorAccent,
                    onChange: (value) => {
                      setAttributes({ colorAccent: value });
                    },
                  },
                  {
                    label: __("Button Color", "alerts-dlx"),
                    value: colorAlt,
                    onChange: (value) => {
                      setAttributes({ colorAlt: value });
                    },
                  },
                  {
                    label: __("Button Hover Color", "alerts-dlx"),
                    value: colorAltHover,
                    onChange: (value) => {
                      setAttributes({ colorAltHover: value });
                    },
                  },
                  {
                    label: __("Button Text Color", "alerts-dlx"),
                    value: colorAltText,
                    onChange: (value) => {
                      setAttributes({ colorAltText: value });
                    },
                  },
                  {
                    label: __("Button Text Hover Color", "alerts-dlx"),
                    value: colorAltTextHover,
                    onChange: (value) => {
                      setAttributes({ colorAltTextHover: value });
                    },
                  },
                  {
                    label: __("Icon Color", "alerts-dlx"),
                    value: colorBold,
                    onChange: (value) => {
                      setAttributes({ colorBold: value });
                    },
                  },
                  {
                    label: __("Background Color", "alerts-dlx"),
                    value: colorLight,
                    onChange: (value) => {
                      setAttributes({ colorLight: value });
                    },
                  },
                ]}
                colors={getColors(attributes.alertGroup)}
              />
            </PanelBody>
          );
        }}
      </Fill>
    );
  },
});
