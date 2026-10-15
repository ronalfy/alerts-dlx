<?php
/**
 * Sanitize user-supplied alert icons to inline presentation SVG.
 *
 * @package AlertsDLX
 */

namespace DLXPlugins\AlertsDLX;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// phpcs:disable WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase -- DOM properties use camelCase.

/**
 * DOM allowlist for icon SVG.
 *
 * Close-button sprites stay hardcoded in Blocks::print_close_button_svgs()
 * and must not pass through this class.
 */
class SvgSanitizer {

	/**
	 * Maximum icon SVG length in bytes.
	 */
	private const MAX_BYTES = 12000;

	/**
	 * SVG namespace permitted on the xmlns attribute.
	 */
	private const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';

	/**
	 * Presentation elements allowed in a user-supplied icon.
	 */
	private const ELEMENTS = array(
		'svg',
		'g',
		'path',
		'circle',
		'ellipse',
		'line',
		'polyline',
		'polygon',
		'rect',
		'title',
	);

	/**
	 * Drawing attributes allowed on a user-supplied icon.
	 */
	private const ATTRIBUTES = array(
		'xmlns',
		'viewBox',
		'width',
		'height',
		'fill',
		'fill-opacity',
		'fill-rule',
		'd',
		'cx',
		'cy',
		'r',
		'rx',
		'ry',
		'x',
		'y',
		'x1',
		'y1',
		'x2',
		'y2',
		'points',
		'opacity',
		'stroke',
		'stroke-width',
		'stroke-opacity',
		'stroke-linecap',
		'stroke-linejoin',
		'stroke-dasharray',
		'stroke-dashoffset',
		'stroke-miterlimit',
		'class',
		'role',
		'aria-hidden',
		'focusable',
	);

	/**
	 * Sanitize a user-supplied icon to inline presentation SVG.
	 *
	 * Parsing uses DOMDocument::loadXML() with LIBXML_NONET. Entity
	 * substitution is left disabled so the method has no WordPress dependency.
	 *
	 * @param string $svg Raw icon markup.
	 * @return string Clean SVG, or an empty string when the markup is rejected.
	 */
	public static function sanitize( string $svg ): string {
		if ( strlen( $svg ) > self::MAX_BYTES ) {
			return '';
		}

		$svg = trim( $svg );
		if ( '' === $svg ) {
			return '';
		}

		// Doctype and entity declarations are not icon drawing markup.
		if ( false !== stripos( $svg, '<!DOCTYPE' ) || false !== stripos( $svg, '<!ENTITY' ) ) {
			return '';
		}

		$previous_errors              = libxml_use_internal_errors( true );
		$document                     = new \DOMDocument();
		$document->resolveExternals   = false;
		$document->substituteEntities = false;

		// Network access stays disabled while the document is parsed.
		$loaded = $document->loadXML( $svg, LIBXML_NONET );
		libxml_clear_errors();
		libxml_use_internal_errors( $previous_errors );

		if ( ! $loaded ) {
			return '';
		}

		$root = $document->documentElement;
		if ( ! $root instanceof \DOMElement || 'svg' !== $root->localName ) {
			return '';
		}

		self::prune_element( $root );

		$has_drawing_element = false;
		foreach ( $root->childNodes as $child ) {
			if ( $child instanceof \DOMElement ) {
				$has_drawing_element = true;
				break;
			}
		}
		if ( ! $has_drawing_element || 'svg' !== $root->localName ) {
			return '';
		}

		$clean = $document->saveXML( $root );
		if ( ! is_string( $clean ) || '' === $clean || strlen( $clean ) > self::MAX_BYTES ) {
			return '';
		}

		return $clean;
	}

	/**
	 * Drop non-presentation descendants and unsafe attributes from one element.
	 *
	 * @param \DOMElement $element Element already known to be allowed.
	 */
	private static function prune_element( \DOMElement $element ): void {
		$children = array();
		foreach ( $element->childNodes as $child ) {
			$children[] = $child;
		}

		foreach ( $children as $child ) {
			if ( $child instanceof \DOMElement ) {
				if ( ! in_array( $child->localName, self::ELEMENTS, true ) ) {
					$element->removeChild( $child );
					continue;
				}
				self::prune_element( $child );
				continue;
			}

			$keep_title_text = XML_TEXT_NODE === $child->nodeType && 'title' === $element->localName;
			if ( ! $keep_title_text ) {
				$element->removeChild( $child );
			}
		}

		self::prune_attributes( $element );
	}

	/**
	 * Keep drawing attributes and convert className to class.
	 *
	 * @param \DOMElement $element Element whose attributes should be filtered.
	 */
	private static function prune_attributes( \DOMElement $element ): void {
		$remove     = array();
		$class_name = '';

		if ( $element->hasAttributes() ) {
			foreach ( $element->attributes as $attribute ) {
				if ( ! $attribute instanceof \DOMAttr ) {
					continue;
				}

				$local = $attribute->localName;
				$name  = strtolower( $attribute->nodeName );

				if ( str_starts_with( strtolower( $local ), 'on' ) || str_starts_with( $name, 'on' ) ) {
					$remove[] = $attribute;
					continue;
				}

				if ( 'className' === $local ) {
					$class_name = $attribute->value;
					$remove[]   = $attribute;
					continue;
				}

				if ( ! in_array( $local, self::ATTRIBUTES, true ) ) {
					$remove[] = $attribute;
					continue;
				}

				if ( 'xmlns' === $local && self::SVG_NAMESPACE !== $attribute->value ) {
					$remove[] = $attribute;
				}
			}
		}

		foreach ( $remove as $attribute ) {
			self::remove_attribute( $element, $attribute );
		}

		if ( '' === $class_name ) {
			return;
		}

		$existing = $element->getAttribute( 'class' );
		$combined = trim( $existing . ' ' . $class_name );
		if ( '' !== $combined ) {
			$element->setAttribute( 'class', $combined );
		}
	}

	/**
	 * Remove one attribute, including namespaced names such as xlink:href.
	 *
	 * @param \DOMElement $element   Element that owns the attribute.
	 * @param \DOMAttr    $attribute Attribute to remove.
	 */
	private static function remove_attribute( \DOMElement $element, \DOMAttr $attribute ): void {
		if ( is_string( $attribute->namespaceURI ) && '' !== $attribute->namespaceURI ) {
			$element->removeAttributeNS( $attribute->namespaceURI, $attribute->localName );
		}
		if ( $element->hasAttribute( $attribute->nodeName ) ) {
			$element->removeAttribute( $attribute->nodeName );
		}
	}
}
