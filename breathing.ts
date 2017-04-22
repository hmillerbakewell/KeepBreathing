//import * as $ from "jquery";
export enum ANX { IMPENDING_DOOM, SHIELDS, OXYGEN, ENGINE, FUEL }

export class Breath {
    paused: boolean = false
    anxiety: number = 0
    causes: [number, ANX][] = []
    time_scaling: number = 0.1
    tick: () => void = () => {
        if (!this.paused) {
            for (let ns of this.causes) {
                this.anxiety += ns[0] * this.time_scaling
            }
            let k = this.spring_strength
            let x = this.breath_value
            let t = this.spring_target
            let c = this.breath_viscosity
            let v = this.breath_velocity
            this.breath_velocity += (k * (t - x) - c * v) * this.time_scaling
            this.breath_value += this.breath_velocity * this.time_scaling
        }
    }
    breath_value: number = 0
    breath_velocity: number = 0
    breath_viscosity: number = 0
    breath_target: number = 0
    spring_target: number = 0.75
    spring_strength: number = 1
    breathe = function () {
        if (!this.paused) {
            let niceness = 0.05
            let failure_amt = Math.pow(this.breath_value - this.breath_target, 2)
            this.anxiety += (failure_amt - niceness)
            this.breath_target = 1 - this.breath_target //Flip 0 <-> 1
            this.spring_target = 0.5 * (this.breath_target + 0.5)
        }
    }
    pause: () => void = () => {
        this.paused = true
    }
    resume: () => void = () => {
        this.paused = false
    }
    constructor() {
        window.setInterval(this.tick, this.time_scaling * 1000)
        this.breathe()
    }
}

export class Chart {
    held_values: number[] = []
    holder: string
    max_length: number = 10
    update: (n: number) => void = (n: number) => {
        if (this.held_values.length > this.max_length) {
            this.held_values.shift()
        }
        this.held_values.push(n)

    }
    render: () => void = () => {
        let str_form = this.held_values.map(x => Math.round(x*10)/10).join(" ")
        $(this.holder).text(str_form)
    }
}

export function chartBreath(c: Chart, b: Breath) {
    c.update(b.breath_value)
    c.render()
}