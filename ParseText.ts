export let Reg = {
    LabelStart: /^\.label (\w+)/i,
    LabelEnd: /^\.end$/i,
    Link: /\.link (\w+) (.*)$/i,
    Action: /^\.action (.*)$/i,
    Macro: /^\.macro (.*)$/i,
    Jump: /^\.jump (.*)$/i
}

export class ScriptReader {
    pointer: number = 0
    labels: { [label: string]: number }
    constructor(public script: string) {
        this.getLineNumbers()
    }
    splitScript: string[]
    private getLineNumbers: () => void = () => {
        this.labels = {}
        this.splitScript = this.script.split("\n")
        for (let lineNumber = 0; lineNumber < this.splitScript.length; lineNumber++) {
            let line = this.splitScript[lineNumber]
            if (Reg.LabelStart.test(line)) {
                let label = Reg.LabelStart.exec(line)[1]
                this.labels[label] = lineNumber
            }
        }
    }
    private jumpTo(label: string) {
        this.pointer = this.labels[label]
    }

    public getText(label: string,
        linkParser: LineParser,
        context: any,
        macros: { [name: string]: () => string } = {},
        triggerActions: boolean = true) {
        this.jumpTo(label)
        let running = true
        let counter = 0
        let str_acc = ""
        var c = context
        while (running && counter < 1000) {
            counter++
            this.pointer++
            let line = this.splitScript[this.pointer]
            if (Reg.LabelEnd.test(line)) {
                // Is the end of the block
                running = false
            } else {
                if (Reg.LabelStart.test(line)) {
                    // Do nothing, label marker
                } else if (Reg.Link.test(line)) {
                    str_acc += linkParser(line)
                } else if (Reg.Action.test(line)) {
                    if (triggerActions) {
                        let matches = Reg.Action.exec(line)
                        eval(matches[1])
                    }
                } else if (Reg.Macro.test(line)) {
                    let matches = Reg.Macro.exec(line)
                    str_acc += macros[matches[1]]()
                } else if (Reg.Jump.test(line)) {
                    let matches = Reg.Jump.exec(line)
                    this.pointer = this.labels[matches[1]]
                } else {
                    line = line.trim()
                    if (line.length == 0) {
                        line = "</p><p>"
                    } else {
                        line = spanGeneric(line)
                    }
                    str_acc += line
                }

            }
        }
        return str_acc
    }
}

export let spanGeneric = (line: string) => {
    return " <span>" + line + "</span> "
}
export let spanLink = (line: string) => {
    let matches = Reg.Link.exec(line)
    return `<span link="${matches[1]}">${matches[2]}</span>`
}

export type LineParser = (input: string) => string
