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
        return span("You're still missing a connect from... ONB7 to U4.\nYes, that's right.");
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
        return span("You can't set the fuel ratio yet.");
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
    var amt = 2 * Math.PI * (0.1 + exports.person.breath_angle) / exports.person.breath_modulo;
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
//# sourceMappingURL=start.js.map