import { appStore } from "../storage/state";
import { gridSize, nearbyDistance } from "./constants.js";
import { Connector } from "../model/wire.js";

export function findHoveredConnector(mousePos: number[]): Connector | null {
    for (let element of appStore.currentCircuit.elements) {
        for (let connector of element.getConnectors()) {    
            const connPos = [connector.position[0] * gridSize, connector.position[1] * gridSize];
            const dist = Math.hypot(connPos[0] - mousePos[0], connPos[1] - mousePos[1]);
            if (dist <= nearbyDistance) {
                return connector;
            }
        }
    }
    return null;
}

export function findHoverElementId(mousePos: number[]): number | null {
    return appStore.currentCircuit.elements.filter(element=>{
        const elementPos = [element.position[0] * gridSize, element.position[1] * gridSize];
        const elementCorner = [
            (element.position[0] + element.getDimensions()[0])* gridSize,
            (element.position[1] + element.getDimensions()[1])* gridSize,
        ]
        if (
            mousePos[0]>elementPos[0]
            &&mousePos[1]>elementPos[1]
            &&mousePos[0]<elementCorner[0]
            &&mousePos[1]<elementCorner[1]
        ) {
            return true;
        }
        return false;
    }).pop()?.id??null;
}