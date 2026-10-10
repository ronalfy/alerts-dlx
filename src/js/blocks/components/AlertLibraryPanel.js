/**
 * Inspector panels for attaching a global style or applying a snapshot.
 */

import { BlockPreview, store as blockEditorStore } from '@wordpress/block-editor';
import { cloneBlock, createBlock } from '@wordpress/blocks';
import {
	BaseControl,
	Button,
	Notice,
	PanelBody,
	Popover,
	SelectControl,
} from '@wordpress/components';
import { useRegistry } from '@wordpress/data';
import { useEffect, useMemo, useRef, useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';

import {
	SNAPSHOT_BLOCK_KEYS,
	buildDetachGlobalStyleAttributes,
	buildSnapshotApplyAttributes,
	findLibraryItem,
	getLocalizedLibraryItems,
	libraryConfigToBlockAttributes,
	mergeGlobalStyleIntoAttributes,
} from '../utils/alert-library-utils';

const PREVIEW_VIEWPORT_WIDTH = 600;
const EMPTY_PREVIEW_BLOCKS = [];

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
function usePersistentPanelOpen( clientId, panelName ) {
	const key = `${ clientId }:${ panelName }`;
	const [ opened, setOpened ] = useState( () => panelOpenState.get( key ) ?? false );

	useEffect( () => {
		setOpened( panelOpenState.get( key ) ?? false );
	}, [ key ] );

	const onToggle = ( nextOpened ) => {
		const isOpened = Boolean( nextOpened );
		panelOpenState.set( key, isOpened );
		setOpened( isOpened );
	};

	return { opened, onToggle };
}

/**
 * Build a BlockPreview block list for one preset.
 *
 * The popover is the same treatment as alert styles. Snapshot fields are
 * mapped with libraryConfigToBlockAttributes and SNAPSHOT_BLOCK_KEYS.
 * globalStyleId is cleared so the preview matches an immediate apply.
 *
 * @param {Object} registry   WordPress data registry.
 * @param {string} clientId   Block client ID.
 * @param {string} blockName  Block name.
 * @param {Object} attributes Current block attributes.
 * @param {Object} item       Snapshot library item.
 * @return {Object[]} Preview blocks.
 */
function getPresetPreviewBlocks( registry, clientId, blockName, attributes, item ) {
	const sourceBlock = clientId
		? registry.select( blockEditorStore ).getBlock( clientId )
		: null;
	const sourceAttributes = sourceBlock?.attributes ?? attributes ?? {};
	const previewAttributes = {
		...libraryConfigToBlockAttributes(
			item?.config || {},
			SNAPSHOT_BLOCK_KEYS,
			sourceAttributes.className || ''
		),
		globalStyleId: 0,
		// Keep this id off the canvas block so the theme edit effect does not rewrite it.
		uniqueId: `alerts-dlx-preset-preview-${ item?.id || 'preset' }`,
	};
	const fallbackInnerBlocks = () => [
		createBlock( 'core/paragraph', {
			content: __( 'This is an alert preview.', 'alerts-dlx' ),
		} ),
	];

	if ( sourceBlock ) {
		return [
			cloneBlock(
				sourceBlock,
				previewAttributes,
				sourceBlock.innerBlocks?.length ? undefined : fallbackInnerBlocks()
			),
		];
	}

	if ( ! blockName ) {
		return EMPTY_PREVIEW_BLOCKS;
	}

	return [
		createBlock(
			blockName,
			{
				...sourceAttributes,
				...previewAttributes,
			},
			fallbackInnerBlocks()
		),
	];
}

/**
 * Preset buttons with a hover preview. Clicking copies that snapshot immediately.
 *
 * @param {Object}   props               Component props.
 * @param {Array}    props.snapshots     Snapshot library items.
 * @param {Object}   props.attributes    Current block attributes.
 * @param {Function} props.setAttributes Block attribute updater.
 * @param {string}   props.clientId      Block client ID.
 * @param {string}   props.name          Block name.
 * @return {JSX.Element} Preset button group.
 */
function PresetButtonGroup( {
	snapshots,
	attributes,
	setAttributes,
	clientId,
	name,
} ) {
	const registry = useRegistry();
	const [ showPopover, setShowPopover ] = useState( false );
	const [ popoverAnchor, setPopoverAnchor ] = useState();
	const [ hoveredPresetId, setHoveredPresetId ] = useState( null );
	const closePreviewTimer = useRef( null );

	useEffect( () => {
		return () => {
			if ( closePreviewTimer.current ) {
				clearTimeout( closePreviewTimer.current );
			}
		};
	}, [] );

	const cancelClosePresetPreview = () => {
		if ( closePreviewTimer.current ) {
			clearTimeout( closePreviewTimer.current );
			closePreviewTimer.current = null;
		}
	};

	/**
	 * Open a preview of the preset under the pointer.
	 *
	 * @param {number}      presetId Snapshot id to preview.
	 * @param {HTMLElement} anchor   Button the popover should attach to.
	 */
	const openPresetPreview = ( presetId, anchor ) => {
		if ( ! anchor ) {
			return;
		}

		cancelClosePresetPreview();
		setPopoverAnchor( anchor );
		setHoveredPresetId( presetId );
		setShowPopover( true );
	};

	/**
	 * Close the preview after a short delay so the pointer can reach the popover.
	 */
	const closePresetPreview = () => {
		cancelClosePresetPreview();
		closePreviewTimer.current = setTimeout( () => {
			setShowPopover( false );
			setHoveredPresetId( null );
		}, 150 );
	};

	const hoveredItem =
		snapshots.find( ( item ) => Number( item.id ) === Number( hoveredPresetId ) ) ||
		null;

	const previewBlocks = useMemo( () => {
		if ( ! hoveredItem ) {
			return EMPTY_PREVIEW_BLOCKS;
		}

		return getPresetPreviewBlocks(
			registry,
			clientId,
			name,
			attributes,
			hoveredItem
		);
	}, [ registry, clientId, name, attributes, hoveredItem ] );

	/**
	 * Copy a snapshot onto the block without toggling the panel.
	 *
	 * Attribute updates remount the Styles sidebar. The open flag stays in
	 * panelOpenState, so this handler must not collapse the panel.
	 *
	 * @param {number} snapshotId Snapshot post id.
	 */
	const applySnapshot = ( snapshotId ) => {
		const item = findLibraryItem( snapshotId, 'snapshot' );
		if ( ! item ) {
			return;
		}
		setAttributes(
			buildSnapshotApplyAttributes( item.config, attributes.className || '' )
		);
	};

	return (
		<>
			<BaseControl
				id="alerts-dlx-presets"
				label={ __( 'Preset', 'alerts-dlx' ) }
				help={ __(
					'Applying a preset copies its settings into this alert. Later edits to the preset will not change it.',
					'alerts-dlx'
				) }
				__nextHasNoMarginBottom
			>
				<div
					className="alerts-dlx-preset-buttons"
					role="group"
					aria-label={ __( 'Presets', 'alerts-dlx' ) }
				>
					{ snapshots.map( ( item ) => (
						<Button
							key={ item.id }
							variant="secondary"
							onClick={ () => applySnapshot( item.id ) }
							onMouseEnter={ ( event ) =>
								openPresetPreview( item.id, event.currentTarget )
							}
							onMouseLeave={ closePresetPreview }
						>
							{ item.title }
						</Button>
					) ) }
				</div>
			</BaseControl>
			{ showPopover && popoverAnchor && previewBlocks.length > 0 && (
				<Popover
					className="alerts-dlx-preset-popover"
					placement="left"
					onMouseEnter={ cancelClosePresetPreview }
					onMouseLeave={ closePresetPreview }
					noArrow={ false }
					offset={ 30 }
					anchor={ popoverAnchor }
					expandOnMobile={ true }
					focusOnMount={ false }
				>
					<div
						className="alerts-dlx-preset-popover__preview"
						style={ { width: '100%', minWidth: '296px' } }
					>
						<BlockPreview
							blocks={ previewBlocks }
							viewportWidth={ PREVIEW_VIEWPORT_WIDTH }
							minHeight={ 96 }
						/>
					</div>
				</Popover>
			) }
		</>
	);
}

/**
 * Global Styles and Presets controls for the canonical Alert block.
 *
 * @param {Object}   props               Component props.
 * @param {Object}   props.attributes    Current block attributes.
 * @param {Function} props.setAttributes Block attribute updater.
 * @param {string}   props.clientId      Block client ID.
 * @param {string}   props.name          Block name.
 * @return {JSX.Element|null} Style library panels.
 */
export default function AlertLibraryPanel( {
	attributes,
	setAttributes,
	clientId,
	name = '',
} ) {
	const items = useMemo( () => getLocalizedLibraryItems(), [] );
	const globalStyles = useMemo(
		() => items.filter( ( item ) => item.kind === 'global_style' ),
		[ items ]
	);
	const snapshots = useMemo(
		() => items.filter( ( item ) => item.kind === 'snapshot' ),
		[ items ]
	);

	const globalStylesPanel = usePersistentPanelOpen( clientId, 'global-styles' );
	const presetsPanel = usePersistentPanelOpen( clientId, 'presets' );

	const globalStyleId = Number( attributes.globalStyleId ) || 0;
	const [ pendingGlobalStyleId, setPendingGlobalStyleId ] = useState(
		String( globalStyleId )
	);

	/**
	 * Keep the dropdown aligned when the attached id changes outside this control.
	 *
	 * Detach, preset apply, and other attribute updates can change globalStyleId
	 * without a dropdown event. The pending selection must follow that id.
	 */
	useEffect( () => {
		setPendingGlobalStyleId( String( globalStyleId ) );
	}, [ globalStyleId ] );

	const attachedStyle = findLibraryItem( globalStyleId, 'global_style' );
	const showGlobalStyles =
		globalStyles.length > 0 || ( globalStyleId > 0 && ! attachedStyle );
	const showPresets = snapshots.length > 0;

	const globalStyleOptions = [
		{ label: __( 'None', 'alerts-dlx' ), value: '0' },
		...globalStyles.map( ( item ) => ( {
			label: item.title,
			value: String( item.id ),
		} ) ),
	];

	const pendingId = Number( pendingGlobalStyleId ) || 0;
	const pendingMatchesAttached = pendingId === globalStyleId;

	/**
	 * Copy resolved appearance onto the block, then clear the id.
	 *
	 * Apply with None and the Detach button both use this path so the alert
	 * does not visually jump after the link is removed.
	 */
	const detachGlobalStyle = () => {
		const resolved = mergeGlobalStyleIntoAttributes( attributes );
		setAttributes( buildDetachGlobalStyleAttributes( resolved ) );
	};

	/**
	 * Stage a global style choice. Apply writes it onto the block.
	 *
	 * @param {string} value Selected global style id.
	 */
	const onPendingGlobalStyleChange = ( value ) => {
		setPendingGlobalStyleId( String( value ) );
	};

	/**
	 * Write the pending global style after Apply.
	 *
	 * The dropdown only updates local state. Apply is not rendered when that
	 * selection already matches the attached id. None uses the same detach path
	 * as the Detach button. Attribute updates remount the Styles sidebar, and
	 * the open flag stays in panelOpenState, so this handler must not collapse the panel.
	 */
	const applyPendingGlobalStyle = () => {
		if ( pendingMatchesAttached ) {
			return;
		}

		if ( ! pendingId ) {
			detachGlobalStyle();
			return;
		}

		setAttributes( { globalStyleId: pendingId } );
	};

	if ( ! showGlobalStyles && ! showPresets ) {
		return null;
	}

	return (
		<>
			{ showGlobalStyles && (
				<PanelBody
					title={ __( 'Global Styles', 'alerts-dlx' ) }
					initialOpen={ false }
					opened={ globalStylesPanel.opened }
					onToggle={ globalStylesPanel.onToggle }
				>
					{ attachedStyle && (
						<Notice status="info" isDismissible={ false }>
							{ sprintf(
								/* translators: %s: global style title. */
								__( 'This alert follows %s.', 'alerts-dlx' ),
								attachedStyle.title
							) }
						</Notice>
					) }

					<div className="alerts-dlx-global-style-control">
						{ globalStyles.length > 0 && (
							<SelectControl
								label={ __( 'Global style', 'alerts-dlx' ) }
								value={ pendingGlobalStyleId }
								options={ globalStyleOptions }
								onChange={ onPendingGlobalStyleChange }
								__nextHasNoMarginBottom
							/>
						) }
						{ ! pendingMatchesAttached && globalStyles.length > 0 && (
							<Button
								variant="secondary"
								onClick={ applyPendingGlobalStyle }
							>
								{ __( 'Apply', 'alerts-dlx' ) }
							</Button>
						) }
						{ globalStyleId > 0 && (
							<Button variant="secondary" onClick={ detachGlobalStyle }>
								{ __( 'Detach', 'alerts-dlx' ) }
							</Button>
						) }
					</div>
				</PanelBody>
			) }

			{ showPresets && (
				<PanelBody
					title={ __( 'Presets', 'alerts-dlx' ) }
					initialOpen={ false }
					opened={ presetsPanel.opened }
					onToggle={ presetsPanel.onToggle }
				>
					{ globalStyleId > 0 ? (
						<p>
							{ __(
								'Detach the global style to apply a preset.',
								'alerts-dlx'
							) }
						</p>
					) : (
						<PresetButtonGroup
							snapshots={ snapshots }
							attributes={ attributes }
							setAttributes={ setAttributes }
							clientId={ clientId }
							name={ name }
						/>
					) }
				</PanelBody>
			) }
		</>
	);
}
