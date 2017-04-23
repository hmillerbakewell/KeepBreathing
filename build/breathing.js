"use strict";
exports.__esModule = true;
var ANX;
(function (ANX) {
    ANX[ANX["IMPENDING_DOOM"] = 0] = "IMPENDING_DOOM";
    ANX[ANX["SHIELDS"] = 1] = "SHIELDS";
    ANX[ANX["OXYGEN"] = 2] = "OXYGEN";
    ANX[ANX["ENGINE"] = 3] = "ENGINE";
    ANX[ANX["FUEL"] = 4] = "FUEL";
})(ANX = exports.ANX || (exports.ANX = {}));
var Person = (function () {
    function Person() {
        var _this = this;
        this.paused = false;
        this.anxiety = 0;
        this.anxiety_max = 1000;
        this.causes = [[10, ANX.IMPENDING_DOOM]];
        this.time_scaling = 0.1;
        this.tick = function () {
            if (!_this.paused) {
                for (var _i = 0, _a = _this.causes; _i < _a.length; _i++) {
                    var ns = _a[_i];
                    _this.anxiety += ns[0] * _this.time_scaling;
                    _this.anxiety = Math.min(_this.anxiety, _this.anxiety_max);
                }
                _this.breath_angle += _this.time_scaling * (1 + 2 * _this.anxiety / _this.anxiety_max);
                _this.breath_angle = _this.breath_angle % _this.breath_modulo;
            }
        };
        this.breath_angle = 0;
        this.breath_modulo = 10;
        this.breath_targets = [0, 4, 6, 10];
        this.last_breath = 0;
        this.breathe = function () {
            if (!_this.paused
                &&
                    (_this.breath_angle - _this.last_breath + _this.breath_modulo) % _this.breath_modulo > 0) {
                _this.last_breath = _this.breath_angle;
                var niceness = Math.pow(0.5, 2);
                var min_dist_squared = _this.breath_targets.map(function (x) { return Math.pow((x - _this.breath_angle), 2); }).reduce(function (x, acc) { return Math.min(x, acc); });
                min_dist_squared = Math.min(min_dist_squared, niceness) / niceness;
                _this.anxiety -= (1 - min_dist_squared) * 120;
                _this.anxiety += 30;
                console.log(min_dist_squared);
                _this.anxiety = Math.min(_this.anxiety, _this.anxiety_max);
                _this.anxiety = Math.max(_this.anxiety, 0);
                return min_dist_squared;
            }
            else {
                return -1;
            }
        };
        this.pause = function () {
            _this.paused = true;
        };
        this.resume = function () {
            _this.paused = false;
        };
        this.ship = new Ship();
        window.setInterval(this.tick, this.time_scaling * 1000);
        this.breathe();
    }
    return Person;
}());
exports.Person = Person;
var Ship = (function () {
    function Ship() {
        this.fuel = false;
        this.engines = false;
        this.shields = false;
        this.oxygen = false;
    }
    return Ship;
}());
exports.Ship = Ship;
//# sourceMappingURL=breathing.js.map