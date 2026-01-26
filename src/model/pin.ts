import { sumArr } from "../util/helper";
import { Element, ElementKind } from "./element";
import { Connector, ConnectorType } from "./wire";

export class Pin extends Element {
    public state: boolean = false;
    public kind = ElementKind.PIN;
    constructor(
        public id: number,
        public type: ConnectorType,
        public position: number[],
        public index: number
    ) {
        super(id, type+'_'+index, position);
        if (this.type == ConnectorType.POWER) { this.state = true }
                if (this.type === ConnectorType.CLOCK) {
            window.setInterval(() => {
                this.state = !this.state;
            }, 500);
        }
    }
    getDimensions(): number[] {
        return [2, 2];
    }
    getConnectors(): Connector[] {
        return [
            new Connector(
                this.getConnectorType(0) === ConnectorType.OUTPUT ? sumArr(this.position, [2, 1]) : sumArr(this.position, [0, 1]),
                this.getConnectorType(0),
                this.id,
                0
            )
        ]
    }
    getConnectorType(index: number): ConnectorType {
        if (index !== 0) throw new Error("Invalid connector index");
        return (this.type == ConnectorType.INPUT || this.type == ConnectorType.POWER || this.type == ConnectorType.CLOCK) ? ConnectorType.OUTPUT : ConnectorType.INPUT;
    }
    getConnectorState(index: number): boolean {
        if (index !== 0) throw new Error("Invalid connector index");
        return this.state;
    }
    setConnectorState(index: number, state: boolean): void {
        if (index !== 0) throw new Error("Invalid connector index");
        if (this.type == ConnectorType.POWER || this.type == ConnectorType.GROUND) { throw new Error("PWR and GND have fixed states!"); }
        this.state = state;
    }
    toJSON() {
        return {
            kind: this.kind,
            id: this.id,
            type: this.type,
            position: this.position,
            index: this.index,
            state: this.state
        }
    }
    static fromJSON(json: Record<string, unknown>): Pin{
        const pin = new Pin(
            json.id as number, 
            json.type as ConnectorType, 
            json.position as number[], 
            json.index as number
        );
        pin.state = json.state as boolean;
        pin.kind = ElementKind.PIN;
        return pin;
    }
}