import { isURL as wpIsURL, isValidFragment } from "@wordpress/url";
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
