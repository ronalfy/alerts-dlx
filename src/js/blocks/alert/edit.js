import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody, SelectControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import AlertTypeStyleControl from '../components/AlertTypeStyleControl';
import CanonicalAlertPresetsPanel from '../components/CanonicalAlertPresetsPanel';
import BootstrapEdit from '../bootstrap/edit';
import bootstrapDefinition from '../bootstrap/theme-definition';
import ChakraEdit from '../chakraui/edit';
import chakraDefinition from '../chakraui/theme-definition';
import MaterialEdit from '../material/edit';
import materialDefinition from '../material/theme-definition';
import ShoelaceEdit from '../shoelace/edit';
import shoelaceDefinition from '../shoelace/theme-definition';
import { buildAlertStyleClassName } from '../utils/alert-style-utils';

const designs = {
	bootstrap: { label: 'Bootstrap', Edit: BootstrapEdit, definition: bootstrapDefinition },
	chakra: { label: 'Chakra', Edit: ChakraEdit, definition: chakraDefinition },
	material: { label: 'Material', Edit: MaterialEdit, definition: materialDefinition },
	shoelace: { label: 'Shoelace', Edit: ShoelaceEdit, definition: shoelaceDefinition },
};

export default function CanonicalAlertEdit( props ) {
	const { attributes, setAttributes, name, clientId } = props;
	const design = designs[ attributes.alertGroup ] || designs.bootstrap;
	const DesignEdit = design.Edit;

	const selectDesign = ( alertGroup ) => {
		const nextDesign = designs[ alertGroup ] || designs.bootstrap;
		const nextAlertType = nextDesign.definition.supportedAlertTypes.includes( attributes.alertType )
			? attributes.alertType
			: nextDesign.definition.defaultAlertType;
		const nextAttributes = {
			alertGroup,
			variant: nextDesign.definition.defaultVariant,
			alertType: nextAlertType,
			className: buildAlertStyleClassName( attributes.className, nextAlertType ),
		};
		setAttributes( nextAttributes );
	};

	return (
		<>
			<InspectorControls>
				<CanonicalAlertPresetsPanel
					attributes={ attributes }
					setAttributes={ setAttributes }
				/>
				<PanelBody title={ __( 'Alert design', 'alerts-dlx' ) } initialOpen={ true }>
					<SelectControl
						label={ __( 'Design system', 'alerts-dlx' ) }
						value={ attributes.alertGroup }
						options={ Object.entries( designs ).map( ( [ value, item ] ) => ( { value, label: item.label } ) ) }
						onChange={ selectDesign }
						__nextHasNoMarginBottom
					/>
				</PanelBody>
			</InspectorControls>
			<InspectorControls group="styles">
				<PanelBody title={ __( 'Styles', 'alerts-dlx' ) } initialOpen={ true }>
					<AlertTypeStyleControl
						name={ name }
						attributes={ attributes }
						setAttributes={ setAttributes }
						clientId={ clientId }
					/>
				</PanelBody>
			</InspectorControls>
			<DesignEdit { ...props } />
		</>
	);
}
