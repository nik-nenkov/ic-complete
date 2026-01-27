import { sumArr } from "../util/helper";
import { Element, ElementKind } from "./element";
import { Gate } from "./gate";
import { Pin } from "./pin";
import { Connector, ConnectorType, Wire } from "./wire";

export class IntegratedCircuit extends Element {
    public elements: Element[] = [];
    public wires: Wire[] = [];
    public kind = ElementKind.IC;

    constructor(
        public id: number,
        public label: string,
        public position: number[],
    ) {
        super(id, label, position);
    }

    // Compute output for the IC (updates all internal elements)
    computeOutput(): void {
        // propagate from input pins
        const visited = new Set<number>();
        const propagate = (el: Element) => {
            if (visited.has(el.id)) return; // avoid infinite loops
            visited.add(el.id);
            el.computeOutput();
            this.wires
                .filter(w => w.from.elementId === el.id)
                .forEach(wire => {
                    const target = this.elements.find(e => e.id === wire.to.elementId);
                    if (!target) return;
                    target.setConnectorState(wire.to.pinIndex, el.getConnectorState(wire.from.pinIndex));
                    propagate(target);
                });
        };
        this.getPinElements().forEach(p => propagate(p));
    }

    getDimensions(): number[] {
        return [3, this.getPinUpperHalf() + 1];
    }

    getConnectors(): Connector[] {
        const puh = this.getPinUpperHalf();
        return this.getPinElements().map((pin, i) =>
            new Connector(
                sumArr(this.position, [i < puh ? 0 : 3, (i % puh) + 1]),
                pin.type,
                this.id,
                pin.index,
                i < this.countPins() / 2,
                pin.label
            )
        );
    }

    getConnectorType(index: number): ConnectorType {
        return this.findPinByIndex(index).type;
    }

    getConnectorState(index: number): boolean {
        return this.findPinByIndex(index).getConnectorState(0);
    }

    setConnectorState(index: number, state: boolean): void {
        const pin = this.findPinByIndex(index);
        if (!pin) throw new Error("Pin not found");
        if (pin.type !== ConnectorType.INPUT) throw new Error("Cannot set state of output pin");
        pin.setConnectorState(0, state);
        this.computeOutput(); // propagate signals from this input
    }

    /** ---------------------- INTERNAL HELPERS ---------------------- */

    private getPinUpperHalf(): number {
        return Math.ceil(this.countPins() / 2);
    }

    private getPinElements(): Pin[] {
        return this.elements
            .filter(el => el instanceof Pin)
            .sort((a, b) => a.index - b.index) as Pin[];
    }

    private countPins(): number {
        return this.getPinElements().length;
    }

    private findPinByIndex(index: number): Pin {
        const pin = this.getPinElements().find(p => p.index === index);
        if (!pin) throw new Error("Pin not found");
        return pin;
    }

    /** ---------------------- ELEMENT MANAGEMENT ---------------------- */

    refreshState(): void {
        this.computeOutput();
    }

    nextElementId(): number {
        return this.elements.length > 0 ? Math.max(...this.elements.map(e => e.id)) + 1 : 0;
    }

    nextPinIndex(): number {
        return this.getPinElements().length > 0
            ? this.getPinElements()[this.getPinElements().length - 1].index + 1
            : 0;
    }

    nextWireId(): number {
        return this.wires.length > 0 ? Math.max(...this.wires.map(w => w.id)) + 1 : 0;
    }

    wireExists(from: Connector, to: Connector): boolean {
        return this.wires.some(w =>
            w.from.elementId === from.elementId &&
            w.from.pinIndex === from.pinIndex &&
            w.to.elementId === to.elementId &&
            w.to.pinIndex === to.pinIndex
        );
    }

    deleteElement(elementId: number) {
        this.elements = this.elements.filter(e => e.id !== elementId);
        this.wires = this.wires.filter(w => w.from.elementId !== elementId && w.to.elementId !== elementId);
    }

    toggleInputPinByElementId(elementId: number | null): void {
        if (elementId === null) return;
        const pin = this.getPinElements().find(p => p.id === elementId);
        if (pin) {
            pin.setConnectorState(0, !pin.getConnectorState(0));
            this.computeOutput();
        }
    }

    moveElement(elementId: number, gridPosition: number[]) {
        const el = this.findElementById(elementId);
        if (!el) return;
        el.position = gridPosition;
        const conns = el.getConnectors();
        this.wires.forEach(w => {
            if (w.from.elementId === elementId) {
                const c = conns.find(c => c.elementId === w.from.elementId && c.pinIndex === w.from.pinIndex);
                if (c) { w.from = c; w.path[0] = c.position; }
            }
            if (w.to.elementId === elementId) {
                const c = conns.find(c => c.elementId === w.to.elementId && c.pinIndex === w.to.pinIndex);
                if (c) { w.to = c; w.path[w.path.length - 1] = c.position; }
            }
        });
    }

    findElementById(elementId: number): Element | null {
        return this.elements.find(e => e.id === elementId) || null;
    }

    /** ---------------------- SERIALIZATION ---------------------- */

    toJSON(): Record<string, unknown> {
        return {
            kind: this.kind,
            id: this.id,
            label: this.label,
            position: this.position,
            elements: this.elements.map(e => e.toJSON()),
            wires: this.wires.map(w => w.toJSON())
        };
    }

    static fromJSON(json: Record<string, unknown>): IntegratedCircuit {
        const ic = new IntegratedCircuit(json.id as number, json.label as string, json.position as number[]);
        ic.elements = (json.elements as Record<string, unknown>[]).map(e => ElementFactory.fromJSON(e));
        ic.wires = (json.wires as Record<string, unknown>[]).map(w => Wire.fromJSON(w));
        return ic;
    }
}

/** ---------------------- ELEMENT FACTORY ---------------------- */

export class ElementFactory {
    static fromJSON(json: Record<string, unknown>): Element {
        switch (json.kind) {
            case "GATE": return Gate.fromJSON(json);
            case "PIN": return Pin.fromJSON(json);
            case "IC": return IntegratedCircuit.fromJSON(json);
            default: throw new Error("Unknown element kind");
        }
    }
}
