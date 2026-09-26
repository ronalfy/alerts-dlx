/**
 * Inspector panel for attaching a global style or applying a snapshot.
 */

import { Button, Notice, PanelBody, SelectControl } from '@wordpress/components';
import { useMemo, useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';

import {
	buildDetachGlobalStyleAttributes,
	buildSnapshotApplyAttributes,
	canManageLibrary,
	findLibraryItem,
	getLocalizedLibraryItems,
	mergeGlobalStyleIntoAttributes,
} from '../utils/alert-library-utils';

/**
 * Library controls for the canonical Alert block.
 *
 * @param {Object}   props               Component props.
 * @param {Object}   props.attributes    Current block attributes.
 * @param {Function} props.setAttributes Block attribute updater.
 * @return {import('react').JSX.Element} Library panel.
 */
export default function AlertLibraryPanel( { attributes, setAttributes } ) {
	const items = useMemo( () => getLocalizedLibraryItems(), [] );
	const globalStyles = useMemo(
		() => items.filter( ( item ) => item.kind === 'global_style' ),
		[ items ]
	);
	const snapshots = useMemo(
		() => items.filter( ( item ) => item.kind === 'snapshot' ),
		[ items ]
	);

	const [ selectedSnapshotId, setSelectedSnapshotId ] = useState(
		snapshots[ 0 ] ? String( snapshots[ 0 ].id ) : ''
	);

	const globalStyleId = Number( attributes.globalStyleId ) || 0;
	const attachedStyle = findLibraryItem( globalStyleId, 'global_style' );
	const manageLibrary = canManageLibrary();

	const globalStyleOptions = [
		{ label: __( 'None', 'alerts-dlx' ), value: '0' },
		...globalStyles.map( ( item ) => ( {
			label: item.title,
			value: String( item.id ),
		} ) ),
	];

	const snapshotOptions = snapshots.length
		? snapshots.map( ( item ) => ( {
			label: item.title,
			value: String( item.id ),
		} ) )
		: [ { label: __( 'No snapshots yet.', 'alerts-dlx' ), value: '' } ];

	/**
	 * None and Detach both copy resolved appearance onto the block, then clear
	 * the id, so the alert does not visually jump after the link is removed.
	 */
	const detachGlobalStyle = () => {
		const resolved = mergeGlobalStyleIntoAttributes( attributes );
		setAttributes( buildDetachGlobalStyleAttributes( resolved ) );
	};

	const onGlobalStyleChange = ( value ) => {
		const nextId = Number( value ) || 0;
		if ( ! nextId ) {
			detachGlobalStyle();
			return;
		}
		setAttributes( { globalStyleId: nextId } );
	};

	const applySnapshot = () => {
		const snapshotId = Number( selectedSnapshotId ) || 0;
		const item = findLibraryItem( snapshotId, 'snapshot' );
		if ( ! item ) {
			return;
		}
		setAttributes(
			buildSnapshotApplyAttributes( item.config, attributes.className || '' )
		);
	};

	return (
		<PanelBody title={ __( 'Library', 'alerts-dlx' ) } initialOpen={ false }>
			{ attachedStyle && (
				<Notice status="info" isDismissible={ false }>
					{ sprintf(
						/* translators: %s: global style title. */
						__( 'This alert follows %s.', 'alerts-dlx' ),
						attachedStyle.title
					) }
				</Notice>
			) }

			{ ! globalStyles.length ? (
				<p>{ __( 'No global styles yet.', 'alerts-dlx' ) }</p>
			) : (
				<SelectControl
					label={ __( 'Global style', 'alerts-dlx' ) }
					value={ String( globalStyleId ) }
					options={ globalStyleOptions }
					onChange={ onGlobalStyleChange }
					help={ __(
						'This alert follows the selected global style. Changes to that style update this alert. Title, description, and button text stay on this block.',
						'alerts-dlx'
					) }
					__nextHasNoMarginBottom
				/>
			) }

			{ globalStyleId > 0 && (
				<Button
					variant="secondary"
					onClick={ detachGlobalStyle }
					style={ { marginBottom: '1rem' } }
				>
					{ __( 'Detach', 'alerts-dlx' ) }
				</Button>
			) }

			{ ! snapshots.length ? (
				<p>{ __( 'No snapshots yet.', 'alerts-dlx' ) }</p>
			) : (
				<>
					<SelectControl
						label={ __( 'Snapshot', 'alerts-dlx' ) }
						value={ selectedSnapshotId }
						options={ snapshotOptions }
						onChange={ setSelectedSnapshotId }
						help={ __(
							'Applying a snapshot copies its settings into this alert. Later edits to the snapshot will not change it.',
							'alerts-dlx'
						) }
						__nextHasNoMarginBottom
					/>
					<Button
						variant="primary"
						onClick={ applySnapshot }
						disabled={ ! selectedSnapshotId }
					>
						{ __( 'Apply snapshot', 'alerts-dlx' ) }
					</Button>
				</>
			) }

			{ manageLibrary && ( ! globalStyles.length || ! snapshots.length ) && (
				<p>
					{ __(
						'Create global styles and snapshots under Settings → AlertsDLX → Styles & Snapshots.',
						'alerts-dlx'
					) }
				</p>
			) }
		</PanelBody>
	);
}
