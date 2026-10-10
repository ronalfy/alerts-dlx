import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody, SelectControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import AlertTypeStyleControl from '../components/AlertTypeStyleControl';
import AlertLibraryPanel from '../components/AlertLibraryPanel';
import BootstrapEdit from '../bootstrap/edit';
import ChakraEdit from '../chakraui/edit';
import MaterialEdit from '../material/edit';
import ShoelaceEdit from '../shoelace/edit';
import {
	CANONICAL_ALERT_DESIGNS,
	applyCanonicalAlertGroup,
} from '../utils/canonical-alert-design';

const designEditors = {
	bootstrap: BootstrapEdit,
	chakra: ChakraEdit,
	material: MaterialEdit,
	shoelace: ShoelaceEdit,
};

export default function CanonicalAlertEdit(props) {
	const { attributes, setAttributes, name, clientId } = props;
	const design = CANONICAL_ALERT_DESIGNS[attributes.alertGroup] || CANONICAL_ALERT_DESIGNS.bootstrap;
	const DesignEdit = designEditors[design.definition.key] || BootstrapEdit;
	const appearanceLocked = Number(attributes.globalStyleId) > 0;

	const selectDesign = (alertGroup) => {
		applyCanonicalAlertGroup({
			alertGroup,
			currentAlertGroup: attributes.alertGroup,
			alertType: attributes.alertType,
			className: attributes.className,
			appearanceLocked,
			setAttributes,
		});
	};

	return (
		<>
			<InspectorControls>
				<PanelBody title={__('Alert design', 'alerts-dlx')} initialOpen={true}>
					<SelectControl
						label={__('Design system', 'alerts-dlx')}
						value={attributes.alertGroup}
						options={Object.entries(CANONICAL_ALERT_DESIGNS).map(([value, item]) => ({
							value,
							label: item.label,
						}))}
						onChange={selectDesign}
						disabled={appearanceLocked}
						help={
							appearanceLocked
								? __('Detach the global style to change the design system.', 'alerts-dlx')
								: undefined
						}
						__nextHasNoMarginBottom
					/>
				</PanelBody>
			</InspectorControls>
			<InspectorControls group="styles">
				<AlertLibraryPanel
					attributes={attributes}
					setAttributes={setAttributes}
					clientId={clientId}
					name={name}
				/>
				<PanelBody title={__('Styles', 'alerts-dlx')} initialOpen={true}>
					<AlertTypeStyleControl
						name={name}
						attributes={attributes}
						setAttributes={setAttributes}
						clientId={clientId}
						disabled={appearanceLocked}
					/>
				</PanelBody>
			</InspectorControls>
			<DesignEdit {...props} />
		</>
	);
}
