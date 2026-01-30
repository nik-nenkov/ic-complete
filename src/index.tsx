import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import CircuitSimulation from "./pages/CircuitSimulation";

import './styles/main.scss';

const container = document.getElementById("root");
if (!container) throw new Error("Root container missing");

createRoot(container).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/simulation" element={<CircuitSimulation />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
