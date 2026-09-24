/**
 * Shared color palettes for AlertsDLX custom color pickers.
 */

import bootstrapColors from '../bootstrap/colors';
import chakraColors from '../chakraui/colors';
import materialColors from '../material/colors';
import shoelaceColors from '../shoelace/colors';

/**
 * Return the swatches for an alert design, plus the WordPress theme palette.
 *
 * @param {string} alertGroup   Alert design slug.
 * @param {Array}  themePalette Theme or editor color palette.
 * @return {Array} Color palette entries with name and color.
 */
export function getAlertColorPalette( alertGroup, themePalette = [] ) {
	let themeColors = [];

	switch ( alertGroup ) {
		case 'bootstrap':
			themeColors = bootstrapColors;
			break;
		case 'chakra':
			themeColors = chakraColors;
			break;
		case 'material':
			themeColors = materialColors;
			break;
		case 'shoelace':
			themeColors = shoelaceColors;
			break;
		default:
			themeColors = [];
	}

	return [ ...themeColors, ...( themePalette || [] ) ];
}
