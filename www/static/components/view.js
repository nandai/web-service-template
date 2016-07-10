/**
 * (C) 2016 printf.jp
 */
"use strict";
/**
 * View
 */
var View = (function () {
    /**
     * @constructor
     */
    function View() {
        var _this = this;
        this.init(false);
        var interval = Math.floor(1000 / 60 * 10);
        var resizeTimer = null;
        window.addEventListener('resize', function () {
            if (resizeTimer !== null)
                clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function () { return _this.init(true); }, interval);
        });
    }
    /**
     * 初期化
     *
     * @param   isResize    リサイズしたかどうか
     */
    View.prototype.init = function (isResize) {
    };
    return View;
}());
exports.__esModule = true;
exports["default"] = View;
