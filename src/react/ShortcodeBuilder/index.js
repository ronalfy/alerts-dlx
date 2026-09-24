import { createRoot, StrictMode } from '@wordpress/element';
import { createPortal } from 'react-dom';
import { Slot, SlotFillProvider } from '@wordpress/components';
import Settings from './settings';

const container = document.getElementById( 'alerts-dlx-shortcode-builder' );
const slotContainer = document.getElementById( 'alerts-dlx-admin-container-slot' );

if ( container ) {
	container.innerHTML = '';

	if ( slotContainer && slotContainer.parentElement?.contains( container ) ) {
		const commonParent = slotContainer.parentElement;
		const rootContainer = document.createElement( 'div' );
		rootContainer.style.display = 'none';
		commonParent.appendChild( rootContainer );

		const root = createRoot( rootContainer );
		root.render(
			<StrictMode>
				<SlotFillProvider>
					{ createPortal( <Settings />, container ) }
					{ createPortal( <Slot name="alertsDlxSettingsFooter" />, slotContainer ) }
				</SlotFillProvider>
			</StrictMode>
		);
	} else {
		const root = createRoot( container );
		root.render(
			<StrictMode>
				<SlotFillProvider>
					<Settings />
				</SlotFillProvider>
			</StrictMode>
		);
	}
}
