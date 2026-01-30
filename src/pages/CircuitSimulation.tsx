import { useEffect, useRef, useState } from "react";
import { Gate, GateType } from "../model/logic/gate";
import { canvasDimensions, IC_STORAGE, outsideGridPos } from "../util/constants";
import { redrawAll } from "../util/draw";
import {
    mouseCanvasPosition,
    mouseGridPosition,
    mouseDownInEditMode,
    mouseDownInSimulationMode,
} from "../util/mouse";
import { IntegratedCircuit } from "../model/logic/circuit";
import { Pin } from "../model/logic/pin";
import { sumArr } from "../util/helper";
import { findHoveredConnector, findHoverElementId } from "../util/find";
import { appStore, clearStates } from "../storage/state";
import { ConnectorType } from "../model/logic/wire";
import { ElementKind } from "../model/logic/element";
import "./circuit-simulation.scss";

export default function CircuitSimulation() {
    const [isSimulationRunning, setIsSimulationRunning] = useState(false);
    const [openSections, setOpenSections] = useState({ gates: true, pins: true, circuits: true });

    const gateRef = useRef<HTMLDivElement>(null);
    const pinRef = useRef<HTMLDivElement>(null);
    const icRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const circuitNameRef = useRef<HTMLInputElement>(null);

    const toggleOpen = (section: keyof typeof openSections) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    // Render buttons for gates, pins, and saved circuits
    const renderButtons = () => {
        if (gateRef.current) {
            gateRef.current.innerHTML = "";
            Object.values(GateType).forEach(gateType => {
                const btn = document.createElement("button");
                btn.innerText = gateType;
                btn.addEventListener("click", () => {
                    appStore.previewElement = new Gate(appStore.currentCircuit.nextElementId(), gateType, outsideGridPos);
                });
                gateRef.current!.appendChild(btn);
            });
        }

        if (pinRef.current) {
            pinRef.current.innerHTML = "";
            Object.values(ConnectorType).forEach(connectorType => {
                const btn = document.createElement("button");
                btn.innerText = connectorType;
                btn.addEventListener("click", () => {
                    appStore.previewElement = new Pin(
                        appStore.currentCircuit.nextElementId(),
                        connectorType,
                        outsideGridPos,
                        appStore.currentCircuit.nextPinIndex()
                    );
                });
                pinRef.current!.appendChild(btn);
            });
        }

        if (icRef.current && circuitNameRef.current) {
            icRef.current.innerHTML = "";
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
                    circuitNameRef.current!.value = appStore.previewElement.label;
                });
                icRef.current!.appendChild(btn);
                appStore.savedCircuits.push(circuit);
            });
            circuitNameRef.current.value = appStore.currentCircuit.label;
        }
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        appStore.ctx = canvas.getContext("2d")! as CanvasRenderingContext2D;
        canvas.width = canvasDimensions[0];
        canvas.height = canvasDimensions[1];

        renderButtons();
        // Redraw every 80ms
        const redrawInterval = setInterval(() => {
            redrawAll();
        }, 80);

        // Canvas events
        const handleMouseDown = (e: MouseEvent) => {
            if (!appStore.isSimulationRunning) mouseDownInEditMode(canvas, e);
            else mouseDownInSimulationMode(e);

            if (appStore.hoveredElementId !== null) {
                if (appStore.selectedElementIds.includes(appStore.hoveredElementId)) {
                    appStore.selectedElementIds = appStore.selectedElementIds.filter(id => id !== appStore.hoveredElementId);
                } else {
                    appStore.selectedElementIds.push(appStore.hoveredElementId);
                }
            }
        };

        const handleMouseMove = (e: MouseEvent) => {
            appStore.gridPointer = mouseGridPosition(canvas, e);
            const connectorFound = findHoveredConnector(mouseCanvasPosition(canvas, e));

            if (!appStore.isSimulationRunning && appStore.isDragging && appStore.selectedElementIds.length === 1 &&
                appStore.hoveredElementId != null && appStore.selectedElementIds.includes(appStore.hoveredElementId)
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

            appStore.hoveredElementId = findHoverElementId(mouseCanvasPosition(canvas, e));
        };

        const handleDblClick = () => {
            if (appStore.hoveredElementId != null) {
                const el = appStore.currentCircuit.findElementById(appStore.hoveredElementId);
                if (el && el.kind === ElementKind.IC) appStore.currentCircuit = el as IntegratedCircuit;
            }
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Delete") {
                for (const id of appStore.selectedElementIds) {
                    appStore.currentCircuit.deleteElement(id);
                }
                appStore.selectedElementIds = [];
            }
        };

        canvas.addEventListener("contextmenu", e => e.preventDefault());
        canvas.addEventListener("mousedown", handleMouseDown);
        canvas.addEventListener("mousemove", handleMouseMove);
        canvas.addEventListener("dblclick", handleDblClick);
        window.addEventListener("keydown", handleKeyDown);

        return () => {
            clearInterval(redrawInterval);
            canvas.removeEventListener("mousedown", handleMouseDown);
            canvas.removeEventListener("mousemove", handleMouseMove);
            canvas.removeEventListener("dblclick", handleDblClick);
            window.removeEventListener("keydown", handleKeyDown);
            appStore.ticker && clearInterval(appStore.ticker);
        };
    }, []);

    const handleToggleSimulation = () => {
        if (!canvasRef.current) return;
        const newState = !isSimulationRunning;
        setIsSimulationRunning(newState);
        appStore.isSimulationRunning = newState;

        if (gateRef.current) gateRef.current.style.display = newState ? "none" : "flex";
        if (pinRef.current) pinRef.current.style.display = newState ? "none" : "flex";
        if (icRef.current) icRef.current.style.display = newState ? "none" : "flex";

        clearStates();
        appStore.path = [];
        appStore.currentCircuit.refreshState();

        if (newState) {
            appStore.ticker = window.setInterval(() => {
                appStore.currentCircuit.refreshState();
            }, 100);
        } else {
            appStore.ticker && clearInterval(appStore.ticker);
            appStore.ticker = null;
        }
    };

    return (
        <div className="circuit-simulation">
            <div className="sidebar">
                <h2>Controls</h2>
                <div id="simulation-controls">
                    <button onClick={handleToggleSimulation}>
                        {isSimulationRunning ? "Stop Simulation" : "Start Simulation"}
                    </button>
                </div>

                <div className="section">
                    <div className="section-header" onClick={() => toggleOpen("gates")}>
                        Gates <span className={`toggle-icon ${openSections.gates ? "open" : ""}`}>▶</span>
                    </div>
                    <div className={`section-content ${openSections.gates ? "open" : ""}`} ref={gateRef} />
                </div>

                <div className="section">
                    <div className="section-header" onClick={() => toggleOpen("pins")}>
                        Pins <span className={`toggle-icon ${openSections.pins ? "open" : ""}`}>▶</span>
                    </div>
                    <div className={`section-content ${openSections.pins ? "open" : ""}`} ref={pinRef} />
                </div>

                <div className="section">
                    <div className="section-header" onClick={() => toggleOpen("circuits")}>
                        Saved Circuits <span className={`toggle-icon ${openSections.circuits ? "open" : ""}`}>▶</span>
                    </div>
                    <div className={`section-content ${openSections.circuits ? "open" : ""}`} ref={icRef} />
                </div>

                <input ref={circuitNameRef} placeholder="Circuit name" />
            </div>

            <div className="canvas-container">
                <canvas ref={canvasRef} />
            </div>
        </div>
    );
}
