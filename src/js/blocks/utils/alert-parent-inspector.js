/**
 * Navigate from an inner block to its AlertsDLX alert ancestor inspector.
 */

import { dispatch, select } from "@wordpress/data";
import { store as blockEditorStore } from "@wordpress/block-editor";

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
 * Open the block inspector sidebar in the post or site editor.
 *
 * Uses only public data-store actions that are available across the supported
 * WordPress versions.
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
 * Select the parent Alert and open its inspector.
 *
 * The tab argument is kept because existing toolbar callers describe whether
 * the user clicked Settings or Styles. WordPress currently has no public,
 * cross-version API for forcing that inspector sub-tab. The previous private
 * API call broke block registration on WordPress 6.8, so the safe baseline is
 * to open the parent block inspector and let WordPress manage its active tab.
 *
 * @param {string} alertClientId Alert block client ID.
 * @param {string} tab           Requested inspector tab, retained for caller compatibility.
 * @returns {void}
 */
export function openAlertParentInspectorTab(alertClientId, tab) {
  if (!alertClientId) {
    return;
  }

  // Keep the parameter meaningful for callers while avoiding a private API.
  void tab;

  dispatch(blockEditorStore).selectBlock(alertClientId);
  openBlockInspectorSidebar();
}
