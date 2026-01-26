import { IntegratedCircuit } from "../model/circuit"
import { IC_STORAGE } from "../util/constants"

export function saveCircuitAsName(ic: IntegratedCircuit, name: string): void {
  const raw = localStorage.getItem(IC_STORAGE);
  const store: Record<string, unknown> = raw ? JSON.parse(raw) : {};

  store[name] = ic.toJSON();
  localStorage.setItem(IC_STORAGE, JSON.stringify(store));
}

export function loadCircuitByName(name: string): IntegratedCircuit {
  const raw = localStorage.getItem(IC_STORAGE);
  if (!raw) throw new Error("No circuits stored");

  const store = JSON.parse(raw) as Record<string, unknown>;
  const json = store[name];
  if (!json) throw new Error("Circuit not found");

  return IntegratedCircuit.fromJSON(json as Record<string, unknown>);
}
