import { appStore } from "../storage/state";

// Draw all floor plan elements on the canvas
export function redrawAllFloorPlan() {
  const ctx = appStore.ctx;
  if (!ctx) return;

  const zoom = appStore.zoom || 1;
  const offsetX = appStore.offset?.[0] || 0;
  const offsetY = appStore.offset?.[1] || 0;
  const baseGridSize = appStore.gridSize || 20;

  const gridSize = baseGridSize * zoom;

  // Clear canvas
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  // Draw grid
  ctx.strokeStyle = "#eee";
  for (let x = 0; x < ctx.canvas.width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x + offsetX, 0 + offsetY);
    ctx.lineTo(x + offsetX, ctx.canvas.height + offsetY);
    ctx.stroke();
  }
  for (let y = 0; y < ctx.canvas.height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0 + offsetX, y + offsetY);
    ctx.lineTo(ctx.canvas.width + offsetX, y + offsetY);
    ctx.stroke();
  }

  // Draw each floor plan element
  appStore.floorItems.forEach((el: any) => {
    ctx.save();
    ctx.translate(el.position[0] * zoom + offsetX, el.position[1] * zoom + offsetY);

    const sizeFactor = zoom; // scale elements
    switch (el.type) {
      case "Wall":
        ctx.fillStyle = "#888";
        ctx.fillRect(0, 0, 80 * sizeFactor, 10 * sizeFactor);
        break;
      case "Door":
        ctx.fillStyle = "#654321";
        ctx.fillRect(0, 0, 40 * sizeFactor, 10 * sizeFactor);
        break;
      case "Window":
        ctx.fillStyle = "#00f";
        ctx.fillRect(0, 0, 40 * sizeFactor, 5 * sizeFactor);
        break;
      case "Socket":
        ctx.fillStyle = "#f00";
        ctx.beginPath();
        ctx.arc(0, 0, 5 * sizeFactor, 0, Math.PI * 2);
        ctx.fill();
        break;
      case "Switch":
        ctx.fillStyle = "#0f0";
        ctx.fillRect(0, 0, 10 * sizeFactor, 10 * sizeFactor);
        break;
      case "Wire":
        if (el.from && el.to) {
          ctx.strokeStyle = "#000";
          ctx.lineWidth = 2 * sizeFactor;
          ctx.beginPath();
          ctx.moveTo(el.from[0] * zoom + offsetX, el.from[1] * zoom + offsetY);
          ctx.lineTo(el.to[0] * zoom + offsetX, el.to[1] * zoom + offsetY);
          ctx.stroke();
        }
        break;
      case "Electrical Box":
        ctx.fillStyle = "#ff0";
        ctx.fillRect(0, 0, 30 * sizeFactor, 30 * sizeFactor);
        break;
    }

    ctx.restore();
  });

  // Draw preview element (following mouse)
  if (appStore.previewFloorItem) {
    const el = appStore.previewFloorItem;
    ctx.save();
    ctx.translate(el.position[0] * zoom + offsetX, el.position[1] * zoom + offsetY);
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = "#aaa";
    ctx.fillRect(0, 0, 30 * zoom, 30 * zoom); // simple preview
    ctx.restore();
  }

  // Draw scale at top-right corner
  ctx.save();
  ctx.fillStyle = "#000";
  ctx.font = "14px Arial";

  // Example conversion: 1 grid unit = 0.5 meters
  const metersPerGrid = 0.5;
  const scaleMeters = (baseGridSize * zoom) / baseGridSize * metersPerGrid;
  ctx.fillText(`Scale: 1:${1000 / scaleMeters}`, ctx.canvas.width - 120, 20);

  ctx.restore();
}
