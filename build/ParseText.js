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
//# sourceMappingURL=ParseText.js.map