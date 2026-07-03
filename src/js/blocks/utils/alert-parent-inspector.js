/**
 * Navigate from an inner block to its AlertsDLX alert ancestor inspector.
 */

import { dispatch, select } from "@wordpress/data";
import { store as blockEditorStore } from "@wordpress/block-editor";
import { __dangerousOptInToUnstableAPIsOnlyForCoreModules } from "@wordpress/private-apis";
export const { lock, unlock } =
  __dangerousOptInToUnstableAPIsOnlyForCoreModules(
    "I acknowledge private features are not for use in themes or plugins and doing so will break in the next version of WordPress.",
    "@wordpress/editor"
  );

export const ALERT_BLOCK_NAMES = [
  "mediaron/alerts-dlx-bootstrap",
  "mediaron/alerts-dlx-chakra",
  "mediaron/alerts-dlx-material",
  "mediaron/alerts-dlx-shoelace",
];

/**
 * Find the nearest AlertsDLX alert ancestor for a block.
 *
 * @param {string}   clientId Block client ID.
 * @param {Function} selectFn Block editor select function.
 * @return {string|null} Alert ancestor client ID or null.
 */
export function getAlertAncestorClientId(clientId, selectFn) {
  let currentId = clientId;

  while (currentId) {
    const parentId = selectFn(blockEditorStore).getBlockRootClientId(currentId);
    if (!parentId) {
      return null;
    }

    const parentBlock = selectFn(blockEditorStore).getBlock(parentId);
    if (parentBlock && ALERT_BLOCK_NAMES.includes(parentBlock.name)) {
      return parentId;
    }

    currentId = parentId;
  }

  return null;
}

/**
 * Open the block inspector sidebar in post or site editor.
 */
function openBlockInspectorSidebar() {
  const editPostStore = select("core/edit-post");
  if (editPostStore) {
    dispatch("core/edit-post").openGeneralSidebar("edit-post/block");
    return;
  }

  const editSiteStore = select("core/edit-site");
  if (editSiteStore) {
    dispatch("core/edit-site").openGeneralSidebar("edit-site/block-inspector");
  }
}

/**
 * Select an alert block and open its inspector tab.
 *
 * Requires a WordPress/Gutenberg version that exposes the private
 * requestInspectorTab action via @wordpress/private-apis.
 * @param {string} alertClientId Alert block client ID.
 * @param {string} tab          Inspector tab: 'settings' or 'styles'.
 * @returns {void}
 */
export function openAlertParentInspectorTab(alertClientId, tab) {
  if (!alertClientId) {
    return;
  }

  dispatch(blockEditorStore).selectBlock(alertClientId);
  openBlockInspectorSidebar();

  const blockEditorDispatch = unlock(dispatch(blockEditorStore));

  if (typeof blockEditorDispatch.requestInspectorTab === "function") {
    blockEditorDispatch.requestInspectorTab(tab, {
      openPanel: alertClientId,
    });
  }
}
