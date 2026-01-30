import { sumArr } from "../../util/helper";
import { Element, ElementKind } from "./element";
import { Connector, ConnectorType } from "./wire";

export enum GateType {
    AND = "AND",
    OR = "OR",
    NOT = "NOT",
    NAND = "NAND",
    NOR = "NOR",
    XOR = "XOR",
    XNOR = "XNOR",
}

export class Gate extends Element {
    public inputs: boolean[] = [];
    public output: boolean = false;
    public kind = ElementKind.GATE;

    constructor(
        public id: number,
        public type: GateType,
        public position: number[]
    ) {
        super(id, type, position);
        this.inputs = this.type === GateType.NOT ? [false] : [false, false];
        this.computeOutput();
    }

    computeOutput(): void {
        if (this.type === GateType.NOT) {
            this.output = !this.inputs[0];
            return;
        }

        const a = this.inputs[0];
        const b = this.inputs[1];

        switch (this.type) {
            case GateType.AND: this.output = a && b; break;
            case GateType.OR: this.output = a || b; break;
            case GateType.NAND: this.output = !(a && b); break;
            case GateType.NOR: this.output = !(a || b); break;
            case GateType.XOR: this.output = a !== b; break;
            case GateType.XNOR: this.output = a === b; break;
            default: throw new Error("Invalid gate type");
        }
    }

    getDimensions(): number[] {
        return this.type === GateType.NOT ? [2, 2] : [2, 4];
    }

    getConnectors(): Connector[] {
        if (this.type === GateType.NOT) {
            return [
                new Connector(sumArr(this.position, [0, 1]), ConnectorType.INPUT, this.id, 0),
                new Connector(sumArr(this.position, [2, 1]), ConnectorType.OUTPUT, this.id, 1),
            ];
        }
        return [
            new Connector(sumArr(this.position, [0, 1]), ConnectorType.INPUT, this.id, 0),
            new Connector(sumArr(this.position, [0, 3]), ConnectorType.INPUT, this.id, 1),
            new Connector(sumArr(this.position, [2, 2]), ConnectorType.OUTPUT, this.id, 2),
        ];
    }

    getConnectorType(index: number): ConnectorType {
        if (this.type === GateType.NOT) return index === 0 ? ConnectorType.INPUT : ConnectorType.OUTPUT;
        if (index === 0 || index === 1) return ConnectorType.INPUT;
        if (index === 2) return ConnectorType.OUTPUT;
        throw new Error("Invalid connector index");
    }

    getConnectorState(index: number): boolean {
        if (this.type === GateType.NOT) {
            if (index !== 1) throw new Error("Invalid connector index");
            return this.output;
        }
        if (index !== 2) throw new Error("Invalid connector index");
        return this.output;
    }

    setConnectorState(index: number, state: boolean): void {
        if (this.type === GateType.NOT) {
            if (index !== 0) throw new Error("Invalid connector index");
            this.inputs[0] = state;
        } else {
            if (index !== 0 && index !== 1) throw new Error("Invalid connector index");
            this.inputs[index] = state;
        }
        this.computeOutput(); // recompute output immediately after inputs change
    }

    toJSON(): Record<string, unknown> {
        return {
            kind: this.kind,
            id: this.id,
            type: this.type,
            position: this.position,
            inputs: this.inputs,
            output: this.output,
        };
    }

    static fromJSON(json: Record<string, unknown>): Gate {
        const gate = new Gate(json.id as number, json.type as GateType, json.position as number[]);
        gate.inputs = json.inputs as boolean[];
        gate.output = json.output as boolean;
        gate.kind = ElementKind.GATE;
        return gate;
    }
}
