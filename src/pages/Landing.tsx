import { Link } from "react-router-dom";
import "./landing.scss";

export default function Landing() {
  return (
    <div className="landing">
      <header className="hero">
        <h1>ForestCAD</h1>
        <p>
          Professional CAD software for schematics, blueprints, diagrams and
          simulations of electrical, electronic and logic systems.
        </p>
      </header>

      <section className="choices">
        <div className="card">
          <h2>Integrated Logic Circuit</h2>
          <p>
            Design, simulate and validate logic gates, flip-flops and integrated
            digital systems.
          </p>
          <Link to="/simulation"><button>Open</button></Link>
        </div>

        <div className="card">
          <h2>Electrical Floor Plan</h2>
          <p>
            Plan real-world electrical installations for buildings and field
            work.
          </p>
          <button>Open</button>
        </div>

        <div className="card">
          <h2>Electrical Circuit</h2>
          <p>
            Create precise electrical schematics with components, signals and
            simulations.
          </p>
          <button>Open</button>
        </div>
      </section>

      <footer className="footer">
        Engineering-grade CAD for design, planning and simulation.
      </footer>
    </div>
  );
}
