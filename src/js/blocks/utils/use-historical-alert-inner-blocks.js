import { useInnerBlocksProps } from '@wordpress/block-editor';
import { useRef } from '@wordpress/element';

/**
 * Build the common historical alert InnerBlocks ref and editor options.
 *
 * @param {Object}   options                    Hook options.
 * @param {boolean}  options.innerBlocksEnabled Whether non-paragraph children are allowed.
 * @param {Function} options.renderAppender     Optional historical Material appender.
 * @return {{innerBlocksRef: Object, innerBlockProps: Object}} Shared ref and block props.
 */
export default function useHistoricalAlertInnerBlocks( {
	innerBlocksEnabled,
	renderAppender,
} ) {
	const innerBlocksRef = useRef( null );
	const settings = {
		allowedBlocks: innerBlocksEnabled ? true : [ 'core/paragraph' ],
		template: [ [ 'core/paragraph', { placeholder: '' } ] ],
	};
	if ( renderAppender ) {
		settings.renderAppender = renderAppender;
	}

	const innerBlockProps = useInnerBlocksProps(
		{
			className: 'alerts-dlx-content',
			ref: innerBlocksRef,
		},
		settings
	);

	return { innerBlocksRef, innerBlockProps };
}
