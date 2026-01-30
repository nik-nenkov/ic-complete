import { sumArr } from "../../util/helper";
import { Element, ElementKind } from "./element";
import { Connector, ConnectorType } from "./wire";

export class Pin extends Element {
    public state: boolean = false; // physical pin state
    public output: boolean = false; // Element output for propagation
    public inputs: boolean[] = []; // Pins don’t really use inputs
    public kind = ElementKind.PIN;

    constructor(
        public id: number,
        public type: ConnectorType,
        public position: number[],
        public index: number
    ) {
        super(id, type + "_" + index, position);

        // Fixed power pin state
        if (this.type === ConnectorType.POWER) this.state = true;
        if (this.type === ConnectorType.POWER || this.type === ConnectorType.GROUND)
            this.output = this.state;

        // CLOCK pins toggle state
        if (this.type === ConnectorType.CLOCK) {
            this.state = false;
            this.output = false;
            window.setInterval(() => {
                this.state = !this.state;
                this.output = this.state;
            }, 500);
        }
    }

    computeOutput(): void {
        // For normal pins, output = state
        this.output = this.state;
    }

    getDimensions(): number[] {
        return [2, 2];
    }

    getConnectors(): Connector[] {
        return [
            new Connector(
                this.getConnectorType(0) === ConnectorType.OUTPUT
                    ? sumArr(this.position, [2, 1])
                    : sumArr(this.position, [0, 1]),
                this.getConnectorType(0),
                this.id,
                0
            )
        ];
    }

    getConnectorType(index: number): ConnectorType {
        if (index !== 0) throw new Error("Invalid connector index");
        // Input pins still act as outputs to the IC wiring system
        return this.type === ConnectorType.INPUT || this.type === ConnectorType.POWER || this.type === ConnectorType.CLOCK
            ? ConnectorType.OUTPUT
            : ConnectorType.INPUT;
    }

    getConnectorState(index: number): boolean {
        if (index !== 0) throw new Error("Invalid connector index");
        return this.output;
    }

    setConnectorState(index: number, state: boolean): void {
        if (index !== 0) throw new Error("Invalid connector index");
        if (this.type === ConnectorType.POWER || this.type === ConnectorType.GROUND)
            throw new Error("PWR and GND have fixed states!");
        this.state = state;
        this.computeOutput(); // update output
    }

    toJSON(): Record<string, unknown> {
        return {
            kind: this.kind,
            id: this.id,
            type: this.type,
            position: this.position,
            index: this.index,
            state: this.state
        };
    }

    static fromJSON(json: Record<string, unknown>): Pin {
        const pin = new Pin(
            json.id as number,
            json.type as ConnectorType,
            json.position as number[],
            json.index as number
        );
        pin.state = json.state as boolean;
        pin.output = pin.state;
        pin.kind = ElementKind.PIN;
        return pin;
    }
}
