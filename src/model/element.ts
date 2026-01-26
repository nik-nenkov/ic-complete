import { Connector, ConnectorType } from "./wire";

export enum ElementKind {
  GATE = "GATE",
  PIN = "PIN",
  IC = "IC"
}

export abstract class Element {
    constructor(
        public id: number,
        public label: string,
        public position: number[],
    ){}
    abstract kind: ElementKind;
    abstract getDimensions(): number[];
    abstract getConnectors(): Connector[];
    abstract getConnectorType(index: number): ConnectorType;
    abstract getConnectorState(index: number): boolean;
    abstract setConnectorState(index: number, state: boolean): void;
    abstract toJSON(): Record<string, unknown>;
    static fromJSON?(json: Record<string, unknown>): Element;
}
