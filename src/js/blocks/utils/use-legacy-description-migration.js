/**
 * Preserve content saved by older Alerts DLX versions.
 *
 * Older alert blocks stored their description as RichText/HTML in the
 * `alertDescription` attribute. Current blocks use InnerBlocks. When an old
 * value is still present, convert it once and clear the retired attribute.
 */

import { rawHandler } from "@wordpress/blocks";
import { store } from "@wordpress/block-editor";
import { useDispatch } from "@wordpress/data";
import { useEffect } from "@wordpress/element";

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
    if (alertDescription !== "" && innerBlocksRef.current !== null) {
      const convertedBlocks = rawHandler({ HTML: alertDescription });
      replaceInnerBlocks(clientId, convertedBlocks);
      setAttributes({ alertDescription: "" });
    }
  }, [innerBlocksRef]);
}
