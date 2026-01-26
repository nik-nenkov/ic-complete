import { Gate, GateType } from "./model/gate";
import { canvasDimensions, IC_STORAGE, outsideGridPos } from "./util/constants";
import { redrawAll } from "./util/draw";
import { mouseCanvasPosition, mouseGridPosition, mouseDownInEditMode, mouseDownInSimulationMode } from "./util/mouse";
import { IntegratedCircuit } from "./model/circuit";
import { Pin } from "./model/pin";
import { sumArr } from "./util/helper";
import { findHoveredConnector, findHoverElementId } from "./util/find";
import { appStore, clearStates } from "./storage/state";
import { ConnectorType } from "./model/wire";
import { ElementKind } from "./model/element";

const gateButtonsGroup = document.getElementById("gate-buttons-group")! as HTMLDivElement;
const pinButtonsGroup = document.getElementById("pin-buttons-group")! as HTMLDivElement;
const icButtonsGroup = document.getElementById("ic-buttons-group")! as HTMLDivElement;
const canvasContainer = document.getElementById("canvas-container")! as HTMLDivElement;
const toggleSimulationButton = document.getElementById("toggle-simulation")! as HTMLButtonElement;
const saveCircuitButton = document.getElementById("save-circuit")! as HTMLButtonElement;
const inputCircuitName = document.getElementById("circuit-name")! as HTMLInputElement;

const canvas = document.createElement("canvas")! as HTMLCanvasElement;
const context = canvas.getContext("2d")! as CanvasRenderingContext2D;
canvasContainer.appendChild(canvas);

canvas.width = canvasDimensions[0];
canvas.height = canvasDimensions[1];

redrawAll(context);

canvas.addEventListener("contextmenu", (evt: MouseEvent) => {
    evt.preventDefault();
})

canvas.addEventListener("mousedown", (event: MouseEvent) => {
    if (!appStore.isSimulationRunning) { mouseDownInEditMode(canvas, event) }
    else { mouseDownInSimulationMode(event) }
        if (appStore.hoveredElementId !== null) {
        if (appStore.selectedElementIds.includes(appStore.hoveredElementId)) {
            appStore.selectedElementIds = appStore.selectedElementIds.filter(id => id !== appStore.hoveredElementId);
        } else {
            appStore.selectedElementIds.push(appStore.hoveredElementId)
        }
    }
    redrawAll(context);
});

canvas.addEventListener("mouseup", () => {
    appStore.isDragging = false;
})

canvas.addEventListener("click", () => {

    redrawAll(context);
})

canvas.addEventListener("mousemove", (event: MouseEvent) => {
    appStore.gridPointer = mouseGridPosition(canvas, event);
    const connectorFound = findHoveredConnector(mouseCanvasPosition(canvas, event));

    if (appStore.isDragging && appStore.selectedElementIds.length == 1 && 
         appStore.hoveredElementId!=null && appStore.selectedElementIds.includes(appStore.hoveredElementId)
    ) {
        appStore.currentCircuit.moveElement(appStore.selectedElementIds[0], sumArr(appStore.gridPointer, [-1, -1]));
    }

    if (appStore.selectedConnector) {
        appStore.hoveredConnector = connectorFound?.type === ConnectorType.INPUT ? connectorFound : null;
    } else {
        appStore.hoveredConnector = connectorFound?.type === ConnectorType.OUTPUT ? connectorFound : null;
    }

    if (appStore.previewElement) {
        appStore.previewElement.position = sumArr(appStore.gridPointer, [-1, -1]);
    }

    appStore.hoveredElementId = findHoverElementId(mouseCanvasPosition(canvas, event));

    redrawAll(context);
});

canvas.addEventListener("dblclick", ()=>{
    if(appStore.hoveredElementId!=null){
        let el = appStore.currentCircuit.findElementById(appStore.hoveredElementId);
        if(el&&el.kind===ElementKind.IC)
        appStore.currentCircuit = el as IntegratedCircuit;
    }
});

Object.values(GateType).forEach(gateType => {
    const btn = document.createElement("button");
    btn.innerText = gateType;
    btn.addEventListener("click", () => {
        appStore.previewElement = new Gate(appStore.currentCircuit.nextElementId(), gateType, outsideGridPos);
    });
    gateButtonsGroup.appendChild(btn);
});

Object.values(ConnectorType).forEach(connectorType => {
    const btn = document.createElement("button");
    btn.innerText = connectorType;
    btn.addEventListener("click", () => {
        appStore.previewElement = new Pin(appStore.currentCircuit.nextElementId(), connectorType, outsideGridPos, appStore.currentCircuit.nextPinIndex());
    });
    pinButtonsGroup.appendChild(btn);
});

window.addEventListener("keydown", (e: KeyboardEvent) => {
    if (e.key === "Delete") {
        for (var i = 0; i < appStore.selectedElementIds.length; i++) {
            appStore.currentCircuit.deleteElement(appStore.selectedElementIds[i]);
        }
        appStore.selectedElementIds = [];
        redrawAll(context);
    }
})

function renderCircuitButtons() {
    icButtonsGroup.innerHTML = "";
    JSON.parse(localStorage.getItem(IC_STORAGE) || "[]").forEach((saveJson: any) => {
        const circuit = IntegratedCircuit.fromJSON(saveJson);
        const btn = document.createElement("button");
        btn.innerText = circuit.label;
        btn.addEventListener("click", () => {
            const loadedCircuit = IntegratedCircuit.fromJSON(saveJson);
            appStore.previewElement = Object.assign(
                Object.create(Object.getPrototypeOf(loadedCircuit)),
                loadedCircuit
            );
            if (!appStore.previewElement) return;
            appStore.previewElement.id = appStore.currentCircuit.nextElementId();
            inputCircuitName.value = appStore.previewElement.label;
            redrawAll(context);
        });
        icButtonsGroup.appendChild(btn);
        appStore.savedCircuits.push(circuit);
    });
    inputCircuitName.value = appStore.currentCircuit.label
}

document.addEventListener("DOMContentLoaded", () => {
    toggleSimulationButton.addEventListener("click", () => {
        appStore.isSimulationRunning = !appStore.isSimulationRunning;
        toggleSimulationButton.innerText = appStore.isSimulationRunning ? "Stop Simulation" : "Start Simulation"
        pinButtonsGroup.style.display = appStore.isSimulationRunning ? "none" : "block";
        gateButtonsGroup.style.display = appStore.isSimulationRunning ? "none" : "block";
        icButtonsGroup.style.display = appStore.isSimulationRunning ? "none" : "block";
        clearStates();
        appStore.path=[];
        appStore.currentCircuit.refreshState();
        redrawAll(context);
        if(appStore.isSimulationRunning){
            appStore.ticker = window.setInterval(() => {
                appStore.currentCircuit.refreshState();
                redrawAll(context);
            }, 100);
        }else{
            appStore.ticker && clearInterval(appStore.ticker);
            appStore.ticker = null
        }
    });
    renderCircuitButtons();
    if (saveCircuitButton && inputCircuitName) {
        saveCircuitButton.addEventListener("click", () => {
            const name = inputCircuitName.value.trim();
            if (!name) {
                alert("Please enter a circuit name.");
                return;
            }
            if (!appStore.currentCircuit) {
                alert("No circuit to save.");
                return;
            }
            // Set the circuit label to the input name before saving
            appStore.currentCircuit.label = name;
            // Load existing saves
            let saves: any[] = [];
            try {
                saves = JSON.parse(localStorage.getItem(IC_STORAGE) || "[]");
            } catch { }
            // Remove if name already exists
            saves = saves.filter(s => (s.label || (s && s.label)) !== name);
            // Limit to 10
            if (saves.length > 10) saves = saves.slice(0, 10);
            // Add current circuit (as JSON)
            saves.unshift(appStore.currentCircuit.toJSON());
            // Save back to localStorage
            localStorage.setItem(IC_STORAGE, JSON.stringify(saves));

            alert(`Circuit '${name}' saved!`);
            renderCircuitButtons();
        });
    }
});
