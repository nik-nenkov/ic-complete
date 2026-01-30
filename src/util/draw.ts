import { Pin } from "../model/logic/pin.js";
import { Connector, Wire } from "../model/logic/wire.js";
import { canvasDimensions, highlightColor, lineGrey, paleGreen, wireThickness } from "./constants.js";
import { gridSize } from "./constants.js";
import { appStore } from "../storage/state.js"
import { Element } from "../model/logic/element.js";

export function drawGrid(ctx: CanvasRenderingContext2D, canvasDimensions: number[]): void {
    ctx!.clearRect(0, 0, canvasDimensions[0], canvasDimensions[1]);
    ctx!.strokeStyle = lineGrey;
    ctx!.lineWidth = 1;
    for (let x = 0; x <= canvasDimensions[0]; x += gridSize) {
        for (let y = 0; y <= canvasDimensions[1]; y += gridSize) {
            // draw dots
            ctx!.beginPath();
            ctx!.arc(x, y, 1, 0, 2 * Math.PI);
            ctx!.fillStyle = lineGrey;
            ctx!.fill();
        }
    }
}

export function drawElement(ctx: CanvasRenderingContext2D, position: number[], selectedElement: Element | null): void {
    if (selectedElement) {
        // Draw element background as white with black border
        selectedElement.position = position;
        const [width, height] = selectedElement.getDimensions();
        ctx.beginPath();
        ctx.roundRect(
            selectedElement.position[0] * gridSize + 3,
            selectedElement.position[1] * gridSize + 3,
            width * gridSize - 6,
            height * gridSize - 6,
            9
        );
        ctx.fillStyle = appStore.isSimulationRunning ? 
        (selectedElement instanceof Pin && selectedElement.state) ? paleGreen : "white"
        : appStore.selectedElementIds.includes(selectedElement.id) ? "orange" : "white";   // fill white
        ctx.fill();
        ctx.strokeStyle = "black"; // black border
        ctx.lineWidth = 1;         // optional, adjust border width
        ctx.stroke();

        // Draw connectors
        let conns = selectedElement.getConnectors();
        conns.forEach((connector, i) => drawConnector(ctx, connector, "white", i < conns.length / 2));

        // Draw label
        ctx!.fillStyle = "black";
        if (selectedElement.label) {
            ctx!.font = `${gridSize * 0.5}px sans-serif`;
            ctx!.textAlign = "center";
            ctx!.textBaseline = "middle";
            const [width, height] = selectedElement.getDimensions();
            ctx!.fillText(
                selectedElement.label,
                (selectedElement.position[0] + width / 2) * gridSize,
                (selectedElement.position[1] + height / 2) * gridSize
            );
        }
    }
}

export function drawConnector(
    ctx: CanvasRenderingContext2D,
    connector: Connector | null,
    color: string,
    textAlign: boolean
): void {
    if (!connector) return;
    ctx.lineWidth = 1;
    ctx.fillStyle = color;
    ctx.strokeStyle = lineGrey;

    // Draw connector rectangle (portrait)
    ctx.beginPath();
    const x = connector.position[0] * gridSize;
    const y = connector.position[1] * gridSize;
    const width = gridSize / 6;        // same as circle diameter
    const height = gridSize / 2;          // double height
    ctx.rect(x - width / 2, y - height / 2, width, height); // center at (x,y)
    ctx.fill();
    ctx.stroke();

    // Draw label above and left or right
    if (connector.label) {
        ctx.fillStyle = "black";
        ctx.font = "12px Arial";
        ctx.textBaseline = "bottom";
        ctx.textAlign = textAlign ? "right" : "left";
        textAlign ? ctx.fillText(connector.label, x - 4, y - 4) :
            ctx.fillText(connector.label, x + 4, y - 4);
    }
}

export function drawWire(ctx: CanvasRenderingContext2D, wire: Wire | null, color: string = lineGrey): void {
    if (!wire) return;
    drawPath(ctx, wire.path, color);
}

export function drawLine(ctx: CanvasRenderingContext2D, from: number[], to: number[], color: string = highlightColor): void {
    ctx!.strokeStyle = color;
    ctx!.lineWidth = wireThickness;
    ctx!.beginPath();
    ctx!.moveTo(
        from[0] * gridSize,
        from[1] * gridSize
    );
    ctx!.lineTo(
        to[0] * gridSize,
        to[1] * gridSize
    );
    ctx!.stroke();
}
export function drawPath(ctx: CanvasRenderingContext2D, path: number[][], color: string = highlightColor): void {
    for (let index = 0; index < path.length -1; index++) {
        const element = path[index];
        const element2 = path[index+1];
        ctx!.strokeStyle = color;
        ctx!.lineWidth = wireThickness;
        ctx!.beginPath();
        ctx!.moveTo(
            element[0] * gridSize,
            element[1] * gridSize
        );
        ctx!.lineTo(
            element2[0] * gridSize,
            element2[1] * gridSize
        );
        ctx!.stroke();
    }
}

export function redrawAll(ctx: CanvasRenderingContext2D): void {
    drawGrid(ctx, canvasDimensions);
    appStore.currentCircuit.wires.forEach(wire => {
        drawWire(ctx, wire);
    });
    appStore.currentCircuit.elements.forEach(element => {
        drawElement(ctx, element.position, element);
    });
    appStore.previewElement && drawElement(ctx, appStore.previewElement.position, appStore.previewElement);
    appStore.selectedConnector && drawPath(ctx, appStore.path, highlightColor);
    appStore.selectedConnector && appStore.path[appStore.path.length-1] && drawLine(ctx, appStore.path[appStore.path.length-1], appStore.gridPointer, highlightColor);
    appStore.hoveredConnector && drawConnector(ctx, appStore.hoveredConnector, highlightColor, appStore.hoveredConnector.isLeft);
    appStore.selectedConnector && drawConnector(ctx, appStore.selectedConnector, highlightColor, appStore.selectedConnector.isLeft);
}