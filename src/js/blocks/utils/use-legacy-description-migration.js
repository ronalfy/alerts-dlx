/**
 * Preserve content saved by older Alerts DLX versions.
 *
 * Older alert blocks stored their description as RichText/HTML in the
 * `alertDescription` attribute. Current blocks use InnerBlocks. When an old
 * value is still present, convert it once and clear the retired attribute.
 */

import { rawHandler } from "@wordpress/blocks";
import { store } from "@wordpress/block-editor";
import { select, useDispatch } from "@wordpress/data";
import { useEffect } from "@wordpress/element";

/**
 * Decide whether InnerBlocks already contain authored content.
 *
 * A single empty paragraph is the block template placeholder and may be
 * replaced by a legacy description. Any authored paragraph or other block is
 * user content and must win over the retired fallback attribute.
 *
 * @param {Array} innerBlocks Current direct child blocks.
 * @return {boolean} Whether migration must leave InnerBlocks untouched.
 */
export function hasMeaningfulAlertInnerBlocks(innerBlocks = []) {
  if (!Array.isArray(innerBlocks)) {
    return false;
  }

  return innerBlocks.some((innerBlock) => {
    if (!innerBlock || typeof innerBlock !== "object") {
      return false;
    }
    if (innerBlock.name !== "core/paragraph") {
      return true;
    }

    const content = innerBlock.attributes?.content;
    if (typeof content === "string") {
      return content.trim() !== "";
    }
    return content !== null && content !== undefined;
  });
}

/**
 * Move a historical alert description into the block's InnerBlocks.
 *
 * @param {Object}   options                  Migration inputs.
 * @param {string}   options.alertDescription Historical description HTML.
 * @param {Object}   options.innerBlocksRef   Ref for the InnerBlocks container.
 * @param {string}   options.clientId         Current alert block client ID.
 * @param {Function} options.setAttributes    WordPress block attribute updater.
 * @return {void}
 */
export default function useLegacyDescriptionMigration({
  alertDescription,
  innerBlocksRef,
  clientId,
  setAttributes,
}) {
  const { replaceInnerBlocks } = useDispatch(store);

  useEffect(() => {
    const currentInnerBlocks = select(store).getBlocks(clientId);
    if (
      alertDescription === "" ||
      innerBlocksRef.current === null ||
      hasMeaningfulAlertInnerBlocks(currentInnerBlocks)
    ) {
      return;
    }

    const convertedBlocks = rawHandler({ HTML: alertDescription });
    replaceInnerBlocks(clientId, convertedBlocks);
    setAttributes({ alertDescription: "" });
  }, [alertDescription, clientId, innerBlocksRef, replaceInnerBlocks, setAttributes]);
}
