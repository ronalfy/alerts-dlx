/* eslint-disable no-undef */
import { useEffect, useMemo, useState } from "@wordpress/element";
import { __ } from "@wordpress/i18n";
import { Button, Flex, Modal, Notice } from "@wordpress/components";
import AlertBuilderPreview from "../Components/AlertBuilder/AlertBuilderPreview";

/**
 * Preview a saved global style or preset.
 *
 * @param {Object}      props         Component props.
 * @param {Object|null} props.item    Library item to preview.
 * @param {Function}    props.onClose Close the modal.
 * @param {Function}    props.onEdit  Open the item in the editor.
 * @return {Element|null} Preview modal.
 */
const PreviewLibraryItemModal = ({ item, onClose, onEdit }) => {
	const previewFixture = useMemo(
		() => alertsDlxAdmin.libraryPreviewFixture || {},
		[]
	);
	const [previewError, setPreviewError] = useState("");

	useEffect(() => {
		setPreviewError("");
	}, [item?.id]);

	if (!item) {
		return null;
	}

	const itemTitle = typeof item.title === "string" ? item.title.trim() : "";
	const handleEdit = () => {
		onClose();
		onEdit(item.id);
	};

	return (
		<Modal
			title={itemTitle || __("Preview", "alerts-dlx")}
			className="alerts-dlx-library-preview-modal"
			size="large"
			onRequestClose={onClose}
		>
			<p className="description alerts-dlx-library-preview-modal__description">
				{__(
					"Sample title, description, button, and icon (when unset) are shown for preview only.",
					"alerts-dlx"
				)}
			</p>
			{previewError && (
				<Notice status="error" isDismissible={false}>
					{previewError}
				</Notice>
			)}
			<AlertBuilderPreview
				values={item.config || {}}
				fixture={previewFixture}
				iconFallback={true}
				hideHeading={true}
				onPreviewError={setPreviewError}
			/>
			<Flex
				className="alerts-dlx-library-preview-modal__footer"
				justify="flex-end"
			>
				<Button variant="secondary" onClick={onClose}>
					{__("Close", "alerts-dlx")}
				</Button>
				<Button variant="primary" onClick={handleEdit}>
					{__("Edit", "alerts-dlx")}
				</Button>
			</Flex>
		</Modal>
	);
};

export default PreviewLibraryItemModal;
