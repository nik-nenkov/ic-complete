import {
  EEType,
  ElectricalElement,
} from "../model/electrical/ElectricalElement";
import { appStore } from "../storage/state";

// Draw all floor plan elements on the canvas
export function redrawAllFloorPlan() {
  const ctx = appStore.ctx;
  if (!ctx) return;
  const gridSize = appStore.gridSize * appStore.zoom;

  const imageMap = new Map<EEType, CanvasImageSource>();

  function preloadEEImages() {
    const entries: Record<EEType, string> = {
      [EEType.R]: "images/R.png",
      [EEType.L]: "images/L.png",
      [EEType.C]: "images/C.png",
    };

    for (const type of Object.values(EEType)) {
      const img = new Image();
      img.src = entries[type];
      imageMap.set(type, img);
    }
  }

  // call once, at startup
  preloadEEImages();
  // Clear canvas
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  // Draw grid
  ctx.strokeStyle = "#eee";
  for (let x = 0; x < ctx.canvas.width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, ctx.canvas.height);
    ctx.stroke();
  }
  ctx.reset;
  for (let y = 0; y < ctx.canvas.height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(ctx.canvas.width, y);
    ctx.stroke();
  }
  ctx.reset;

  // Draw each floor plan element
  appStore.floorItems.forEach((el: ElectricalElement) => {
    switch (el.type) {
      case EEType.R:
      case EEType.L:
      case EEType.C: {
        const size = 2 * gridSize;
        const img = imageMap.get(el.type) ?? new Image();
        ctx.drawImage(
          img,
          Number(el.position[0]) * gridSize,
          Number(el.position[1]) * gridSize,
          size,
          size,
        );
        el.getConnectors()?.forEach((c) => {
          ctx.beginPath();
          ctx.arc(
            Number(el.position[0]) * gridSize,
            Number(el.position[1]) * gridSize,
            2,
            0,
            Math.PI * 2,
          );

          ctx.fillStyle = "white";
          ctx.fill();

          ctx.strokeStyle =
            appStore.hoveredElementId == Number(el.id) ? "orange" : "black";
          ctx.lineWidth = 1;
          ctx.stroke();
        });
        break;
      }
    }
  });

  // Draw preview element (following mouse)
  if (appStore.previewFloorItem) {
    const el = appStore.previewFloorItem;
    ctx.fillStyle = "#232323";
    ctx.fillRect(
      Number(el.position[0]) * gridSize,
      Number(el.position[1]) * gridSize,
      2 * gridSize,
      2 * gridSize,
    );
  }
  drawRedDot();
}
function drawRedDot() {
  appStore.ctx!.fillStyle = "#f00";
  appStore.ctx!.beginPath();
  appStore.ctx!.arc(
    appStore.gridPointer[0],
    appStore.gridPointer[1],
    5,
    0,
    Math.PI * 2,
  );
  appStore.ctx!.fill();
}
