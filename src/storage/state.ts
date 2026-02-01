import { IntegratedCircuit } from "../model/logic/circuit";
import { Connector } from "../model/logic/wire";
import { outsideGridPos } from "../util/constants";
import { Element } from "../model/logic/element";
import { ElectricalElement } from "../model/electrical/ElectricalElement";

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
    ticker: null as null | number,
    ctx: null as null | CanvasRenderingContext2D,
    floorItems: [] as ElectricalElement[],
    previewFloorItem: null as null | ElectricalElement,
    zoom : 1,   // 100% zoom
    offset : [0, 0], // for future panning
    gridSize : 20,   // base grid size in pixels
};

export function clearStates() {
    appStore.previewElement = null;
    appStore.selectedElementIds = [];
}