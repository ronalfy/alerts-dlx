/**
 * Inspector panels for attaching a global style or applying a snapshot.
 */

import { Button, Notice, PanelBody, SelectControl } from '@wordpress/components';
import { useEffect, useMemo, useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';

import {
	buildDetachGlobalStyleAttributes,
	buildSnapshotApplyAttributes,
	findLibraryItem,
	getLocalizedLibraryItems,
	mergeGlobalStyleIntoAttributes,
} from '../utils/alert-library-utils';

/**
 * Open flags for Global Styles and Presets, keyed by client ID and panel.
 *
 * Linking a style or applying a snapshot updates attributes and remounts the
 * Styles sidebar. PanelBody would then apply its closed default again.
 */
const panelOpenState = new Map();

/**
 * Read and update a panel open flag outside the remounting inspector fill.
 *
 * Panels start closed. A later toggle is kept across attribute updates.
 *
 * @param {string} clientId  Block client ID.
 * @param {string} panelName Panel key.
 * @return {{ opened: boolean, onToggle: Function }} Controlled panel state.
 */
function usePersistentPanelOpen(clientId, panelName) {
	const key = `${clientId}:${panelName}`;
	const [opened, setOpened] = useState(() => panelOpenState.get(key) ?? false);

	useEffect(() => {
		setOpened(panelOpenState.get(key) ?? false);
	}, [key]);

	const onToggle = (nextOpened) => {
		const isOpened = Boolean(nextOpened);
		panelOpenState.set(key, isOpened);
		setOpened(isOpened);
	};

	return { opened, onToggle };
}

/**
 * Global Styles and Presets controls for the canonical Alert block.
 *
 * @param {Object}   props               Component props.
 * @param {Object}   props.attributes    Current block attributes.
 * @param {Function} props.setAttributes Block attribute updater.
 * @param {string}   props.clientId      Block client ID.
 * @return {import('react').JSX.Element|null} Style library panels.
 */
export default function AlertLibraryPanel({ attributes, setAttributes, clientId }) {
	const items = useMemo(() => getLocalizedLibraryItems(), []);
	const globalStyles = useMemo(
		() => items.filter((item) => item.kind === 'global_style'),
		[items]
	);
	const snapshots = useMemo(
		() => items.filter((item) => item.kind === 'snapshot'),
		[items]
	);

	const [selectedSnapshotId, setSelectedSnapshotId] = useState(
		snapshots[0] ? String(snapshots[0].id) : ''
	);

	const globalStylesPanel = usePersistentPanelOpen(clientId, 'global-styles');
	const presetsPanel = usePersistentPanelOpen(clientId, 'presets');

	const globalStyleId = Number(attributes.globalStyleId) || 0;
	const attachedStyle = findLibraryItem(globalStyleId, 'global_style');
	const showGlobalStyles =
		globalStyles.length > 0 || (globalStyleId > 0 && !attachedStyle);
	const showPresets = snapshots.length > 0;

	const globalStyleOptions = [
		{ label: __('None', 'alerts-dlx'), value: '0' },
		...globalStyles.map((item) => ({
			label: item.title,
			value: String(item.id),
		})),
	];

	const snapshotOptions = snapshots.map((item) => ({
		label: item.title,
		value: String(item.id),
	}));

	/**
	 * None and Detach both copy resolved appearance onto the block, then clear
	 * the id, so the alert does not visually jump after the link is removed.
	 */
	const detachGlobalStyle = () => {
		const resolved = mergeGlobalStyleIntoAttributes(attributes);
		setAttributes(buildDetachGlobalStyleAttributes(resolved));
	};

	const onGlobalStyleChange = (value) => {
		const nextId = Number(value) || 0;
		if (!nextId) {
			detachGlobalStyle();
			return;
		}
		setAttributes({ globalStyleId: nextId });
	};

	const applySnapshot = () => {
		const snapshotId = Number(selectedSnapshotId) || 0;
		const item = findLibraryItem(snapshotId, 'snapshot');
		if (!item) {
			return;
		}
		setAttributes(
			buildSnapshotApplyAttributes(item.config, attributes.className || '')
		);
	};

	if (!showGlobalStyles && !showPresets) {
		return null;
	}

	return (
		<>
			{showGlobalStyles && (
				<PanelBody
					title={__('Global Styles', 'alerts-dlx')}
					initialOpen={false}
					opened={globalStylesPanel.opened}
					onToggle={globalStylesPanel.onToggle}
				>
					{attachedStyle && (
						<Notice status="info" isDismissible={false}>
							{sprintf(
								/* translators: %s: global style title. */
								__('This alert follows %s.', 'alerts-dlx'),
								attachedStyle.title
							)}
						</Notice>
					)}

					{globalStyles.length > 0 && (
						<SelectControl
							label={__('Global style', 'alerts-dlx')}
							value={String(globalStyleId)}
							options={globalStyleOptions}
							onChange={onGlobalStyleChange}
							help={__(
								'This alert follows the selected global style. Changes to that style update this alert. Title, description, and button text stay on this block.',
								'alerts-dlx'
							)}
							__nextHasNoMarginBottom
						/>
					)}

					{globalStyleId > 0 && (
						<Button variant="secondary" onClick={detachGlobalStyle}>
							{__('Detach', 'alerts-dlx')}
						</Button>
					)}
				</PanelBody>
			)}

			{showPresets && (
				<PanelBody
					title={__('Presets', 'alerts-dlx')}
					initialOpen={false}
					opened={presetsPanel.opened}
					onToggle={presetsPanel.onToggle}
				>
					{globalStyleId > 0 ? (
						<p>
							{__(
								'Detach the global style to apply a preset.',
								'alerts-dlx'
							)}
						</p>
					) : (
						<>
							<SelectControl
								label={__('Preset', 'alerts-dlx')}
								value={selectedSnapshotId}
								options={snapshotOptions}
								onChange={setSelectedSnapshotId}
								help={__(
									'Applying a preset copies its settings into this alert. Later edits to the preset will not change it.',
									'alerts-dlx'
								)}
								__nextHasNoMarginBottom
							/>
							<Button
								variant="primary"
								onClick={applySnapshot}
								disabled={!selectedSnapshotId}
							>
								{__('Apply preset', 'alerts-dlx')}
							</Button>
						</>
					)}
				</PanelBody>
			)}
		</>
	);
}
