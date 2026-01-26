import { sumArr } from "../util/helper";
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
    public state: boolean[];
    public kind = ElementKind.GATE;
    constructor(
        public id: number,
        public type: GateType,
        public position: number[]
    ) {
        super(id, type, position);
        type === GateType.NOT ? this.state = [false] : this.state = [false, false];
    }
    getDimensions(): number[] {
        if (this.type === GateType.NOT) { return [2, 2]; }
        return [2, 4];
    }
    getConnectors(): Connector[] {
        if (this.type === GateType.NOT) {
            return [
                new Connector(
                    sumArr(this.position, [0, 1]),
                    ConnectorType.INPUT,
                    this.id,
                    0
                ),
                new Connector(
                    sumArr(this.position, [2, 1]),
                    ConnectorType.OUTPUT,
                    this.id,
                    1
                )
            ]
        }
        return [
            new Connector(
                sumArr(this.position, [0, 1]),
                ConnectorType.INPUT,
                this.id,
                0
            ),
            new Connector(
                sumArr(this.position, [0, 3]),
                ConnectorType.INPUT,
                this.id,
                1
            ),
            new Connector(
                sumArr(this.position, [2, 2]),
                ConnectorType.OUTPUT,
                this.id,
                2
            )
        ]
    }
    getConnectorType(index: number): ConnectorType {
        if (this.type === GateType.NOT) {
            if (index === 0) return ConnectorType.INPUT;
            if (index === 1) return ConnectorType.OUTPUT;
        } else {
            if (index === 0 || index === 1) return ConnectorType.INPUT;
            if (index === 2) return ConnectorType.OUTPUT;
        }
        throw new Error("Invalid connector index");
    }
    getConnectorState(index: number): boolean {
        if (this.type === GateType.NOT) {
            if (index !== 1) throw new Error("Invalid connector index");
            return !this.state[0];
        } else {
            if (index !== 2) throw new Error("Invalid connector index");
            switch (this.type) {
                case GateType.AND:
                    return this.state[0] && this.state[1];
                case GateType.OR:
                    return this.state[0] || this.state[1];
                case GateType.NAND:
                    return !(this.state[0] && this.state[1]);
                case GateType.NOR:
                    return !(this.state[0] || this.state[1]);
                case GateType.XOR:
                    return this.state[0] !== this.state[1];
                case GateType.XNOR:
                    return this.state[0] === this.state[1];
                default:
                    throw new Error("Invalid gate type");
            }
        }
    }
    setConnectorState(index: number, state: boolean): void {
        if (this.type === GateType.NOT) {
            if (index !== 0) throw new Error("Invalid connector index");
            this.state[0] = state;
        } else {
            if (index !== 0 && index !== 1) throw new Error("Invalid connector index");
            this.state[index] = state;
        }
    }
    toJSON() {
        return {
            kind: this.kind,
            id: this.id,
            type: this.type,
            position: this.position,
            state: this.state
        };
    };
    static fromJSON(json: Record<string, unknown>): Gate {
        const gate = new Gate(
            json.id as number, 
            json.type as GateType, 
            json.position as number[]
        );
        gate.state = json.state as boolean[];
        gate.kind = ElementKind.GATE;
        return gate;
    };
}