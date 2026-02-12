import "./HeroPrinter.css";

export default function HeroPrinter() {
  return (
    <div className="printer3d-scene">

      {/* Ambient glow */}
      <div className="printer3d-glow" />

      {/* HUD overlay */}
      <div className="printer3d-hud">
        <div className="hud-row">
          <span>NOZZLE TEMP</span>
          <span className="hud-val">215°C</span>
        </div>
        <div className="hud-row">
          <span>BED TEMP</span>
          <span className="hud-val">60°C</span>
        </div>
        <div className="hud-row">
          <span>SPEED</span>
          <span className="hud-val">180 mm/s</span>
        </div>
        <div className="hud-row">
          <span>LAYER</span>
          <span className="hud-val">0.2 mm</span>
        </div>
        <div className="hud-row">
          <span>PRINTING</span>
          <div className="hud-dot" />
        </div>
        <div className="hud-progress">
          <div className="hud-progress-fill" />
        </div>
      </div>

      {/* Main printer structure */}
      <div className="printer3d-wrapper">

        {/* Filament spool */}
        <div className="spool">
          <div className="spool-ring" />
          <div className="spool-center" />
        </div>

        {/* Frame rails */}
        <div className="printer3d-frame">
          <div className="rail-left" />
          <div className="rail-right" />
          <div className="rail-top" />
        </div>

        {/* Moving gantry + hotend */}
        <div className="gantry">
          <div className="hotend">
            <div className="hotend-body" />
            <div className="hotend-block" />
            <div className="hotend-nozzle" />
            <div className="filament-drop" />
          </div>
        </div>

        {/* Growing printed object */}
        <div className="printed-object">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="layer" />
          ))}
        </div>

        {/* Print bed */}
        <div className="print-bed" />

        {/* Sparks */}
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="spark" />
        ))}

        {/* Corner brackets */}
        <div className="corner corner-tl" />
        <div className="corner corner-tr" />
        <div className="corner corner-bl" />
        <div className="corner corner-br" />

      </div>
    </div>
  );
}