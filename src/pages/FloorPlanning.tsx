import { useEffect, useRef, useState } from "react";
import { appStore, clearStates } from "../storage/state";
import { redrawAllFloorPlan } from "../util/draw-floorplan";
import { mouseCanvasPosition, mouseDownInEditMode } from "../util/mouse";
import "./floor-planning.scss";

export default function FloorPlanning() {
  const [openSections, setOpenSections] = useState({
    structural: true,
    wiring: true,
    panels: true
  });

  const structuralRef = useRef<HTMLDivElement>(null);
  const wiringRef = useRef<HTMLDivElement>(null);
  const panelsRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const toggleOpen = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const renderButtons = () => {
    if (structuralRef.current) {
      structuralRef.current.innerHTML = "";
      ["Wall", "Door", "Window"].forEach(item => {
        const btn = document.createElement("button");
        btn.innerText = item;
        btn.onclick = () => appStore.previewFloorItem = { type: item, position: [0, 0] };
        structuralRef.current!.appendChild(btn);
      });
    }

    if (wiringRef.current) {
      wiringRef.current.innerHTML = "";
      ["Socket", "Switch", "Wire"].forEach(item => {
        const btn = document.createElement("button");
        btn.innerText = item;
        btn.onclick = () => appStore.previewFloorItem = { type: item, position: [0, 0] };
        wiringRef.current!.appendChild(btn);
      });
    }

    if (panelsRef.current) {
      panelsRef.current.innerHTML = "";
      ["Electrical Box"].forEach(item => {
        const btn = document.createElement("button");
        btn.innerText = item;
        btn.onclick = () => appStore.previewFloorItem = { type: item, position: [0, 0] };
        panelsRef.current!.appendChild(btn);
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

    const handleMouseDown = (e: MouseEvent) => mouseDownInEditMode(canvas, e);

    const handleMouseMove = (e: MouseEvent) => {
      appStore.gridPointer = mouseCanvasPosition(canvas, e);
      if (appStore.previewFloorItem)
        appStore.previewFloorItem.position = appStore.gridPointer;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomFactor = 1.1;
      if (e.deltaY < 0) appStore.zoom *= zoomFactor;
      else appStore.zoom /= zoomFactor;
      appStore.zoom = Math.min(Math.max(appStore.zoom, 0.1), 10);
    };

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
          <div className="section-header" onClick={() => toggleOpen("structural")}>
            Structural
          </div>
          <div className={`section-content ${openSections.structural ? "open" : ""}`} ref={structuralRef}/>
        </div>
        <div className="section">
          <div className="section-header" onClick={() => toggleOpen("wiring")}>
            Wiring
          </div>
          <div className={`section-content ${openSections.wiring ? "open" : ""}`} ref={wiringRef}/>
        </div>
        <div className="section">
          <div className="section-header" onClick={() => toggleOpen("panels")}>
            Panels
          </div>
          <div className={`section-content ${openSections.panels ? "open" : ""}`} ref={panelsRef}/>
        </div>
      </div>

      <div className="canvas-container">
        <canvas ref={canvasRef}/>
      </div>
    </div>
  );
}
