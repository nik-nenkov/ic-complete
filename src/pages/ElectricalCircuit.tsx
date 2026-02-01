import { useEffect, useRef, useState } from "react";
import { appStore } from "../storage/state";
import { redrawAllFloorPlan } from "../util/draw-floorplan";
import "./electrical-circuit.scss";
import { multiplyArr, sumArr } from "../util/helper";
import { EEType, ElectricalElement } from "../model/electrical/ElectricalElement";
import { outsideGridPos } from "../util/constants";
import { findHoverEElementId, findHoverElementId } from "../util/find";
import { mouseCanvasPosition, mouseGridPosition } from "../util/mouse";

export default function ElectricalCircuit() {
  const [openSections, setOpenSections] = useState({
    structural: true,
    wiring: true,
    panels: true,
  });

  const structuralRef = useRef<HTMLDivElement>(null);
  const wiringRef = useRef<HTMLDivElement>(null);
  const panelsRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const outside:bigint[] = [-999n,-999n]

  const toggleOpen = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const renderButtons = () => {
    if (structuralRef.current) {
      structuralRef.current.innerHTML = "";
      Object.values(EEType).forEach((item) => {
        const btn = document.createElement("button");
        btn.innerText = item;
        btn.onclick = () =>
          (appStore.previewFloorItem = new ElectricalElement(item,outside));
        structuralRef.current!.appendChild(btn);
      });
    }

    if (wiringRef.current) {
      wiringRef.current.innerHTML = "";
      ["Wire"].forEach((item) => {
        const btn = document.createElement("button");
        btn.innerText = item;
        // btn.onclick = () =>
        //   (appStore.previewFloorItem = { type: item, position: outsideGridPos  });
        wiringRef.current!.appendChild(btn);
      });
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    appStore.ctx = canvas.getContext("2d")!;
    appStore.floorItems = [];
    appStore.previewFloorItem = null;
    appStore.gridPointer = [0, 0];
    appStore.zoom = 1;
    appStore.offset = [0, 0];
    appStore.gridSize = 20; // base pixels per grid

    canvas.width = 1000;
    canvas.height = 600;

    renderButtons();
    const redrawInterval = setInterval(() => redrawAllFloorPlan(), 80);

    const handleMouseDown = (e: MouseEvent) => {
      console.log(appStore.previewFloorItem)
      if(e.button==3){appStore.previewFloorItem = null; return;}
      appStore.floorItems.push(appStore.previewFloorItem!)
      appStore.hoveredElementId = Number(appStore.previewFloorItem!.id);
      appStore.previewFloorItem = new ElectricalElement(appStore.previewFloorItem!.type,[
        BigInt(appStore.gridPointer[0]),
        BigInt(appStore.gridPointer[1])
      ])
    };
    const handleMouseMove = (e: MouseEvent) => {

      appStore.gridPointer = mouseCanvasPositionSnapped(canvas, e);
      appStore.hoveredElementId = findHoverEElementId(appStore.gridPointer);

      if (appStore.previewFloorItem)
        appStore.previewFloorItem.position = [
      BigInt(appStore.gridPointer[0]),
      BigInt(appStore.gridPointer[1]),
      ]
    };

    function mouseCanvasPositionSnapped(
      canvas: HTMLCanvasElement,
      e: MouseEvent,
    ): [number, number] {
      const rect = canvas.getBoundingClientRect();
      const zoom = appStore.zoom || 1;
      const gridSize = (appStore.gridSize || 20) * zoom;

      // raw mouse position relative to canvas
      const xRaw =
        ((e.clientX - rect.left) / (rect.right - rect.left)) * canvas.width;
      const yRaw =
        ((e.clientY - rect.top) / (rect.bottom - rect.top)) * canvas.height;

      // snap to nearest grid intersection
      const x = Math.round(xRaw / gridSize) * gridSize;
      const y = Math.round(yRaw / gridSize) * gridSize;

      return [x, y];
    }


    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomFactor = 1.1;
      if (e.deltaY < 0) appStore.zoom *= zoomFactor;
      else appStore.zoom /= zoomFactor;
      appStore.zoom = Math.min(Math.max(appStore.zoom, 0.1), 10);
    };

    canvas.addEventListener("contextmenu", e => e.preventDefault());
    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      clearInterval(redrawInterval);
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("wheel", handleWheel);
    };
  }, []);

  return (
    <div className="floorplan">
      <div className="sidebar">
        <div className="section">
          <div
            className="section-header"
            onClick={() => toggleOpen("structural")}
          >
            Structural
          </div>
          <div
            className={`section-content ${openSections.structural ? "open" : ""}`}
            ref={structuralRef}
          />
        </div>
        <div className="section">
          <div className="section-header" onClick={() => toggleOpen("wiring")}>
            Wiring
          </div>
          <div
            className={`section-content ${openSections.wiring ? "open" : ""}`}
            ref={wiringRef}
          />
        </div>
        <div className="section">
          <div className="section-header" onClick={() => toggleOpen("panels")}>
            Panels
          </div>
          <div
            className={`section-content ${openSections.panels ? "open" : ""}`}
            ref={panelsRef}
          />
        </div>
      </div>

      <div className="canvas-container">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}
