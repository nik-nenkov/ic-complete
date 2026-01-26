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
    getDimensions(): number[] {
        return [3, this.getPinUpperHalf() + 1];
    }
    getConnectors(): Connector[] {
        let puh = this.getPinUpperHalf();
        return this.getPinElements().map((pin, i) =>
            new Connector(
                sumArr(this.position, [i < puh ? 0 : 3, (i % puh) + 1]),
                pin.type,
                this.id,
                pin.index,
                i < this.countPins()/2,
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
        let p = this.findPinByIndex(index);
        if (!p) throw new Error("Pin not found");
        if (p.type !== ConnectorType.INPUT) throw new Error("Cannot set state of output pin");
        p.setConnectorState(0, state);
        this.propagateSignals(p);
    }
    private getPinUpperHalf(): number {
        return Math.ceil(this.countPins() / 2);
    }
    private getPinElements(): Pin[] {
        return this.elements.filter(el => el instanceof Pin).sort((a, b) => a.index - b.index) as Pin[];
    }
    private countPins(): number {
        return this.getPinElements().length;
    }
    private findPinByIndex(index: number): Pin {
        return this.getPinElements().find(pin => pin.index === index)!;
    }
    private propagateSignals(element: Element): void {
        this.wires.filter(wire =>
            wire.from.elementId === element.id
        ).forEach(wire => {
            let toElement = this.elements.find(el => el.id === wire.to.elementId);
            if (!toElement) return;
            toElement.setConnectorState(wire.to.pinIndex, element.getConnectorState(wire.from.pinIndex));
            this.propagateSignals(toElement);
        });
    }
    refreshState(): void {
        this.getPinElements().forEach(p => this.propagateSignals(p))
    }
    nextElementId(): number {
        return this.elements.length > 0 ? Math.max(...this.elements.map(el => el.id)) + 1 : 0;
    }
    nextPinIndex(): number {
        return this.getPinElements()[(this.getPinElements().length - 1)]?.index + 1 || 0;
    }
    nextWireId(): number {
        return this.wires.length > 0 ? Math.max(...this.wires.map(wire => wire.id)) + 1 : 0;
    }
    wireExists(selectedConnector: Connector, hoveredConnector: Connector): boolean {
        return this.wires.find(w =>
            w.from.elementId == selectedConnector.elementId &&
            w.from.pinIndex == selectedConnector.pinIndex &&
            w.to.elementId == hoveredConnector.elementId &&
            w.to.pinIndex == hoveredConnector.pinIndex
        ) !== undefined
    }
    deleteElement(elementId: number) {
        this.elements = this.elements.filter(el => el.id !== elementId);
        this.wires = this.wires.filter(w =>
            w.from.elementId !== elementId &&
            w.to.elementId !== elementId
        );
    }
    toggleInputPinByElementId(elementId: number | null): void {
        if (elementId === null) return;
        let p = this.getPinElements().find(pin => pin.id === elementId);
        if (p) {
            p.setConnectorState(0, !p.getConnectorState(0));
            this.propagateSignals(p);
        }
    }
    moveElement(elementId: number, gridPosition: number[]) {
        let el = this.findElementById(elementId);
        if (el) {
            el.position = gridPosition;
            let conns = el.getConnectors();
            this.wires.filter(w => w.from.elementId === elementId).forEach(w => {
                let newConn = conns.find(c => c.elementId === w.from.elementId && c.pinIndex === w.from.pinIndex)
                if (newConn) {w.from = newConn;w.path[0]=newConn.position}
            });
            this.wires.filter(w => w.to.elementId === elementId).forEach(w => {
                let newConn = conns.find(c => c.elementId === w.to.elementId && c.pinIndex === w.to.pinIndex)
                if (newConn) {w.to = newConn;w.path[w.path.length-1]=newConn.position}
            });
        }
    }
    findElementById(elementId: number): Element | null {
        return this.elements.find(el => el.id === elementId) || null;
    }
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
        const ic = new IntegratedCircuit(
            json.id as number,
            json.label as string,
            json.position as number[]
        );

        ic.elements = (json.elements as Record<string, unknown>[]).map(e =>
            ElementFactory.fromJSON(e)
        );

        ic.wires = (json.wires as Record<string, unknown>[]).map(w =>
            Wire.fromJSON(w)
        );

        ic.kind = ElementKind.IC;
        return ic;
    }
}
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