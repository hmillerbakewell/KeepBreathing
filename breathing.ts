//import * as $ from "jquery";
export enum ANX { IMPENDING_DOOM, SHIELDS, OXYGEN, ENGINE, FUEL }

export class Person {
    paused: boolean = false

    anxiety: number = 0
    anxiety_max: number = 1000

    causes: [number, ANX][] = [[10, ANX.IMPENDING_DOOM]]
    time_scaling: number = 0.1
    tick: () => void = () => {
        if (!this.paused) {
            for (let ns of this.causes) {
                this.anxiety += ns[0] * this.time_scaling
                this.anxiety = Math.min(this.anxiety, this.anxiety_max)
            }
            this.breath_angle += this.time_scaling * (1 + 2 * this.anxiety / this.anxiety_max)
            this.breath_angle = this.breath_angle % this.breath_modulo
        }
    }

    breath_angle: number = 0
    breath_modulo: number = 10
    breath_targets: number[] = [0, 4, 6, 10]

    ship: Ship

    last_breath: number = 0

    breathe: () => number = () => {
        if (
            !this.paused
            &&
            (this.breath_angle - this.last_breath + this.breath_modulo) % this.breath_modulo > 0
        ) {
            this.last_breath = this.breath_angle
            let niceness = Math.pow(0.5, 2)
            let min_dist_squared =
                this.breath_targets.map(
                    x => Math.pow((x - this.breath_angle), 2)
                ).reduce(
                    function (x, acc) { return Math.min(x, acc) }
                    )
            min_dist_squared = Math.min(min_dist_squared, niceness) / niceness
            this.anxiety -= (1 - min_dist_squared) * 120
            this.anxiety += 30 // penalty for attempting?
            console.log(min_dist_squared)
            this.anxiety = Math.min(this.anxiety, this.anxiety_max)
            this.anxiety = Math.max(this.anxiety, 0)
            // Can happen ~ 3 times every ten seconds
            // 
            return min_dist_squared
        } else {
            return -1
        }
    }
    pause: () => void = () => {
        this.paused = true
    }
    resume: () => void = () => {
        this.paused = false
    }
    constructor() {
        this.ship = new Ship()
        window.setInterval(this.tick, this.time_scaling * 1000)
        this.breathe()
    }
}

export class Ship {
    fuel: boolean = false
    engines: boolean = false
    shields: boolean = false
    oxygen: boolean = false
}