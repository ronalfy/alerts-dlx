<?php
/**
 * Shipped alert icon catalog keyed by design group.
 *
 * @package AlertsDLX
 */

namespace DLXPlugins\AlertsDLX;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Looks up built-in icon SVG by group and key.
 */
class IconCatalog {

	/**
	 * Decoded catalog, loaded once per request.
	 *
	 * @var array<string, array<string, string>>|null
	 */
	private static $catalog = null;

	/**
	 * Absolute path to the shipped catalog.
	 *
	 * @return string
	 */
	public static function get_catalog_path() {
		return __DIR__ . '/icon-catalog.php';
	}

	/**
	 * Normalize an alert group onto a catalog group.
	 *
	 * @param string $alert_group Alert design slug.
	 * @return string Catalog group slug.
	 */
	public static function normalize_group( $alert_group ) {
		$alert_group = strtolower( (string) $alert_group );
		$alert_group = preg_replace( '/[^a-z0-9_\-]/', '', $alert_group );
		if ( 'shoelace' === $alert_group ) {
			return 'bootstrap';
		}
		if ( in_array( $alert_group, array( 'bootstrap', 'chakra', 'material' ), true ) ) {
			return $alert_group;
		}

		return 'chakra';
	}

	/**
	 * Return the decoded catalog.
	 *
	 * @return array<string, array<string, string>>
	 */
	public static function get_catalog() {
		if ( null !== self::$catalog ) {
			return self::$catalog;
		}

		$path = self::get_catalog_path();
		if ( ! is_readable( $path ) ) {
			self::$catalog = array();
			return self::$catalog;
		}

		$decoded       = require $path;
		self::$catalog = is_array( $decoded ) ? $decoded : array();

		return self::$catalog;
	}

	/**
	 * Catalog keys for one alert group.
	 *
	 * @param string $alert_group Alert design slug.
	 * @return string[]
	 */
	public static function get_keys( $alert_group ) {
		$catalog = self::get_catalog();
		$group   = self::normalize_group( $alert_group );
		if ( empty( $catalog[ $group ] ) || ! is_array( $catalog[ $group ] ) ) {
			return array();
		}

		return array_keys( $catalog[ $group ] );
	}

	/**
	 * Whether a value is a shipped catalog key for the group.
	 *
	 * @param string $alert_group Alert design slug.
	 * @param string $value       Stored icon value.
	 * @return bool
	 */
	public static function is_key( $alert_group, $value ) {
		$value = trim( (string) $value );
		if ( '' === $value || self::is_raw_svg( $value ) ) {
			return false;
		}

		$catalog = self::get_catalog();
		$group   = self::normalize_group( $alert_group );

		return isset( $catalog[ $group ][ $value ] ) && is_string( $catalog[ $group ][ $value ] );
	}

	/**
	 * Return shipped SVG for a catalog key.
	 *
	 * @param string $alert_group Alert design slug.
	 * @param string $key         Catalog key.
	 * @return string SVG markup or empty string.
	 */
	public static function get_svg( $alert_group, $key ) {
		if ( ! self::is_key( $alert_group, $key ) ) {
			return '';
		}

		$catalog = self::get_catalog();
		$group   = self::normalize_group( $alert_group );

		return (string) $catalog[ $group ][ $key ];
	}

	/**
	 * Whether a value looks like inline SVG markup.
	 *
	 * @param string $value Stored icon value.
	 * @return bool
	 */
	public static function is_raw_svg( $value ) {
		return false !== stripos( (string) $value, '<svg' );
	}
}
