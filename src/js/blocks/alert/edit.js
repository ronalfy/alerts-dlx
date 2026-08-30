import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody, SelectControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import BootstrapEdit from '../bootstrap/edit';
import bootstrapDefinition from '../bootstrap/theme-definition';
import ChakraEdit from '../chakraui/edit';
import chakraDefinition from '../chakraui/theme-definition';
import MaterialEdit from '../material/edit';
import materialDefinition from '../material/theme-definition';
import ShoelaceEdit from '../shoelace/edit';
import shoelaceDefinition from '../shoelace/theme-definition';

const designs = {
	bootstrap: { label: 'Bootstrap', Edit: BootstrapEdit, definition: bootstrapDefinition },
	chakra: { label: 'Chakra', Edit: ChakraEdit, definition: chakraDefinition },
	material: { label: 'Material', Edit: MaterialEdit, definition: materialDefinition },
	shoelace: { label: 'Shoelace', Edit: ShoelaceEdit, definition: shoelaceDefinition },
};

export default function CanonicalAlertEdit( props ) {
	const { attributes, setAttributes } = props;
	const design = designs[ attributes.alertGroup ] || designs.bootstrap;
	const DesignEdit = design.Edit;

	const selectDesign = ( alertGroup ) => {
		const nextDesign = designs[ alertGroup ] || designs.bootstrap;
		const nextAttributes = { alertGroup, variant: nextDesign.definition.defaultVariant };
		if ( ! nextDesign.definition.supportedAlertTypes.includes( attributes.alertType ) ) {
			nextAttributes.alertType = nextDesign.definition.defaultAlertType;
		}
		setAttributes( nextAttributes );
	};

	return (
		<>
			<InspectorControls>
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
			<DesignEdit { ...props } />
		</>
	);
}
