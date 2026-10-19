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
 * One button settings panel bound to a set of attribute field names.
 *
 * @param {Object}   props                         Component props.
 * @param {Object}   props.attributes              Block attributes.
 * @param {Function} props.setAttributes           Attribute updater.
 * @param {string}   props.title                   Panel title.
 * @param {string}   props.textAttribute           Text attribute name.
 * @param {string}   props.urlAttribute            URL attribute name.
 * @param {string}   props.hasUrlAttribute         Has-URL attribute name.
 * @param {string}   props.targetAttribute         New-tab attribute name.
 * @param {string}   props.relNoFollowAttribute    Nofollow attribute name.
 * @param {string}   props.relSponsoredAttribute   Sponsored attribute name.
 * @return {import('react').JSX.Element} Button inspector panel.
 */
const AlertButtonSettingsPanel = ({
  attributes,
  setAttributes,
  title,
  textAttribute,
  urlAttribute,
  hasUrlAttribute,
  targetAttribute,
  relNoFollowAttribute,
  relSponsoredAttribute,
}) => {
  const buttonText = attributes[textAttribute];
  const buttonUrl = attributes[urlAttribute];
  const buttonTarget = attributes[targetAttribute];
  const buttonRelNoFollow = attributes[relNoFollowAttribute];
  const buttonRelSponsored = attributes[relSponsoredAttribute];

  return (
    <PanelBody
      title={title}
      initialOpen={false}
      className="alerts-dlx-button-panel"
    >
      <TextControl
        label={__("Button Text", "alerts-dlx")}
        value={buttonText}
        onChange={(value) => {
          setAttributes({ [textAttribute]: value });
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
          urlAttribute={urlAttribute}
          hasUrlAttribute={hasUrlAttribute}
        />
      </BaseControl>
      {!!buttonUrl && (
        <>
          <ToggleControl
            label={__("Open link in a new tab", "alerts-dlx")}
            checked={buttonTarget || false}
            onChange={(value) => {
              setAttributes({ [targetAttribute]: value });
            }}
          />
          <ToggleControl
            label={__('Add rel="nofollow"', "alerts-dlx")}
            checked={buttonRelNoFollow || false}
            onChange={(value) => {
              setAttributes({ [relNoFollowAttribute]: value });
            }}
          />
          <ToggleControl
            label={__('Add rel="sponsored"', "alerts-dlx")}
            checked={buttonRelSponsored || false}
            onChange={(value) => {
              setAttributes({ [relSponsoredAttribute]: value });
            }}
          />
        </>
      )}
    </PanelBody>
  );
};

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

    const { buttonEnabled, secondaryButtonEnabled } = attributes;

    if (!buttonEnabled && !secondaryButtonEnabled) {
      return <BlockEdit {...props} />;
    }

    return (
      <>
        <BlockEdit {...props} />
        <InspectorControls>
          {buttonEnabled && (
            <AlertButtonSettingsPanel
              attributes={attributes}
              setAttributes={setAttributes}
              title={__("Button", "alerts-dlx")}
              textAttribute="buttonText"
              urlAttribute="buttonUrl"
              hasUrlAttribute="buttonHasUrl"
              targetAttribute="buttonTarget"
              relNoFollowAttribute="buttonRelNoFollow"
              relSponsoredAttribute="buttonRelSponsored"
            />
          )}
          {secondaryButtonEnabled && (
            <AlertButtonSettingsPanel
              attributes={attributes}
              setAttributes={setAttributes}
              title={__("Secondary Button", "alerts-dlx")}
              textAttribute="secondaryButtonText"
              urlAttribute="secondaryButtonUrl"
              hasUrlAttribute="secondaryButtonHasUrl"
              targetAttribute="secondaryButtonTarget"
              relNoFollowAttribute="secondaryButtonRelNoFollow"
              relSponsoredAttribute="secondaryButtonRelSponsored"
            />
          )}
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
