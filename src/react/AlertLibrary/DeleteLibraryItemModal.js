import { Button, Flex, Modal } from "@wordpress/components";
import { __, sprintf } from "@wordpress/i18n";
import { getLibraryLabels } from "./kind-labels";

/**
 * Confirm permanent deletion of a global style or preset.
 *
 * @param {Object}   props            Component props.
 * @param {Object|null} props.item    Library item awaiting confirmation.
 * @param {boolean}  props.isDeleting Whether the delete request is in progress.
 * @param {Function} props.onCancel   Close the modal without deleting.
 * @param {Function} props.onConfirm  Run the delete request.
 * @return {Element|null} Confirmation modal.
 */
const DeleteLibraryItemModal = ({
	item,
	isDeleting = false,
	onCancel,
	onConfirm,
}) => {
	if (!item) {
		return null;
	}

	const labels = getLibraryLabels(item.kind);
	const itemTitle = typeof item.title === "string" ? item.title.trim() : "";
	const closeModal = () => {
		if (!isDeleting) {
			onCancel();
		}
	};

	return (
		<Modal
			title={sprintf(
				/* translators: %s: library kind, either Preset or Global style. */
				__("Delete %s?", "alerts-dlx"),
				labels.singular
			)}
			onRequestClose={closeModal}
			shouldCloseOnEsc={!isDeleting}
			shouldCloseOnClickOutside={!isDeleting}
			isDismissible={!isDeleting}
		>
			<p>{labels.deleteConfirm}</p>
			{labels.deleteWarning && <p>{labels.deleteWarning}</p>}
			<Flex justify="flex-end">
				<Button
					variant="secondary"
					onClick={closeModal}
					disabled={isDeleting}
				>
					{__("Cancel", "alerts-dlx")}
				</Button>
				<Button
					variant="primary"
					isDestructive
					onClick={onConfirm}
					disabled={isDeleting}
					isBusy={isDeleting}
				>
					{__("Delete", "alerts-dlx")}
				</Button>
			</Flex>
		</Modal>
	);
};

export default DeleteLibraryItemModal;
