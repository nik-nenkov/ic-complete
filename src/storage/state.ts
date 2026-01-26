import { IntegratedCircuit } from "../model/circuit";
import { Connector } from "../model/wire";
import { outsideGridPos } from "../util/constants";
import { Element } from "../model/element";

export const appStore = {
    currentCircuit: new IntegratedCircuit(0, "CIRCUIT", outsideGridPos),
    isSimulationRunning: false,
    selectedElementIds: [] as number[],
    savedCircuits: [] as IntegratedCircuit[],
    previewElement: null as Element | null,
    hoveredConnector: null as Connector | null,
    selectedConnector: null as Connector | null,
    gridPointer: [...outsideGridPos],
    hoveredElementId: null as number | null,
    isDragging: false,
    path: [] as number[][],
    ticker: null as null | number
};

export function clearStates() {
    appStore.previewElement = null;
    appStore.selectedElementIds = [];
}