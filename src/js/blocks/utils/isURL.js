import { isURL as wpIsURL, isValidFragment, isValidPath } from "@wordpress/url";

/**
 * Whether a value is a site-relative path (leading slash).
 *
 * @param {string} value Value to check.
 * @return {boolean} True when the value is a valid relative path.
 */
export const isRelativePath = ( value ) => {
  if ( ! value || value.charAt( 0 ) !== "/" ) {
    return false;
  }

  return isValidPath( value );
};

const isURL = (value) => {
  if ("" === value) {
    return false;
  }
  const isUrl = wpIsURL(value);
  // If URL is a valid anchor link, return true
  if (!isUrl && isValidFragment(value)) {
    return true;
  }

  return isUrl;
};

export default isURL;
