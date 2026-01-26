export enum ConnectorType {
    INPUT = "IN",
    OUTPUT = "OUT",
    POWER = "PWR",
    GROUND = "GND",
    CLOCK = "CLK"
}

export class Connector {
    constructor(
        public position: number[],
        public type: ConnectorType,
        public elementId: number,
        public pinIndex: number,
        public isLeft: boolean = false,
        public label?: string
    ) { }
    toJSON(): Record<string, unknown>{
        return {
            position: this.position,
            type: this.type,
            elementId: this.elementId,
            pinIndex: this.pinIndex,
            label: this.label
        }
    }   
    static fromJSON(json: Record<string, unknown>): Connector{
        return new Connector(
            json.position as number[],
            json.type as ConnectorType,
            json.elementId as number,
            json.pinIndex as number,
            json.isLeft as boolean,
            json.jabel as string
        )
    }
}

export class Wire {
    constructor(
        public id: number,
        public from: Connector,
        public to: Connector,
        public path: number[][]
    ) { }
    toJSON(): Record<string, unknown>{
        return {
            id:this.id,
            from:this.from.toJSON(),
            to:this.to.toJSON(),
            path:this.path
        }
    }
    static fromJSON(json: Record<string, unknown>): Wire{
        return new Wire(
            json.id as number,
            Connector.fromJSON(json.from as Record<string, unknown>),
            Connector.fromJSON(json.to as Record<string, unknown>),
            json.path as number[][]
        )
    }
};