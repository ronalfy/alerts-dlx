import { Button, Notice, PanelBody, SelectControl, TextControl } from '@wordpress/components';
import { useMemo, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

import {
	BUILT_IN_CANONICAL_ALERT_PRESETS,
	getCanonicalAlertPresetAdminConfig,
	getCustomCanonicalAlertPresets,
	snapshotCanonicalAlertAttributes,
} from '../utils/canonical-alert-presets';

function normalizeCustomPresets( presets ) {
	if ( ! Array.isArray( presets ) ) {
		return [];
	}
	return presets
		.filter( ( preset ) =>
			preset &&
			typeof preset.id === 'string' &&
			preset.id.startsWith( 'custom-' ) &&
			typeof preset.name === 'string' &&
			preset.attributes &&
			typeof preset.attributes === 'object'
		)
		.slice( 0, 20 )
		.map( ( preset ) => ( {
			id: preset.id,
			name: preset.name,
			description: __( 'Site preset', 'alerts-dlx' ),
			builtIn: false,
			attributes: snapshotCanonicalAlertAttributes( preset.attributes ),
		} ) );
}

async function postPresetAction( config, action, values = {} ) {
	const body = new URLSearchParams( {
		action,
		nonce: config.nonce,
		...values,
	} );
	const response = await globalThis.fetch( config.ajaxUrl, {
		method: 'POST',
		credentials: 'same-origin',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
		body: body.toString(),
	} );
	const result = await response.json();
	if ( ! response.ok || ! result.success ) {
		throw new Error( result?.data?.message || __( 'The preset request failed.', 'alerts-dlx' ) );
	}
	return result.data;
}

export default function CanonicalAlertPresetsPanel( { attributes, setAttributes } ) {
	const config = getCanonicalAlertPresetAdminConfig();
	const [ customPresets, setCustomPresets ] = useState( getCustomCanonicalAlertPresets );
	const [ selectedId, setSelectedId ] = useState( BUILT_IN_CANONICAL_ALERT_PRESETS[ 0 ].id );
	const [ presetName, setPresetName ] = useState( '' );
	const [ busy, setBusy ] = useState( false );
	const [ notice, setNotice ] = useState( null );
	const presets = useMemo(
		() => [ ...BUILT_IN_CANONICAL_ALERT_PRESETS, ...customPresets ],
		[ customPresets ]
	);
	const selectedPreset = presets.find( ( preset ) => preset.id === selectedId ) || presets[ 0 ];

	const runMutation = async ( action, values, successMessage ) => {
		setBusy( true );
		setNotice( null );
		try {
			const state = await postPresetAction( config, action, values );
			setCustomPresets( normalizeCustomPresets( state.presets ) );
			setNotice( { status: 'success', message: successMessage } );
			return state;
		} catch ( error ) {
			setNotice( { status: 'error', message: error.message } );
			return null;
		} finally {
			setBusy( false );
		}
	};

	const applyPreset = () => {
		setAttributes( snapshotCanonicalAlertAttributes( selectedPreset.attributes ) );
		setNotice( {
			status: 'success',
			message: __( 'Preset settings copied into this Alert.', 'alerts-dlx' ),
		} );
	};

	const savePreset = async () => {
		const state = await runMutation(
			'alerts_dlx_save_canonical_preset',
			{
				name: presetName,
				preset_id: selectedPreset && ! selectedPreset.builtIn ? selectedPreset.id : '',
				attributes: JSON.stringify( snapshotCanonicalAlertAttributes( attributes ) ),
			},
			__( 'Site preset saved.', 'alerts-dlx' )
		);
		if ( state ) {
			const saved = normalizeCustomPresets( state.presets ).find( ( preset ) => preset.name === presetName );
			if ( saved ) {
				setSelectedId( saved.id );
			}
		}
	};

	const deletePreset = async () => {
		if ( ! selectedPreset || selectedPreset.builtIn ) {
			return;
		}
		const state = await runMutation(
			'alerts_dlx_delete_canonical_preset',
			{ preset_id: selectedPreset.id },
			__( 'Site preset deleted.', 'alerts-dlx' )
		);
		if ( state ) {
			setSelectedId( BUILT_IN_CANONICAL_ALERT_PRESETS[ 0 ].id );
			setPresetName( '' );
		}
	};

	const saveDefaults = () => runMutation(
		'alerts_dlx_save_canonical_defaults',
		{ attributes: JSON.stringify( snapshotCanonicalAlertAttributes( attributes ) ) },
		__( 'Defaults saved for newly inserted Alerts.', 'alerts-dlx' )
	);

	const clearDefaults = () => runMutation(
		'alerts_dlx_save_canonical_defaults',
		{ clear: 'true' },
		__( 'New-Alert defaults cleared.', 'alerts-dlx' )
	);

	return (
		<PanelBody title={ __( 'Presets and new-Alert defaults', 'alerts-dlx' ) } initialOpen={ false }>
			<p>
				{ __( 'A preset copies presentation and settings only. Title, body, button copy, links, unique ID, and InnerBlocks stay unchanged.', 'alerts-dlx' ) }
			</p>
			<SelectControl
				label={ __( 'Preset', 'alerts-dlx' ) }
				value={ selectedPreset?.id || '' }
				options={ presets.map( ( preset ) => ( {
					label: preset.builtIn
						? preset.name
						: `${ preset.name } — ${ __( 'site', 'alerts-dlx' ) }`,
					value: preset.id,
				} ) ) }
				onChange={ ( nextId ) => {
					setSelectedId( nextId );
					const next = presets.find( ( preset ) => preset.id === nextId );
					setPresetName( next && ! next.builtIn ? next.name : '' );
				} }
				__nextHasNoMarginBottom
			/>
			{ selectedPreset?.description && <p>{ selectedPreset.description }</p> }
			<Button variant="secondary" onClick={ applyPreset } disabled={ busy || ! selectedPreset }>
				{ __( 'Apply snapshot', 'alerts-dlx' ) }
			</Button>

			{ config.canManage && (
				<>
					<hr />
					<TextControl
						label={ __( 'Site preset name', 'alerts-dlx' ) }
						value={ presetName }
						onChange={ setPresetName }
						maxLength={ 80 }
						__nextHasNoMarginBottom
					/>
					<Button
						variant="secondary"
						onClick={ savePreset }
						disabled={ busy || ! presetName.trim() }
					>
						{ selectedPreset && ! selectedPreset.builtIn
							? __( 'Update selected site preset', 'alerts-dlx' )
							: __( 'Save current settings as site preset', 'alerts-dlx' ) }
					</Button>
					{ selectedPreset && ! selectedPreset.builtIn && (
						<Button
							variant="tertiary"
							isDestructive
							onClick={ deletePreset }
							disabled={ busy }
						>
							{ __( 'Delete selected site preset', 'alerts-dlx' ) }
						</Button>
					) }
					<hr />
					<Button variant="secondary" onClick={ saveDefaults } disabled={ busy }>
						{ __( 'Use current settings for new Alerts', 'alerts-dlx' ) }
					</Button>
					<Button variant="tertiary" onClick={ clearDefaults } disabled={ busy }>
						{ __( 'Clear new-Alert defaults', 'alerts-dlx' ) }
					</Button>
					<p className="description">
						{ __( 'Defaults are read when the editor loads and affect insertion only. Reload the editor before checking a newly saved default.', 'alerts-dlx' ) }
					</p>
				</>
			) }

			{ notice && (
				<Notice
					status={ notice.status }
					isDismissible={ true }
					onRemove={ () => setNotice( null ) }
				>
					{ notice.message }
				</Notice>
			) }
		</PanelBody>
	);
}
