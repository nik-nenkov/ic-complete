import { appStore, clearStates } from "../storage/state";
import { Wire } from "../model/logic/wire.js";
import { gridSize } from "./constants.js";

export function mouseCanvasPosition(canvas: HTMLCanvasElement, event: MouseEvent): number[] {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    return [x, y];
}

export function mouseGridPosition(canvas: HTMLCanvasElement, event: MouseEvent): number[] {
    const [mouseX, mouseY] = mouseCanvasPosition(canvas, event);
    const gridX = Math.round(mouseX / gridSize);
    const gridY = Math.round(mouseY / gridSize);
    return [gridX, gridY];
}

export function mouseDownInEditMode(canvas: HTMLCanvasElement, event: MouseEvent) {
    if(appStore.hoveredElementId!=null) appStore.isDragging = true;
    switch (event.button) {
        case 0: // Left click
            if (appStore.hoveredConnector === null && appStore.hoveredElementId === null && appStore.previewElement === null) {
                clearStates();
                appStore.path.length!=0 && appStore.path.push(mouseGridPosition(canvas,event))
                break;
            }
            if (appStore.previewElement) {
                appStore.currentCircuit.elements.push(appStore.previewElement);
                appStore.previewElement = null;
                break;
            }
            if (appStore.hoveredConnector) {
                if (appStore.selectedConnector && appStore.selectedConnector !== appStore.hoveredConnector) {
                    // Create wire
                    if (appStore.currentCircuit.wireExists(appStore.selectedConnector, appStore.hoveredConnector)) { break }
                    appStore.path.push(appStore.hoveredConnector.position)
                    const newWire = new Wire(
                        appStore.currentCircuit.nextWireId(),
                        appStore.selectedConnector,
                        appStore.hoveredConnector,
                        appStore.path
                    );
                    appStore.currentCircuit.wires.push(newWire);
                    appStore.selectedConnector = null;
                    appStore.path = [];
                } else {
                    appStore.selectedConnector = appStore.hoveredConnector;
                    appStore.path.push(appStore.selectedConnector.position);
                }
                break;
            }
            break;
        case 2: // Right click
            clearStates();
            appStore.selectedConnector = null;
            appStore.path = [];
            break;
    }
}

export function mouseDownInSimulationMode(event: MouseEvent) {
    appStore.currentCircuit.toggleInputPinByElementId(appStore.hoveredElementId)
}