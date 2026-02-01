import { ElectricalConnector } from "./ElectricalConnector";

export enum EEType{
    R="Resistor",L="Inductor",C="Capacitor"
}

export const ZERO: bigint = 0n;
export const ONE: bigint = 1n;
export const TWO: bigint = 2n;
export const THREE: bigint = 3n;
export const FOUR: bigint = 4n;

export class ElectricalElement{
    private static nextId:bigint = ZERO;
    public id: bigint;
    public position: bigint[] = [ZERO,ZERO];
    public rotation: bigint = ZERO;
    public z: bigint[] = [ZERO,ZERO];
    public readonly type: EEType;
    public connectors: ElectricalConnector[] = [];
    constructor(
        type:EEType,
        pos:bigint[]
    ){
        console.log("ElectricalElement constructor called")
        this.type = type;
        this.position = pos;
        this.id = ElectricalElement.nextId++;
    }
    public getConnectors(){
        switch(this.rotation % FOUR){
            case ZERO:
                return [
                    new ElectricalConnector([this.position[0],this.position[1]+ONE]),
                    new ElectricalConnector([this.position[0]+TWO,this.position[1]+ONE])
                ]
            case ONE:
                return [
                    new ElectricalConnector([this.position[0]+TWO,this.position[1]+ONE]),
                    new ElectricalConnector([this.position[0],this.position[1]+ONE])
                ]
            case TWO:
                return [
                    new ElectricalConnector([this.position[0]+ONE,this.position[1]+TWO]),
                    new ElectricalConnector([this.position[0]+ONE,this.position[1]])
                ]
            case THREE:
                return [
                    new ElectricalConnector([this.position[0],this.position[1]+ONE]),
                    new ElectricalConnector([this.position[0]+TWO,this.position[1]+ONE])
                ]
        }
    }
    public getIconUrl(){
        switch(this.type){
            case(EEType.R):
            return "images/R.png"
            case(EEType.L):
            return "images/L.png"
            case(EEType.C):
            return "images/C.png"
        }
    }
}