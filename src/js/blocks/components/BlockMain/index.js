/**
 * Main Block Interface (what is shown to the user in the editor).
 */

import {
  InspectorControls,
  InspectorAdvancedControls,
  RichText,
} from "@wordpress/block-editor";
import classnames from "classnames";
import { __ } from "@wordpress/i18n";
import IconPicker from "../IconPicker";
import AlertButton from "../AlertButton";

/**
 * Main Block Interface (what is shown to the user in the editor).
 *
 * @param {Object}      props                   - The props of the block.
 * @param {Object}      props.attributes        - The attributes of the block.
 * @param {Function}    props.setAttributes     - The function to set the attributes of the block.
 * @param {Object}      props.iconSet           - The icon set of the block.
 * @param {JSX.Element} props.inspectorControls - The inspector controls of the block.
 * @param {JSX.Element} props.styleControls     - The style controls of the block.
 * @param {JSX.Element} props.advancedControls  - The advanced controls of the block.
 * @param {JSX.Element} props.CloseButtonIcon   - The close button icon of the block.
 * @param {Object}      props.innerBlockProps   - The inner block props of the block.
 * @return {JSX.Element} - The main block interface.
 */
const BlockMain = (props) => {
  const {
    attributes,
    setAttributes,
    iconSet,
    inspectorControls,
    styleControls = null,
    advancedControls = null,
    CloseButtonIcon,
    innerBlockProps,
  } = props;

  const {
    iconEnabled,
    iconSource,
    descriptionEnabled,
    buttonEnabled,
    uniqueId,
    icon,
    imageUrl,
    alertType,
    alertGroup,
    closeButtonEnabled,
    titleEnabled,
    alertTitle,
    maximumWidth,
    maximumWidthUnit,
    baseFontSize,
  } = attributes;

  // Calculate max width.
  const maxWidthStyle = {
    maxWidth: maximumWidth + maximumWidthUnit,
  };
  const baseFontSizeStyles = `#${uniqueId} { font-size: ${parseInt(
    baseFontSize
  )}px; }`;

  const allowedHeadlineStyles = ["h1", "h2", "h3", "h4", "h5", "h6", "div"];
  const headlineTag = allowedHeadlineStyles.includes(
    alertsDlxBlock.headlineStyle
  )
    ? alertsDlxBlock.headlineStyle
    : "h2";
  const headlineTitleClasses = classnames(
    "alerts-dlx-title",
    (alertsDlxBlock.headlineCustomClasses || "")
      .split(" ")
      .filter(Boolean)
  );

  return (
    <>
      {inspectorControls && (
        <InspectorControls>{inspectorControls}</InspectorControls>
      )}
      {styleControls && (
        <InspectorControls group="styles">{styleControls}</InspectorControls>
      )}
      {advancedControls && (
        <InspectorAdvancedControls>
          {advancedControls}
        </InspectorAdvancedControls>
      )}
      <style>{baseFontSizeStyles}</style>
      <link rel="stylesheet" href={`${alertsDlxBlock.font_stylesheet}`} />
      <figure
        role="alert"
        className={classnames(`alerts-dlx-alert alerts-dlx-${alertGroup}`, {
          "alerts-dlx-has-icon": iconEnabled,
          "alerts-dlx-has-description": descriptionEnabled,
          "alerts-dlx-has-button": buttonEnabled,
        })}
        style={maxWidthStyle}
        id={uniqueId}
      >
        {"icon" === iconSource && iconEnabled && (
          <div className="alerts-dlx-icon" aria-hidden="true">
            <IconPicker
              defaultSvg={icon}
              setAttributes={setAttributes}
              alertType={alertType}
              icons={iconSet}
            />
          </div>
        )}
        {"image" === iconSource && iconEnabled && (
          <div className="alerts-dlx-icon" aria-hidden="true">
            {imageUrl && (
              <img src={imageUrl} alt={__("Alert image", "alerts-dlx")} />
            )}
            {!imageUrl && (
              <img
                src={alertsDlxBlock.defaultImage}
                alt={__("Placeholder Alert image", "alerts-dlx")}
              />
            )}
          </div>
        )}
        <section>
          {closeButtonEnabled && (
            <div className="alerts-dlx-close">
              <CloseButtonIcon />
            </div>
          )}
          {titleEnabled && (
            <RichText
              tagName={headlineTag}
              placeholder={__("Alert title", "alerts-dlx")}
              value={alertTitle}
              className={headlineTitleClasses}
              disableLineBreaks={true}
              allowedFormats={[]}
              onChange={(value) => {
                setAttributes({ alertTitle: value });
              }}
            />
          )}
          <div className="alerts-dlx-content-wrapper">
            {descriptionEnabled && <div {...innerBlockProps} />}
            {buttonEnabled && (
              <AlertButton
                attributes={attributes}
                setAttributes={setAttributes}
              />
            )}
          </div>
        </section>
      </figure>
    </>
  );
};

export default BlockMain;
