import { useNavigate } from "react-router-dom";
import './top-bar.scss';

export default function TopBar() {
  const navigate = useNavigate();

  return (
    <div className="topbar">
      <div className="logo" onClick={() => navigate("/")}>
        GreenWall CAD
      </div>
      <div className="menu-buttons">
        <button onClick={() => navigate("/")}>Home</button>
        <button onClick={() => navigate("/simulation")}>Simulation</button>
        <button onClick={() => navigate("/floor-planning")}>Floor Plan</button>
      </div>
    </div>
  );
}
