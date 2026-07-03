import "./editor.scss";

/**
 * WordPress dependencies
 */
import { useState, useEffect } from "@wordpress/element";
import { Button, Popover } from "@wordpress/components";
import { filterURLForDisplay } from "@wordpress/url";
import { __ } from "@wordpress/i18n";
import { closeSmall, edit, link } from "@wordpress/icons";

import URLPicker from "../URLPicker";
import isURL from "../../utils/isURL";

/**
 * Shared URLPicker popover for sidebar add/edit link flows.
 *
 * @param {Object}   props                   Component props.
 * @param {boolean}  props.isOpen            Whether the popover is open.
 * @param {Object}   props.anchor            Popover anchor element.
 * @param {Function} props.onClose           Close handler.
 * @param {string}   props.prefillInputValue Initial URL input value.
 * @param {Function} props.onItemSelect      URL selection handler.
 * @return {import('react').JSX.Element|null} Popover component.
 */
const AlertButtonUrlPopover = ({
  isOpen,
  anchor,
  onClose,
  prefillInputValue,
  onItemSelect,
}) => {
  if (!isOpen || !anchor) {
    return null;
  }

  return (
    <Popover
      anchor={anchor}
      onClose={onClose}
      className="alerts-dlx-button-link-popover"
    >
      <div className="alerts-dlx-button-link-popover__content">
        <URLPicker
          key={prefillInputValue || "new-link"}
          prefillInputValue={prefillInputValue}
          hasInititialFocus={true}
          onItemSelect={onItemSelect}
        />
      </div>
    </Popover>
  );
};

/**
 * Link preview row with edit and remove actions.
 *
 * @param {Object}   props            Component props.
 * @param {string}   props.buttonUrl  Current button URL.
 * @param {Function} props.onEdit     Edit button handler.
 * @param {Function} props.onClear    Remove button handler.
 * @return {import('react').JSX.Element} Link preview row.
 */
const AlertButtonLinkPreview = ({ buttonUrl, onEdit, onClear }) => {
  return (
    <div className="alerts-dlx-button-link-preview">
      <Button
        variant="link"
        className="alerts-dlx-button-link-preview__url"
        href={buttonUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(event) => {
          event.preventDefault();
          if (isURL(buttonUrl)) {
            window.open(buttonUrl, "_blank");
          }
        }}
      >
        {filterURLForDisplay(buttonUrl)}
      </Button>
      <div className="alerts-dlx-button-link-preview__actions">
        <Button
          icon={edit}
          label={__("Edit link", "alerts-dlx")}
          onClick={onEdit}
          className="alerts-dlx-button-link-preview__edit"
          variant="secondary"
        />
        <Button
          icon={closeSmall}
          label={__("Remove link", "alerts-dlx")}
          onClick={onClear}
          className="alerts-dlx-button-link-preview__remove"
          variant="secondary"
        />
      </div>
    </div>
  );
};

/**
 * Link control with preview, edit, clear, and URLPicker.
 *
 * @param {Object}   props              Component props.
 * @param {string}   props.buttonUrl    Current button URL.
 * @param {Function} props.setAttributes Block setAttributes callback.
 * @param {boolean}  props.inlinePicker  Render URLPicker inline instead of a nested popover.
 * @param {boolean}  props.isActive      Whether the parent popover is open (inline mode).
 * @return {import('react').JSX.Element} AlertButtonLinkControl component.
 */
const AlertButtonLinkControl = ({
  buttonUrl,
  setAttributes,
  inlinePicker = false,
  isActive = true,
}) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [popoverAnchor, setPopoverAnchor] = useState(null);
  const [pickerPrefill, setPickerPrefill] = useState("");
  const [isEditingInline, setIsEditingInline] = useState(false);

  const hasValidUrl = buttonUrl && isURL(buttonUrl);
  const showPreview = hasValidUrl && (!inlinePicker || !isEditingInline);
  const showInlinePicker = inlinePicker && (!hasValidUrl || isEditingInline);

  useEffect(() => {
    if (!isActive) {
      setIsEditingInline(false);
    }
  }, [isActive]);

  const closePopover = () => {
    setIsPopoverOpen(false);
  };

  const openPopover = (anchor, prefill = "") => {
    setPopoverAnchor(anchor);
    setPickerPrefill(prefill);
    setIsPopoverOpen(true);
  };

  const clearUrl = () => {
    setAttributes({
      buttonUrl: "",
      buttonHasUrl: false,
    });
    setPickerPrefill("");
    setIsEditingInline(false);
  };

  const handleItemSelect = (e, url) => {
    const linkUrl = "string" === typeof url ? url : url?.permalink;

    if (linkUrl) {
      setAttributes({
        buttonUrl: linkUrl,
        buttonHasUrl: true,
      });
    }

    if (inlinePicker) {
      setIsEditingInline(false);
      return;
    }

    closePopover();
  };

  return (
    <>
      {showPreview && (
        <AlertButtonLinkPreview
          buttonUrl={buttonUrl}
          onEdit={(event) => {
            if (inlinePicker) {
              setIsEditingInline(true);
              return;
            }
            openPopover(event.currentTarget, buttonUrl);
          }}
          onClear={clearUrl}
        />
      )}
      {!inlinePicker && !hasValidUrl && (
        <Button
          variant="secondary"
          icon={link}
          onClick={(event) => {
            openPopover(event.currentTarget, "");
          }}
        >
          {__("Add Link", "alerts-dlx")}
        </Button>
      )}
      {showInlinePicker && (
        <URLPicker
          key={isEditingInline ? `edit-${buttonUrl}` : "new-link"}
          prefillInputValue={isEditingInline ? buttonUrl : ""}
          hasInititialFocus={true}
          onItemSelect={handleItemSelect}
        />
      )}
      {!inlinePicker && (
        <AlertButtonUrlPopover
          isOpen={isPopoverOpen}
          anchor={popoverAnchor}
          onClose={closePopover}
          prefillInputValue={pickerPrefill}
          onItemSelect={handleItemSelect}
        />
      )}
    </>
  );
};

export default AlertButtonLinkControl;
