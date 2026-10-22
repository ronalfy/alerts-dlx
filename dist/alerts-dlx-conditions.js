/******/ (() => { // webpackBootstrap
/*!************************************!*\
  !*** ./src/js/conditions/index.js ***!
  \************************************/
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
/**
 * Client-side display conditions for AlertsDLX alerts.
 *
 * Evaluates start/end dates, days of week, URL parameters, and user login/role
 * requirements after the page loads so conditions work under full-page caching.
 */

/**
 * Cached user state promise so multiple alerts share one request.
 */
var userStatePromise = null;

/**
 * Fetch the current user's login state and roles from the REST API.
 *
 * @return {Promise<{isLoggedIn: boolean, roles: string[]}>}
 */
var fetchUserState = function fetchUserState() {
  if (userStatePromise) {
    return userStatePromise;
  }
  userStatePromise = fetch('/wp-json/dlxplugins/alerts-dlx/v1/user-state', {
    method: 'GET',
    credentials: 'same-origin',
    headers: {
      'Accept': 'application/json'
    }
  }).then(function (response) {
    if (!response.ok) {
      return {
        isLoggedIn: false,
        roles: []
      };
    }
    return response.json();
  })["catch"](function () {
    return {
      isLoggedIn: false,
      roles: []
    };
  });
  return userStatePromise;
};

/**
 * Check whether the current date/time satisfies the alert's date and day rules.
 *
 * @param {HTMLElement} alert Alert container element.
 * @return {boolean} Whether the alert should be kept.
 */
var passesDateConditions = function passesDateConditions(alert) {
  var now = new Date();
  var start = alert.dataset.startDate;
  var end = alert.dataset.endDate;
  var days = alert.dataset.daysOfWeek;
  if (start) {
    var startDate = new Date(start);
    if (now < startDate) {
      return false;
    }
  }
  if (end) {
    var endDate = new Date(end);
    if (now > endDate) {
      return false;
    }
  }
  if (days) {
    var allowed = days.split(',').map(function (d) {
      return parseInt(d.trim(), 10);
    });
    if (!allowed.includes(now.getDay())) {
      return false;
    }
  }
  return true;
};

/**
 * Check whether the current URL satisfies the alert's parameter rules.
 *
 * @param {HTMLElement} alert Alert container element.
 * @return {boolean} Whether the alert should be kept.
 */
var passesUrlParamCondition = function passesUrlParamCondition(alert) {
  var params;
  try {
    params = JSON.parse(alert.dataset.urlParams || '[]');
  } catch (_unused) {
    return true;
  }
  if (!Array.isArray(params) || params.length === 0) {
    return true;
  }
  var searchParams = new URLSearchParams(window.location.search);
  return params.every(function (param) {
    var current = searchParams.get(param.key);
    if (param.value === '' || param.value === undefined) {
      return searchParams.has(param.key);
    }
    return current === param.value;
  });
};

/**
 * Check whether the current user satisfies the alert's login/role rules.
 *
 * @param {HTMLElement}  alert     Alert container element.
 * @param {Object}       userState Resolved user state.
 * @return {boolean} Whether the alert should be kept.
 */
var passesUserConditions = function passesUserConditions(alert, userState) {
  var requireLogin = alert.dataset.requireLogin === 'true';
  var requiredRoles = alert.dataset.requiredRoles;
  if (!requireLogin) {
    return true;
  }
  if (!userState.isLoggedIn) {
    return false;
  }
  if (!requiredRoles) {
    return true;
  }
  var allowedRoles = requiredRoles.split(',').map(function (r) {
    return r.trim();
  });
  return allowedRoles.some(function (role) {
    return userState.roles.includes(role);
  });
};

/**
 * Evaluate all display conditions for every conditioned alert on the page.
 */
var evaluateDisplayConditions = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee() {
    var alerts, hasUserConditions, userState, passingIds, response, items, _t, _t2;
    return _regenerator().w(function (_context) {
      while (1) switch (_context.p = _context.n) {
        case 0:
          alerts = document.querySelectorAll('.alerts-dlx[data-conditions-enabled="true"]');
          if (!(alerts.length === 0)) {
            _context.n = 1;
            break;
          }
          return _context.a(2);
        case 1:
          hasUserConditions = Array.from(alerts).some(function (alert) {
            return alert.dataset.requireLogin === 'true' || alert.dataset.requiredRoles;
          });
          if (!hasUserConditions) {
            _context.n = 3;
            break;
          }
          _context.n = 2;
          return fetchUserState();
        case 2:
          _t = _context.v;
          _context.n = 4;
          break;
        case 3:
          _t = {
            isLoggedIn: false,
            roles: []
          };
        case 4:
          userState = _t;
          passingIds = [];
          alerts.forEach(function (alert) {
            if (!passesDateConditions(alert)) {
              alert.remove();
              return;
            }
            if (!passesUrlParamCondition(alert)) {
              alert.remove();
              return;
            }
            if (!passesUserConditions(alert, userState)) {
              alert.remove();
              return;
            }
            passingIds.push(alert.dataset.uniqueId);
          });
          if (!(passingIds.length === 0)) {
            _context.n = 5;
            break;
          }
          return _context.a(2);
        case 5:
          _context.p = 5;
          _context.n = 6;
          return fetch('/wp-json/dlxplugins/alerts-dlx/v1/alert-contents', {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({
              ids: passingIds
            })
          });
        case 6:
          response = _context.v;
          if (response.ok) {
            _context.n = 7;
            break;
          }
          throw new Error('Fetch failed');
        case 7:
          _context.n = 8;
          return response.json();
        case 8:
          items = _context.v;
          items.forEach(function (item) {
            var placeholder = document.querySelector(".alerts-dlx[data-conditions-enabled=\"true\"][data-unique-id=\"".concat(item.id, "\"]"));
            if (!placeholder || !item.html) {
              placeholder === null || placeholder === void 0 || placeholder.remove();
              return;
            }
            placeholder.outerHTML = item.html;
            var inserted = document.querySelector(".alerts-dlx[data-unique-id=\"".concat(item.id, "\"]"));
            if (inserted) {
              inserted.classList.add('alerts-dlx-conditional-show');
              void inserted.offsetHeight; // force reflow
              requestAnimationFrame(function () {
                inserted.classList.add('is-visible');
              });
              document.dispatchEvent(new CustomEvent('alertsDlxAlertInserted'));
            }
          });
          _context.n = 10;
          break;
        case 9:
          _context.p = 9;
          _t2 = _context.v;
          passingIds.forEach(function (id) {
            var _document$querySelect;
            (_document$querySelect = document.querySelector(".alerts-dlx[data-conditions-enabled=\"true\"][data-unique-id=\"".concat(id, "\"]"))) === null || _document$querySelect === void 0 || _document$querySelect.remove();
          });
        case 10:
          return _context.a(2);
      }
    }, _callee, null, [[5, 9]]);
  }));
  return function evaluateDisplayConditions() {
    return _ref.apply(this, arguments);
  };
}();

/**
 * Initialize display conditions.
 */
var init = function init() {
  evaluateDisplayConditions();
};
if ('loading' === document.readyState) {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
/******/ })()
;
//# sourceMappingURL=alerts-dlx-conditions.js.map