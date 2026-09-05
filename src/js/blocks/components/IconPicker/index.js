import "./editor.scss";

import { __ } from "@wordpress/i18n";
import { renderToString, useEffect, useRef, useState } from "@wordpress/element";
import {
  BaseControl,
  TextareaControl,
  Tooltip,
  Button,
  Icon,
  Popover,
  TabPanel,
} from "@wordpress/components";
import { closeSmall, image as imageIcon } from "@wordpress/icons";
import sanitizeSVG from "../../utils/sanitize-svg";

/**
 * Apply an SVG value through the supported picker callbacks.
 *
 * @param {string}   svg            Sanitized or serialized SVG markup.
 * @param {Function} [onChange]     Direct SVG change callback.
 * @param {Function} [setAttributes] Block setAttributes callback.
 */
const applyIconValue = (svg, onChange, setAttributes) => {
  if (typeof onChange === "function") {
    onChange(svg);
  }
  if (typeof setAttributes === "function") {
    setAttributes({
      icon: svg,
    });
  }
};

/**
 * Icon grid tab content.
 *
 * @param {Object}   props              Component props.
 * @param {Object}   props.icons        Preset icon map.
 * @param {Function} props.onSelect     Callback with the selected SVG string.
 * @return {import('react').JSX.Element} Icons tab content.
 */
const IconsTab = ({ icons, onSelect }) => {
  return (
    <ul className="alerts-dlx-icon-list">
      {Object.keys(icons).map((svg, i) => {
        return (
          <li key={`alerts-dlx-icon-${i}`}>
            <Tooltip text={icons[svg].label}>
              <Button
                className="editor-block-list-item-button"
                label={icons[svg].label}
                onMouseDown={(event) => {
                  // Keep the click from moving focus through the grid.
                  event.preventDefault();
                }}
                onClick={() => {
                  onSelect(renderToString(icons[svg].icon));
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
 * @param {Function} props.onChange     Direct SVG change callback.
 * @param {Function} props.setAttributes Block setAttributes callback.
 * @param {Function} props.onApply         Callback after the custom icon is applied.
 * @return {import('react').JSX.Element} Custom icon tab content.
 */
const CustomIconTab = ({
  selectedIcon,
  setSelectedIcon,
  onChange,
  setAttributes,
  onApply,
}) => {
  const applyCustomIcon = () => {
    applyIconValue(sanitizeSVG(selectedIcon), onChange, setAttributes);
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
  const [initialTabName] = useState("icons");
  const {
    defaultSvg,
    setAttributes,
    onChange,
    icons,
    popoverPlacement,
    closeOnSelect,
    preventTriggerFocus = true,
  } = props;
  const returnFocusOnCloseRef = useRef(false);

  useEffect(() => {
    setSelectedIcon(defaultSvg);
  }, [defaultSvg]);

  const closeIconPopover = () => {
    if (!preventTriggerFocus) {
      returnFocusOnCloseRef.current = true;
    }
    setIsPopOverVisible(false);
  };

  useEffect(() => {
    if (isPopoverVisible || !returnFocusOnCloseRef.current) {
      return;
    }

    returnFocusOnCloseRef.current = false;

    // Run after Popover's focus-return so it cannot restore another field.
    if (popoverRef && typeof popoverRef.focus === "function") {
      popoverRef.focus();
    }
  }, [isPopoverVisible, popoverRef]);

  const onIconPreviewMouseDown = (event) => {
    if (preventTriggerFocus) {
      // Keep the block selected when clicking the in-canvas icon preview.
      event.preventDefault();
    }
    setIsPopOverVisible(!isPopoverVisible);
  };

  const onIconPreviewKeyDown = (event) => {
    if ("Enter" !== event.key && " " !== event.key) {
      return;
    }

    event.preventDefault();
    setIsPopOverVisible(!isPopoverVisible);
  };

  const handlePresetSelect = (svg) => {
    applyIconValue(svg, onChange, setAttributes);
    if (closeOnSelect) {
      closeIconPopover();
    }
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
            {defaultSvg ? (
              <span
                dangerouslySetInnerHTML={{
                  __html: sanitizeSVG(defaultSvg),
                }}
              />
            ) : (
              <Icon icon={imageIcon} />
            )}
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
                    <IconsTab icons={icons} onSelect={handlePresetSelect} />
                  );
                }

                return (
                  <CustomIconTab
                    selectedIcon={selectedIcon}
                    setSelectedIcon={setSelectedIcon}
                    onChange={onChange}
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
