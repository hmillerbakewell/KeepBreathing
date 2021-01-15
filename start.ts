// Start the game!
import * as Breathing from "./breathing"
import * as Parser from "./ParseText"
import * as SVG from "svgjs"
export var person = new Breathing.Person()
$().ready(
    function () {
        $("#but_breathe").on("click", person.breathe)
        window.setInterval(function () { $("#str_breath").text(Math.round(person.breath_angle)) }, 200)
        window.setInterval(function () { $("#str_anxiety").text(Math.round(person.anxiety)) }, 200)
    })

declare var script: string

let scriptParser = new Parser.ScriptReader(script)
let lastRender = ""
let refreshText = function () {
    renderText(lastRender, false)
}

// Macros

let span = Parser.spanGeneric
let link = Parser.spanLink
let macros: { [index: string]: () => string } = {}
macros["fuel"] = () => {
    return span(person.ship.fuel ? "Fuel-lines in order." : "Fuel lines disconnected!")
}
macros["engines"] = () => {
    if (person.ship.engines) {
        return span("Engines firing correctly.")
    }
    return span("Engines on standby.")
}
macros["shields"] = () => {
    return span(person.ship.engines ? "Shields powered, but not online." : "No power to shields!")
}
macros["oxygen"] = () => {
    return span(person.ship.oxygen ? "Oxygen levels: Surplus." : "Oxygen levels: Life support only!")
}
macros["cockpit"] = () => {
    return span(`The outside view is a mess of static,
        but the warning screens are clearly visible.`)
}
macros["lifeSupportPress"] = () => {
    if (person.ship.fuel) {
        person.ship.oxygen = true
    }
    return ""
}
macros["lifeSupportPressWrong"] = () => {
    person.ship.oxygen = false
    return ""
}
macros["fuelRight"] = () => {
    person.ship.fuel = true
    return ""
}
macros["fuelWrong"] = () => {
    person.ship.fuel = false
    return ""
}
macros["fuelDescribe"] = () => {
    if (person.ship.fuel) {
        return span("You're sure that cable you chose was the right one.")
    } else {
        return span(`You're still missing a connection from... ONB7 to U4.
Yes, that's right.`)
    }
}
macros["detailedEngines"] = () => {
    if (!person.ship.engines) {
        if (person.ship.fuel) {
            if (person.ship.oxygen) {
                return span("Engines ready to engage!")
            } else {
                return span("Engines standing by, oxygen required for higher power.")
            }
        } else {
            return span("Please connect fuel before attempting to engage engines.")
        }
    } else {
        return span("The engines are meeting energy and power requirements.")
    }
}
macros["enginesBlock"] = () => {
    if (person.ship.fuel && person.ship.oxygen) {
        return link(".link ratio Set the fuel ratio")
    } else {
        return span("You can't set the fuel ratio until you have the fuel and oxygen connected.")
    }
}
macros["enginesRight"] = () => {
    person.ship.engines = true
    return span("You think this is the right ratio, but you could be wrong.")
}
macros["enginesWrong"] = () => {
    person.ship.engines = false
    return span("You think this is the right ratio, but you could be wrong.")
}
macros["shieldsDetailed"] = () => {
    if (person.ship.engines) {
        return link(".link success Power the shields!")
    } else {
        return span("You don't have enough power to run the shields!")
    }
}
macros["links"] = () => {
    return `
the <a href="https://github.com/hmillerbakewell/KeepBreathing">github page.</a>
`
}

let renderText = function (label: string, triggerActions: boolean = true) {
    lastRender = label
    let text = scriptParser.getText(label, Parser.spanLink, person, macros, triggerActions)
    text = "<p>" + text + "</p>"
    $("#str_script").html(text)
    $("#str_script span").each(function (index, ele) {
        $(ele).text(garbleText($(ele).text(), person.anxiety / person.anxiety_max))
        if ($(ele).attr("link")) {
            $(ele).addClass("scriptLink").on("click", function (e) {
                renderText($(ele).attr("link"))
            })
        }
    })
}
$().ready(function () {
    renderText("Start")
    window.setInterval(refreshText, 2000)
})

let garbleText = function (input: string, factor: number) {
    let replaceAt = function (str: string, index: number, replacement: string) {
        return str.substr(0, index) + replacement + str.substr(index + replacement.length);
    }
    let charShift = function (character: string, factor: number) {
        if (character == " ") {
            return character
        }
        let asciiStart = character.charCodeAt(0)
        let asciiEnd = Math.floor(asciiStart + 10 * random_bm() * factor)
        if (asciiEnd > 126) {
            asciiEnd -= (126 - 33)
        }
        if (asciiEnd < 33) {
            asciiEnd += (126 - 33)
        }
        return String.fromCharCode(asciiEnd)
    }

    // https://stackoverflow.com/questions/25582882/javascript-math-random-normal-distribution-gaussian-bell-curve
    // Standard Normal variate using Box-Muller transform.
    function random_bm() {
        var u = 1 - Math.random(); // Subtraction to flip [0, 1) to (0, 1].
        var v = 1 - Math.random();
        return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    }

    let s = input
    for (let char = 0; char < s.length; char++) {
        if (Math.random() < Math.pow(factor, 2)) {
            s = replaceAt(s, char, charShift(s[char], factor))
        }
    }
    return s
}
let svg: SVG.Container
let breathMarker: SVG.Circle
$().ready(function () {
    svg = SVG("div_svg").size(300, 300).viewbox(-1.5, -1.5, 3, 3)
    let a1 = svg.circle(2).fill("black").cx(0).cy(0)
    let a2 = svg.circle(1.9).fill("white").cx(0).cy(0)
    for (let point of person.breath_targets) {
        let t = svg.circle(0.1).id("target" + point)
        let amt = 2 * Math.PI * point / person.breath_modulo
        t.cx(Math.cos(amt))
        t.cy(Math.sin(amt))
    }
    breathMarker = svg.circle(0.2).id("breathMarker").cx(Math.cos(0)).cy(Math.sin(0))
    window.setInterval(renderBreathing, 100)
    $("#div_svg").on("click", breathClick)
    //window.setInterval(breathClick, 1000)

})
function breathClick() {
    console.log("Clicked")
    let accuracy = person.breathe()
    if (accuracy >= 0) {
        // -1 is total fail
        // 0 is perfect
        let rgb = hslToRgb((1 - accuracy) * 0.3, 0.8, 0.5)
        let fill_colour = new SVG.Color({ r: rgb[0], g: rgb[1], b: rgb[2]}).toHex()
        let amt = 2 * Math.PI * person.breath_angle / person.breath_modulo
        // let evidence = svg.circle(0.1).fill(fill_colour).cx(breathMarker.cx()).cy(breathMarker.cy())
        let evidence = svg.circle(0.1).fill(fill_colour).cx(Math.cos(amt)).cy(Math.sin(amt))
        evidence.animate({ ease: '<', delay: 0.5 })
            .attr("fill-opacity", 0)
            .after(function () { evidence.remove() })
    }
}
function renderBreathing() {
    // THE MARKER NEEDS TO ALWAYS BE A LITTLE AHEAD
    let amt = 2 * Math.PI * (0.1 * person.speed() + person.breath_angle) / person.breath_modulo
    breathMarker.stop(true, true)
    breathMarker.animate(100).cx(Math.cos(amt)).cy(Math.sin(amt))
}

// https://stackoverflow.com/questions/2353211/hsl-to-rgb-color-conversion
/**
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   {number}  h       The hue
 * @param   {number}  s       The saturation
 * @param   {number}  l       The lightness
 * @return  {Array}           The RGB representation
 */
function hslToRgb(h, s, l) {
    var r, g, b;

    if (s == 0) {
        r = g = b = l; // achromatic
    } else {
        var hue2rgb = function hue2rgb(p, q, t) {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}