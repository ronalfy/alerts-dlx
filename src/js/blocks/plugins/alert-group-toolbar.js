/**
 * Block toolbar dropdown for switching the canonical Alert design group.
 *
 * Registered after the alert style toolbar. That toolbar does not set a
 * BlockControls group or order, so this later filter wraps it and renders
 * its controls first, immediately to the left.
 */

import { addFilter } from "@wordpress/hooks";
import { createHigherOrderComponent } from "@wordpress/compose";
import { BlockControls } from "@wordpress/block-editor";
import {
	ToolbarItem,
	ToolbarGroup,
	DropdownMenu,
	MenuGroup,
	MenuItem,
} from "@wordpress/components";
import { filter as filterIcon } from "@wordpress/icons";
import { __ } from "@wordpress/i18n";
import { CANONICAL_ALERT_BLOCK_NAME } from "../utils/alert-block-registry";
import {
	CANONICAL_ALERT_DESIGNS,
	applyCanonicalAlertGroup,
} from "../utils/canonical-alert-design";

/**
 * HOC that adds an alert group dropdown to the canonical Alert toolbar.
 *
 * @param {Function} BlockEdit Original BlockEdit component.
 * @return {Function}
 */
const withAlertGroupToolbar = createHigherOrderComponent((BlockEdit) => {
	return (props) => {
		const { name, attributes, setAttributes } = props;

		if (name !== CANONICAL_ALERT_BLOCK_NAME) {
			return <BlockEdit {...props} />;
		}

		const { alertType, className, alertGroup, globalStyleId } = attributes;
		const appearanceLocked = Number(globalStyleId) > 0;
		const currentDesign =
			CANONICAL_ALERT_DESIGNS[alertGroup] || CANONICAL_ALERT_DESIGNS.bootstrap;
		const groupLabel = appearanceLocked
			? __("Detach the global style to change the design system.", "alerts-dlx")
			: __("Alert group", "alerts-dlx");

		return (
			<>
				<BlockControls>
					<ToolbarGroup label={__("Alert group", "alerts-dlx")}>
						<ToolbarItem>
							{(toggleProps) => (
								<DropdownMenu
									icon={filterIcon}
									label={groupLabel}
									text={currentDesign.label}
									className="alerts-dlx-alert-group-toolbar"
									toggleProps={{
										...toggleProps,
										disabled: appearanceLocked,
										accessibleWhenDisabled: appearanceLocked,
									}}
								>
									{({ onClose }) => (
										<MenuGroup label={__("Design system", "alerts-dlx")}>
											{Object.entries(CANONICAL_ALERT_DESIGNS).map(
												([value, design]) => (
													<MenuItem
														key={value}
														role="menuitemradio"
														isSelected={alertGroup === value}
														disabled={appearanceLocked}
														onClick={() => {
															applyCanonicalAlertGroup({
																alertGroup: value,
																currentAlertGroup: alertGroup,
																alertType,
																className,
																appearanceLocked,
																setAttributes,
															});
															onClose();
														}}
														icon={alertGroup === value ? "yes" : null}
													>
														{design.label}
													</MenuItem>
												)
											)}
										</MenuGroup>
									)}
								</DropdownMenu>
							)}
						</ToolbarItem>
					</ToolbarGroup>
				</BlockControls>
				<BlockEdit {...props} />
			</>
		);
	};
}, "withAlertGroupToolbar");

addFilter(
	"editor.BlockEdit",
	"alerts-dlx/alert-group-toolbar",
	withAlertGroupToolbar
);
