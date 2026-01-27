import { IC_STORAGE } from "../util/constants";

function ViewCircuits() {
    const raw = localStorage.getItem(IC_STORAGE);
    const store = raw ? JSON.parse(raw) : {};

    // Create a simple preformatted HTML display
    const pre = document.createElement("pre");
    pre.textContent = JSON.stringify(store, null, 2);

    document.body.appendChild(pre);
}

export default ViewCircuits;
