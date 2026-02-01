import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import CircuitSimulation from "./pages/CircuitSimulation";

import './styles/main.scss';
import FloorPlanning from "./pages/FloorPlanning";
import TopBar from "./common/TopBar";
import ElectricalCircuit from "./pages/ElectricalCircuit";

const container = document.getElementById("root");
if (!container) throw new Error("Root container missing");

createRoot(container).render(
  <React.StrictMode>
    <BrowserRouter>
      <TopBar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/simulation" element={<CircuitSimulation />} />
        <Route path="/floor-planning" element={<FloorPlanning />} />
        <Route path="/electrical-circuit" element={<ElectricalCircuit />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
