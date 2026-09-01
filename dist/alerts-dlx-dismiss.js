/******/ (() => { // webpackBootstrap
/*!*********************************!*\
  !*** ./src/js/dismiss/index.js ***!
  \*********************************/
/**
 * Dismissible alert cookies and close-button handlers.
 *
 * Client-side hide-on-load is required so dismissal works under full-page
 * caches that skip PHP cookie checks for anonymous visitors.
 */

/**
 * Get cookie names for an alert unique ID.
 *
 * New cookies use the figure id as-is. Legacy cookies used a double prefix.
 *
 * @param {string} uniqueId Alert unique id (e.g. alerts-dlx-abc123).
 * @return {{ current: string, legacy: string }}
 */
var getCookieNames = function getCookieNames(uniqueId) {
  return {
    current: uniqueId,
    legacy: "alerts-dlx-".concat(uniqueId)
  };
};

/**
 * Read a cookie value by name.
 *
 * @param {string} name Cookie name.
 * @return {string|null} Cookie value or null.
 */
var getCookie = function getCookie(name) {
  var match = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1') + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
};

/**
 * Whether an alert has a dismiss cookie set (current or legacy name).
 *
 * @param {string} uniqueId Alert unique id.
 * @return {boolean}
 */
var hasDismissCookie = function hasDismissCookie(uniqueId) {
  if (!uniqueId) {
    return false;
  }
  var _getCookieNames = getCookieNames(uniqueId),
    current = _getCookieNames.current,
    legacy = _getCookieNames.legacy;
  return Boolean(getCookie(current) || getCookie(legacy));
};

/**
 * Set a dismiss cookie with Safari-friendly attributes.
 *
 * @param {string} name    Cookie name.
 * @param {string} value   Cookie value.
 * @param {number} maxAge  Lifetime in seconds.
 */
var setDismissCookie = function setDismissCookie(name, value, maxAge) {
  var expires = new Date(Date.now() + maxAge * 1000).toUTCString();
  var cookie = "".concat(name, "=").concat(encodeURIComponent(value));
  cookie += "; Path=/";
  cookie += "; Max-Age=".concat(maxAge);
  cookie += "; Expires=".concat(expires);
  cookie += "; SameSite=Lax";
  if ('https:' === window.location.protocol) {
    cookie += "; Secure";
  }
  document.cookie = cookie;
};

/**
 * Resolve the unique id for an alert container.
 *
 * @param {Element} alert Alert root element.
 * @return {string|null}
 */
var getAlertUniqueId = function getAlertUniqueId(alert) {
  var figure = alert.querySelector('figure');
  if (!figure) {
    return null;
  }
  return figure.getAttribute('id') || null;
};

/**
 * Remove alerts that were previously dismissed (works with page cache).
 */
var hideDismissedAlerts = function hideDismissedAlerts() {
  document.querySelectorAll('.alerts-dlx').forEach(function (alert) {
    if (!alert.querySelector('.alerts-dlx-close')) {
      return;
    }
    var uniqueId = getAlertUniqueId(alert);
    if (hasDismissCookie(uniqueId)) {
      alert.remove();
    }
  });
};

/**
 * Bind close button click handlers.
 */
var bindCloseButtons = function bindCloseButtons() {
  document.querySelectorAll('.alerts-dlx-close').forEach(function (closeButton) {
    closeButton.addEventListener('click', function () {
      var alert = closeButton.closest('.alerts-dlx');
      if (!alert) {
        return;
      }

      // Add removal class.
      alert.classList.add('alerts-dlx-remove');

      // Remove alert after animation.
      alert.addEventListener('animationend', function () {
        alert.remove();
      });
      var cookieExpiration = parseInt(alert.getAttribute('data-expiration'), 10);

      // Session-only: no cookie when expiration is 0 or invalid.
      if (!cookieExpiration || 0 === cookieExpiration) {
        return;
      }
      var uniqueId = getAlertUniqueId(alert);
      if (!uniqueId) {
        return;
      }
      var _getCookieNames2 = getCookieNames(uniqueId),
        current = _getCookieNames2.current;
      setDismissCookie(current, 'dismissed', cookieExpiration);
    });
  });
};

/**
 * Initialize dismiss behavior.
 */
var init = function init() {
  hideDismissedAlerts();
  bindCloseButtons();
};
if ('loading' === document.readyState) {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
/******/ })()
;
//# sourceMappingURL=alerts-dlx-dismiss.js.map