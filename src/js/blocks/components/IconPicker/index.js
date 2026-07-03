import "./editor.scss";

import { __ } from "@wordpress/i18n";
import { renderToString, useState } from "@wordpress/element";
import {
  BaseControl,
  TextareaControl,
  Tooltip,
  Button,
  Popover,
  TabPanel,
} from "@wordpress/components";
import { closeSmall } from "@wordpress/icons";
import sanitizeSVG from "../../utils/sanitize-svg";

/**
 * Icon grid tab content.
 *
 * @param {Object}   props              Component props.
 * @param {Object}   props.icons        Preset icon map.
 * @param {Function} props.setAttributes Block setAttributes callback.
 * @return {import('react').JSX.Element} Icons tab content.
 */
const IconsTab = ({ icons, setAttributes }) => {
  return (
    <ul className="alerts-dlx-icon-list">
      {Object.keys(icons).map((svg, i) => {
        return (
          <li key={`alerts-dlx-icon-${i}`}>
            <Tooltip text={icons[svg].label}>
              <Button
                className="editor-block-list-item-button"
                label={icons[svg].label}
                onClick={() => {
                  setAttributes({
                    icon: renderToString(icons[svg].icon),
                  });
                }}
              >
                <span className="editor-block-types-list__item-icon">
                  {icons[svg].icon}
                </span>
              </Button>
            </Tooltip>
          </li>
        );
      })}
    </ul>
  );
};

/**
 * Custom SVG tab content.
 *
 * @param {Object}   props              Component props.
 * @param {string}   props.selectedIcon Current SVG draft value.
 * @param {Function} props.setSelectedIcon Set selected icon draft.
 * @param {Function} props.setAttributes Block setAttributes callback.
 * @param {Function} props.onApply         Callback after the custom icon is applied.
 * @return {import('react').JSX.Element} Custom icon tab content.
 */
const CustomIconTab = ({
  selectedIcon,
  setSelectedIcon,
  setAttributes,
  onApply,
}) => {
  const applyCustomIcon = () => {
    const sanitizedIcon = sanitizeSVG(selectedIcon);

    setAttributes({
      icon: sanitizedIcon,
    });
    onApply();
  };

  return (
    <>
      <div className="alerts-dlx-custom-icon-preview">
        <span
          dangerouslySetInnerHTML={{
            __html: sanitizeSVG(selectedIcon),
          }}
        />
      </div>
      <div className="alerts-dlx-custom-icon-input">
        <TextareaControl
          label={__("SVG Code", "alerts-dlx")}
          value={selectedIcon}
          onChange={(value) => {
            setSelectedIcon(value);
          }}
          className="alerts-dlx-custom-icon-textarea"
          rows={5}
        />
        <Button
          variant="primary"
          onMouseDown={(event) => {
            event.preventDefault();
          }}
          onClick={(event) => {
            event.stopPropagation();
            applyCustomIcon();
          }}
        >
          {__("Set Icon", "alerts-dlx")}
        </Button>
      </div>
    </>
  );
};

const IconPicker = (props) => {
  const [selectedIcon, setSelectedIcon] = useState(props.defaultSvg);
  const [isPopoverVisible, setIsPopOverVisible] = useState(false);
  const [popoverRef, setPopoverRef] = useState(null);
  const [initialTabName, setInitialTabName] = useState("icons");
  const { defaultSvg, setAttributes, icons, popoverPlacement } = props;

  /**
   * Check whether the SVG matches a preset icon.
   *
   * @param {string} svg SVG string to check.
   * @return {boolean} Whether the SVG is a preset icon.
   */
  const isPresetIcon = (svg) => {
    if (!svg) {
      return false;
    }

    const normalized = sanitizeSVG(svg);

    return Object.keys(icons).some((key) => {
      return normalized === sanitizeSVG(renderToString(icons[key].icon));
    });
  };

  const closeIconPopover = () => {
    setIsPopOverVisible(false);
  };

  const onIconPreviewMouseDown = (event) => {
    event.preventDefault();
    setIsPopOverVisible(!isPopoverVisible);
  };

  const onIconPreviewKeyDown = (event) => {
    if ("Enter" !== event.key && " " !== event.key) {
      return;
    }

    event.preventDefault();
    setIsPopOverVisible(!isPopoverVisible);
  };

  return (
    <>
      <BaseControl className="alerts-dlx-icon-wrapper">
        <div className="alerts-dlx-icon-preview">
          <Button
            className="button-reset alerts-dlx-icon-preview-button"
            label={__("Select icon", "alerts-dlx")}
            ref={setPopoverRef}
            onMouseDown={onIconPreviewMouseDown}
            onKeyDown={onIconPreviewKeyDown}
          >
            <span
              dangerouslySetInnerHTML={{
                __html: sanitizeSVG(defaultSvg),
              }}
            />
          </Button>
        </div>
      </BaseControl>
      {isPopoverVisible && popoverRef && (
        <Popover
          noArrow={false}
          anchor={popoverRef}
          placement={popoverPlacement}
          className="alerts-dlx-icon-popover"
          onClose={closeIconPopover}
        >
          <div className="alerts-dlx-icon-picker">
            <TabPanel
              key={initialTabName}
              className="alerts-dlx-icon-tab-panel"
              activeClass="is-active"
              initialTabName={initialTabName}
              tabs={[
                {
                  name: "icons",
                  title: __("Icons", "alerts-dlx"),
                },
                {
                  name: "custom",
                  title: __("Custom SVG", "alerts-dlx"),
                },
              ]}
            >
              {(tab) => {
                if ("icons" === tab.name) {
                  return (
                    <IconsTab icons={icons} setAttributes={setAttributes} />
                  );
                }

                return (
                  <CustomIconTab
                    selectedIcon={selectedIcon}
                    setSelectedIcon={setSelectedIcon}
                    setAttributes={setAttributes}
                    onApply={closeIconPopover}
                  />
                );
              }}
            </TabPanel>
            <div className="alerts-dlx-icon-picker-header">
              <Button
                icon={closeSmall}
                label={__("Close", "alerts-dlx")}
                onClick={closeIconPopover}
                className="alerts-dlx-icon-picker-close"
              />
            </div>
          </div>
        </Popover>
      )}
    </>
  );
};

export default IconPicker;
