/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
self["webpackHotUpdate_N_E"]("app/courses/page",{

/***/ "(app-pages-browser)/./lib/i18n/client.ts":
/*!****************************!*\
  !*** ./lib/i18n/client.ts ***!
  \****************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval(__webpack_require__.ts("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   useI18nStore: () => (/* binding */ useI18nStore)\n/* harmony export */ });\n/* harmony import */ var zustand__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! zustand */ \"(app-pages-browser)/./node_modules/.pnpm/zustand@5.0.8_@types+react@19.2.2_immer@10.1.3_react@19.2.0_use-sync-external-store@1.6.0_react@19.2.0_/node_modules/zustand/esm/react.mjs\");\n/* harmony import */ var zustand_middleware__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! zustand/middleware */ \"(app-pages-browser)/./node_modules/.pnpm/zustand@5.0.8_@types+react@19.2.2_immer@10.1.3_react@19.2.0_use-sync-external-store@1.6.0_react@19.2.0_/node_modules/zustand/esm/middleware.mjs\");\n/* harmony import */ var _config__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./config */ \"(app-pages-browser)/./lib/i18n/config.ts\");\n/* __next_internal_client_entry_do_not_use__ useI18nStore auto */ \n\n\n// Client-side i18n store (syncs with user preferences)\nconst useI18nStore = (0,zustand__WEBPACK_IMPORTED_MODULE_1__.create)()((0,zustand_middleware__WEBPACK_IMPORTED_MODULE_2__.persist)((set)=>({\n        locale: _config__WEBPACK_IMPORTED_MODULE_0__.defaultLocale,\n        setLocale: (locale)=>{\n            set({\n                locale\n            });\n            // Update HTML lang attribute\n            if (typeof document !== 'undefined') {\n                document.documentElement.lang = locale;\n            }\n        }\n    }), {\n    name: 'i18n-locale'\n}));\n\n\n;\n    // Wrapped in an IIFE to avoid polluting the global scope\n    ;\n    (function () {\n        var _a, _b;\n        // Legacy CSS implementations will `eval` browser code in a Node.js context\n        // to extract CSS. For backwards compatibility, we need to check we're in a\n        // browser context before continuing.\n        if (typeof self !== 'undefined' &&\n            // AMP / No-JS mode does not inject these helpers:\n            '$RefreshHelpers$' in self) {\n            // @ts-ignore __webpack_module__ is global\n            var currentExports = module.exports;\n            // @ts-ignore __webpack_module__ is global\n            var prevSignature = (_b = (_a = module.hot.data) === null || _a === void 0 ? void 0 : _a.prevSignature) !== null && _b !== void 0 ? _b : null;\n            // This cannot happen in MainTemplate because the exports mismatch between\n            // templating and execution.\n            self.$RefreshHelpers$.registerExportsForReactRefresh(currentExports, module.id);\n            // A module can be accepted automatically based on its exports, e.g. when\n            // it is a Refresh Boundary.\n            if (self.$RefreshHelpers$.isReactRefreshBoundary(currentExports)) {\n                // Save the previous exports signature on update so we can compare the boundary\n                // signatures. We avoid saving exports themselves since it causes memory leaks (https://github.com/vercel/next.js/pull/53797)\n                module.hot.dispose(function (data) {\n                    data.prevSignature =\n                        self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports);\n                });\n                // Unconditionally accept an update to this module, we'll check if it's\n                // still a Refresh Boundary later.\n                // @ts-ignore importMeta is replaced in the loader\n                module.hot.accept();\n                // This field is set when the previous version of this module was a\n                // Refresh Boundary, letting us know we need to check for invalidation or\n                // enqueue an update.\n                if (prevSignature !== null) {\n                    // A boundary can become ineligible if its exports are incompatible\n                    // with the previous exports.\n                    //\n                    // For example, if you add/remove/change exports, we'll want to\n                    // re-execute the importing modules, and force those components to\n                    // re-render. Similarly, if you convert a class component to a\n                    // function, we want to invalidate the boundary.\n                    if (self.$RefreshHelpers$.shouldInvalidateReactRefreshBoundary(prevSignature, self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports))) {\n                        module.hot.invalidate();\n                    }\n                    else {\n                        self.$RefreshHelpers$.scheduleUpdate();\n                    }\n                }\n            }\n            else {\n                // Since we just executed the code for the module, it's possible that the\n                // new exports made it ineligible for being a boundary.\n                // We only care about the case when we were _previously_ a boundary,\n                // because we already accepted this update (accidental side effect).\n                var isNoLongerABoundary = prevSignature !== null;\n                if (isNoLongerABoundary) {\n                    module.hot.invalidate();\n                }\n            }\n        }\n    })();\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKGFwcC1wYWdlcy1icm93c2VyKS8uL2xpYi9pMThuL2NsaWVudC50cyIsIm1hcHBpbmdzIjoiOzs7Ozs7O2tFQUVnQztBQUNZO0FBQ2tCO0FBTzlELHVEQUF1RDtBQUNoRCxNQUFNRyxlQUFlSCwrQ0FBTUEsR0FDaENDLDJEQUFPQSxDQUNMLENBQUNHLE1BQVM7UUFDUkMsUUFBUUgsa0RBQWFBO1FBQ3JCSSxXQUFXLENBQUNEO1lBQ1ZELElBQUk7Z0JBQUVDO1lBQU87WUFDYiw2QkFBNkI7WUFDN0IsSUFBSSxPQUFPRSxhQUFhLGFBQWE7Z0JBQ25DQSxTQUFTQyxlQUFlLENBQUNDLElBQUksR0FBR0o7WUFDbEM7UUFDRjtJQUNGLElBQ0E7SUFDRUssTUFBTTtBQUNSLElBRUgiLCJzb3VyY2VzIjpbIi9Vc2Vycy9iaXNvc2FkL0RBVE4vRnJvbnRlbmQtSUVMVFNHby9saWIvaTE4bi9jbGllbnQudHMiXSwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2UgY2xpZW50XCJcblxuaW1wb3J0IHsgY3JlYXRlIH0gZnJvbSAnenVzdGFuZCdcbmltcG9ydCB7IHBlcnNpc3QgfSBmcm9tICd6dXN0YW5kL21pZGRsZXdhcmUnXG5pbXBvcnQgeyBkZWZhdWx0TG9jYWxlLCBsb2NhbGVzLCB0eXBlIExvY2FsZSB9IGZyb20gJy4vY29uZmlnJ1xuXG5pbnRlcmZhY2UgSTE4blN0YXRlIHtcbiAgbG9jYWxlOiBMb2NhbGVcbiAgc2V0TG9jYWxlOiAobG9jYWxlOiBMb2NhbGUpID0+IHZvaWRcbn1cblxuLy8gQ2xpZW50LXNpZGUgaTE4biBzdG9yZSAoc3luY3Mgd2l0aCB1c2VyIHByZWZlcmVuY2VzKVxuZXhwb3J0IGNvbnN0IHVzZUkxOG5TdG9yZSA9IGNyZWF0ZTxJMThuU3RhdGU+KCkoXG4gIHBlcnNpc3QoXG4gICAgKHNldCkgPT4gKHtcbiAgICAgIGxvY2FsZTogZGVmYXVsdExvY2FsZSwgLy8gRGVmYXVsdCBsb2NhbGVcbiAgICAgIHNldExvY2FsZTogKGxvY2FsZTogTG9jYWxlKSA9PiB7XG4gICAgICAgIHNldCh7IGxvY2FsZSB9KVxuICAgICAgICAvLyBVcGRhdGUgSFRNTCBsYW5nIGF0dHJpYnV0ZVxuICAgICAgICBpZiAodHlwZW9mIGRvY3VtZW50ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5sYW5nID0gbG9jYWxlXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgfSksXG4gICAge1xuICAgICAgbmFtZTogJ2kxOG4tbG9jYWxlJyxcbiAgICB9XG4gIClcbilcblxuIl0sIm5hbWVzIjpbImNyZWF0ZSIsInBlcnNpc3QiLCJkZWZhdWx0TG9jYWxlIiwidXNlSTE4blN0b3JlIiwic2V0IiwibG9jYWxlIiwic2V0TG9jYWxlIiwiZG9jdW1lbnQiLCJkb2N1bWVudEVsZW1lbnQiLCJsYW5nIiwibmFtZSJdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(app-pages-browser)/./lib/i18n/client.ts\n"));

/***/ }),

/***/ "(app-pages-browser)/./messages lazy recursive ^\\.\\/.*\\.json$":
/*!********************************************************!*\
  !*** ./messages/ lazy ^\.\/.*\.json$ namespace object ***!
  \********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var map = {
	"./en.json": [
		"(app-pages-browser)/./messages/en.json",
		"_app-pages-browser_messages_en_json"
	],
	"./missing-vi.json": [
		"(app-pages-browser)/./messages/missing-vi.json",
		"_app-pages-browser_messages_missing-vi_json"
	],
	"./template.json": [
		"(app-pages-browser)/./messages/template.json",
		"_app-pages-browser_messages_template_json"
	],
	"./vi.json": [
		"(app-pages-browser)/./messages/vi.json",
		"_app-pages-browser_messages_vi_json"
	]
};
function webpackAsyncContext(req) {
	if(!__webpack_require__.o(map, req)) {
		return Promise.resolve().then(() => {
			var e = new Error("Cannot find module '" + req + "'");
			e.code = 'MODULE_NOT_FOUND';
			throw e;
		});
	}

	var ids = map[req], id = ids[0];
	return __webpack_require__.e(ids[1]).then(() => {
		return __webpack_require__.t(id, 3 | 16);
	});
}
webpackAsyncContext.keys = () => (Object.keys(map));
webpackAsyncContext.id = "(app-pages-browser)/./messages lazy recursive ^\\.\\/.*\\.json$";
module.exports = webpackAsyncContext;

/***/ })

});