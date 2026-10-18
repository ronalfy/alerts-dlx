/**
 * WordPress dependencies
 */
import { useEffect, useRef } from "@wordpress/element";

/**
 * Block editor writing surface. Gutenberg does not export getEditorCanvas in
 * the WordPress version this plugin runs against, so the canvas iframe is
 * looked up by the name the editor assigns.
 */
const EDITOR_CANVAS_IFRAME_SELECTOR = 'iframe[name="editor-canvas"]';

/**
 * Whether a pointer target is the node or contained by it.
 *
 * Targets from another document are never contained, which is how a canvas
 * click is recognized as outside a sidebar popover.
 *
 * @param {EventTarget|null} target Event target.
 * @param {Node|null}        node   Popover or anchor node.
 * @return {boolean} True when the target is inside the node.
 */
function isEventTargetInside(target, node) {
  if (!target || !node || "function" !== typeof node.contains) {
    return false;
  }

  if (target === node) {
    return true;
  }

  if ("number" !== typeof target.nodeType) {
    return false;
  }

  return node.contains(target);
}

/**
 * Add a document to the listener list once.
 *
 * @param {Document[]} documents Documents collected so far.
 * @param {Document}   doc       Document to add.
 */
function addPointerDocument(documents, doc) {
  if (!doc || "function" !== typeof doc.addEventListener) {
    return;
  }

  if (!documents.includes(doc)) {
    documents.push(doc);
  }
}

/**
 * Documents that can receive pointerdown while a popover is open.
 *
 * Pointer events do not cross documents. The parent document covers sidebar
 * clicks, and each editor canvas iframe document covers canvas clicks.
 *
 * @param {Node|null} anchor      Anchor that opened the popover.
 * @param {Node|null} popoverNode Popover element.
 * @return {Document[]} Documents to observe.
 */
function getOutsidePointerDocuments(anchor, popoverNode) {
  const documents = [];

  if ("undefined" !== typeof document) {
    addPointerDocument(documents, document);
  }

  let iframes = [];

  try {
    iframes = document.querySelectorAll(EDITOR_CANVAS_IFRAME_SELECTOR);
  } catch (error) {
    iframes = [];
  }

  Array.from(iframes).forEach((iframe) => {
    let contentDocument = null;

    try {
      contentDocument = iframe.contentDocument || null;
    } catch (error) {
      contentDocument = null;
    }

    addPointerDocument(documents, contentDocument);
  });

  // Cover a canvas document when the named iframe is missing or the popover
  // is portaled into a different document than the anchor.
  addPointerDocument(documents, anchor?.ownerDocument);
  addPointerDocument(documents, popoverNode?.ownerDocument);

  return documents;
}

/**
 * Close a popover on pointerdown outside the popover and its anchor.
 *
 * Popover onClose only runs from focus-outside, which aborts when
 * document.hasFocus() is false. Clicking the editor canvas moves focus into
 * another document, so that path never closes the popover.
 *
 * @param {Object}                 options        Hook options.
 * @param {boolean}                options.isOpen Whether the popover is open.
 * @param {Function}               options.onClose Close callback. Escape still uses Popover onClose.
 * @param {Element|null|undefined} options.anchor Anchor element that opened the popover.
 * @return {import('react').RefObject<HTMLElement|null>} Ref to pass to Popover.
 */
const usePopoverOutsidePointerClose = ({ isOpen, onClose, anchor }) => {
  const popoverRef = useRef(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const onPointerDown = (event) => {
      const target = event.target;
      const popoverNode = popoverRef.current;

      if (
        isEventTargetInside(target, popoverNode) ||
        isEventTargetInside(target, anchor)
      ) {
        return;
      }

      onCloseRef.current();
    };

    const documents = getOutsidePointerDocuments(anchor, popoverRef.current);

    documents.forEach((doc) => {
      doc.addEventListener("pointerdown", onPointerDown, true);
    });

    return () => {
      documents.forEach((doc) => {
        doc.removeEventListener("pointerdown", onPointerDown, true);
      });
    };
  }, [isOpen, anchor]);

  return popoverRef;
};

export default usePopoverOutsidePointerClose;
