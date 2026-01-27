import { Connector, ConnectorType } from "./wire";

export enum ElementKind {
  GATE = "GATE",
  PIN = "PIN",
  IC = "IC"
}

/**
 * Base class for all elements (pins, gates, ICs) in the circuit.
 * Provides interface for connector management and output computation.
 */
export abstract class Element {
    constructor(
        public id: number,
        public label: string,
        public position: number[],
    ) {}

    abstract kind: ElementKind;

    /**
     * Compute the output(s) of this element based on its current inputs.
     * Should update internal output state(s).
     */
    abstract computeOutput(): void;

    /**
     * Return element size in grid units [width, height].
     */
    abstract getDimensions(): number[];

    /**
     * Return all connectors (inputs + outputs) of this element.
     */
    abstract getConnectors(): Connector[];

    /**
     * Return the type of a connector at the given index.
     */
    abstract getConnectorType(index: number): ConnectorType;

    /**
     * Return the current state of a connector at the given index.
     */
    abstract getConnectorState(index: number): boolean;

    /**
     * Set the state of a connector at the given index.
     * Should also recompute output if the element has internal logic.
     */
    abstract setConnectorState(index: number, state: boolean): void;

    /**
     * Serialize element to JSON.
     */
    abstract toJSON(): Record<string, unknown>;

    /**
     * Optional: create element from JSON.
     */
    static fromJSON?(json: Record<string, unknown>): Element;

    /**
     * Helper: Return all input connector indices.
     */
    getInputIndices(): number[] {
        return this.getConnectors()
            .map((c, i) => c.type === ConnectorType.INPUT ? i : -1)
            .filter(i => i >= 0);
    }

    /**
     * Helper: Return all output connector indices.
     */
    getOutputIndices(): number[] {
        return this.getConnectors()
            .map((c, i) => c.type === ConnectorType.OUTPUT ? i : -1)
            .filter(i => i >= 0);
    }
}
