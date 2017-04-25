(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
exports.__esModule = true;
exports.Reg = {
    LabelStart: /^\.label (\w+)/i,
    LabelEnd: /^\.end$/i,
    Link: /\.link (\w+) (.*)$/i,
    Action: /^\.action (.*)$/i,
    Macro: /^\.macro (.*)$/i,
    Jump: /^\.jump (.*)$/i
};
var ScriptReader = (function () {
    function ScriptReader(script) {
        var _this = this;
        this.script = script;
        this.pointer = 0;
        this.getLineNumbers = function () {
            _this.labels = {};
            _this.splitScript = _this.script.split("\n");
            for (var lineNumber = 0; lineNumber < _this.splitScript.length; lineNumber++) {
                var line = _this.splitScript[lineNumber];
                if (exports.Reg.LabelStart.test(line)) {
                    var label = exports.Reg.LabelStart.exec(line)[1];
                    _this.labels[label] = lineNumber;
                }
            }
        };
        this.getLineNumbers();
    }
    ScriptReader.prototype.jumpTo = function (label) {
        this.pointer = this.labels[label];
    };
    ScriptReader.prototype.getText = function (label, linkParser, context, macros, triggerActions) {
        if (macros === void 0) { macros = {}; }
        if (triggerActions === void 0) { triggerActions = true; }
        this.jumpTo(label);
        var running = true;
        var counter = 0;
        var str_acc = "";
        var c = context;
        while (running && counter < 1000) {
            counter++;
            this.pointer++;
            var line = this.splitScript[this.pointer];
            if (exports.Reg.LabelEnd.test(line)) {
                running = false;
            }
            else {
                if (exports.Reg.LabelStart.test(line)) {
                }
                else if (exports.Reg.Link.test(line)) {
                    str_acc += linkParser(line);
                }
                else if (exports.Reg.Action.test(line)) {
                    if (triggerActions) {
                        var matches = exports.Reg.Action.exec(line);
                        eval(matches[1]);
                    }
                }
                else if (exports.Reg.Macro.test(line)) {
                    var matches = exports.Reg.Macro.exec(line);
                    str_acc += macros[matches[1]]();
                }
                else if (exports.Reg.Jump.test(line)) {
                    var matches = exports.Reg.Jump.exec(line);
                    this.pointer = this.labels[matches[1]];
                }
                else {
                    line = line.trim();
                    if (line.length == 0) {
                        line = "</p><p>";
                    }
                    else {
                        line = exports.spanGeneric(line);
                    }
                    str_acc += line;
                }
            }
        }
        return str_acc;
    };
    return ScriptReader;
}());
exports.ScriptReader = ScriptReader;
exports.spanGeneric = function (line) {
    return " <span>" + line + "</span> ";
};
exports.spanLink = function (line) {
    var matches = exports.Reg.Link.exec(line);
    return "<span link=\"" + matches[1] + "\">" + matches[2] + "</span>";
};

},{}],2:[function(require,module,exports){
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
        this.causes = [];
        this.time_scaling = 0.1;
        this.tick = function () {
            if (!_this.paused) {
                for (var _i = 0, _a = _this.causes; _i < _a.length; _i++) {
                    var ns = _a[_i];
                    _this.anxiety += ns[0] * _this.time_scaling;
                    _this.anxiety = Math.min(_this.anxiety, _this.anxiety_max);
                }
                _this.breath_angle += _this.time_scaling * _this.speed();
                _this.breath_angle = _this.breath_angle % _this.breath_modulo;
            }
        };
        this.breath_angle = 0;
        this.breath_modulo = 10;
        this.breath_targets = [0, 4, 6, 10];
        this.last_breath = 8;
        this.breathe = function () {
            if (!_this.paused
                &&
                    (_this.breath_angle - _this.last_breath + _this.breath_modulo) % _this.breath_modulo > 1) {
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
    Person.prototype.speed = function () {
        return (1 + 2 * this.anxiety / this.anxiety_max);
    };
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

},{}],3:[function(require,module,exports){
"use strict";
exports.__esModule = true;
var Breathing = require("./breathing");
var Parser = require("./ParseText");
//var SVG = require("svgjs");
exports.person = new Breathing.Person();
$().ready(function () {
    $("#but_breathe").on("click", exports.person.breathe);
    window.setInterval(function () { $("#str_breath").text(Math.round(exports.person.breath_angle)); }, 200);
    window.setInterval(function () { $("#str_anxiety").text(Math.round(exports.person.anxiety)); }, 200);
});
var scriptParser = new Parser.ScriptReader(script);
var lastRender = "";
var refreshText = function () {
    renderText(lastRender, false);
};
var span = Parser.spanGeneric;
var link = Parser.spanLink;
var macros = {};
macros["fuel"] = function () {
    return span(exports.person.ship.fuel ? "Fuel-lines in order." : "Fuel lines disconnected!");
};
macros["engines"] = function () {
    if (exports.person.ship.engines) {
        return span("Engines firing correctly.");
    }
    return span("Engines on standby.");
};
macros["shields"] = function () {
    return span(exports.person.ship.engines ? "Shields powered, but not online." : "No power to shields!");
};
macros["oxygen"] = function () {
    return span(exports.person.ship.oxygen ? "Oxygen levels: Surplus." : "Oxygen levels: Life support only!");
};
macros["cockpit"] = function () {
    return span("The outside view is a mess of static,\n        but the warning screens are clearly visible.");
};
macros["lifeSupportPress"] = function () {
    if (exports.person.ship.fuel) {
        exports.person.ship.oxygen = true;
    }
    return "";
};
macros["lifeSupportPressWrong"] = function () {
    exports.person.ship.oxygen = false;
    return "";
};
macros["fuelRight"] = function () {
    exports.person.ship.fuel = true;
    return "";
};
macros["fuelWrong"] = function () {
    exports.person.ship.fuel = false;
    return "";
};
macros["fuelDescribe"] = function () {
    if (exports.person.ship.fuel) {
        return span("You're sure that cable you chose was the right one.");
    }
    else {
        return span("You're still missing a connection from... ONB7 to U4.\nYes, that's right.");
    }
};
macros["detailedEngines"] = function () {
    if (!exports.person.ship.engines) {
        if (exports.person.ship.fuel) {
            if (exports.person.ship.oxygen) {
                return span("Engines ready to engage!");
            }
            else {
                return span("Engines standing by, oxygen required for higher power.");
            }
        }
        else {
            return span("Please connect fuel before attempting to engage engines.");
        }
    }
    else {
        return span("The engines are meeting energy and power requirements.");
    }
};
macros["enginesBlock"] = function () {
    if (exports.person.ship.fuel && exports.person.ship.oxygen) {
        return link(".link ratio Set the fuel ratio");
    }
    else {
        return span("You can't set the fuel ratio until you have the fuel connected.");
    }
};
macros["enginesRight"] = function () {
    exports.person.ship.engines = true;
    return span("You think this is the right ratio, but you could be wrong.");
};
macros["enginesWrong"] = function () {
    exports.person.ship.engines = false;
    return span("You think this is the right ratio, but you could be wrong.");
};
macros["shieldsDetailed"] = function () {
    if (exports.person.ship.engines) {
        return link(".link success Power the shields!");
    }
    else {
        return span("You don't have enough power to run the shields!");
    }
};
macros["links"] = function () {
    return "\n<a href=\"https://sometimesmyhandswork.tumblr.com/\">my tumblr</a>\nor the <a href=\"https://github.com/hmillerbakewell/KeepBreathing\">github page.</a>\n";
};
var renderText = function (label, triggerActions) {
    if (triggerActions === void 0) { triggerActions = true; }
    lastRender = label;
    var text = scriptParser.getText(label, Parser.spanLink, exports.person, macros, triggerActions);
    text = "<p>" + text + "</p>";
    $("#str_script").html(text);
    $("#str_script span").each(function (index, ele) {
        $(ele).text(garbleText($(ele).text(), exports.person.anxiety / exports.person.anxiety_max));
        if ($(ele).attr("link")) {
            $(ele).addClass("scriptLink").on("click", function (e) {
                renderText($(ele).attr("link"));
            });
        }
    });
};
$().ready(function () {
    renderText("Start");
    window.setInterval(refreshText, 2000);
});
var garbleText = function (input, factor) {
    var replaceAt = function (str, index, replacement) {
        return str.substr(0, index) + replacement + str.substr(index + replacement.length);
    };
    var charShift = function (character, factor) {
        if (character == " ") {
            return character;
        }
        var asciiStart = character.charCodeAt(0);
        var asciiEnd = Math.floor(asciiStart + 10 * random_bm() * factor);
        if (asciiEnd > 126) {
            asciiEnd -= (126 - 33);
        }
        if (asciiEnd < 33) {
            asciiEnd += (126 - 33);
        }
        return String.fromCharCode(asciiEnd);
    };
    function random_bm() {
        var u = 1 - Math.random();
        var v = 1 - Math.random();
        return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    }
    var s = input;
    for (var char = 0; char < s.length; char++) {
        if (Math.random() < Math.pow(factor, 2)) {
            s = replaceAt(s, char, charShift(s[char], factor));
        }
    }
    return s;
};
var svg;
var breathMarker;
$().ready(function () {
    svg = SVG("div_svg").size(300, 300).viewbox(-1.5, -1.5, 3, 3);
    var a1 = svg.circle(2).fill("black").cx(0).cy(0);
    var a2 = svg.circle(1.9).fill("white").cx(0).cy(0);
    for (var _i = 0, _a = exports.person.breath_targets; _i < _a.length; _i++) {
        var point = _a[_i];
        var t = svg.circle(0.1).id("target" + point);
        var amt = 2 * Math.PI * point / exports.person.breath_modulo;
        t.cx(Math.cos(amt));
        t.cy(Math.sin(amt));
    }
    breathMarker = svg.circle(0.2).id("breathMarker").cx(Math.cos(0)).cy(Math.sin(0));
    window.setInterval(renderBreathing, 100);
    $("#div_svg").on("click", breathClick);
});
function breathClick() {
    console.log("Clicked");
    var accuracy = exports.person.breathe();
    if (accuracy >= 0) {
        var rgb = hslToRgb((1 - accuracy) * 0.3, 0.8, 0.5);
        var fill_colour = { r: rgb[0], g: rgb[1], b: rgb[2] };
        var amt = 2 * Math.PI * exports.person.breath_angle / exports.person.breath_modulo;
        var evidence_1 = svg.circle(0.1).fill(fill_colour).cx(Math.cos(amt)).cy(Math.sin(amt));
        evidence_1.animate({ ease: '<', delay: 0.5 })
            .attr("fill-opacity", 0)
            .after(function () { evidence_1.remove(); });
    }
}
function renderBreathing() {
    var amt = 2 * Math.PI * (0.1 * exports.person.speed() + exports.person.breath_angle) / exports.person.breath_modulo;
    breathMarker.stop(true, true);
    breathMarker.animate(100).cx(Math.cos(amt)).cy(Math.sin(amt));
}
function hslToRgb(h, s, l) {
    var r, g, b;
    if (s == 0) {
        r = g = b = l;
    }
    else {
        var hue2rgb = function hue2rgb(p, q, t) {
            if (t < 0)
                t += 1;
            if (t > 1)
                t -= 1;
            if (t < 1 / 6)
                return p + (q - p) * 6 * t;
            if (t < 1 / 2)
                return q;
            if (t < 2 / 3)
                return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };
        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

},{"./ParseText":1,"./breathing":2}]},{},[3]);
