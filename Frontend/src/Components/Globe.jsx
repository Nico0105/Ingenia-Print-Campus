"use client";
import createGlobe from "cobe";
import { useEffect, useRef } from "react";

const Globe = ({
  className,
  theta = 0.25,
  dark = 1,
  scale = 1,
  diffuse = 0.4,
  mapSamples = 16000,
  mapBrightness = 1.2,
  baseColor = [1, 1, 1],
  markerColor = [251 / 255, 100 / 255, 21 / 255],
  glowColor = [1, 1, 1],
  markers = [
    { location: [14.5995, 120.9842], size: 0.03 },
    { location: [19.076, 72.8777], size: 0.1 },
    { location: [23.8103, 90.4125], size: 0.05 },
    { location: [30.0444, 31.2357], size: 0.07 },
    { location: [39.9042, 116.4074], size: 0.08 },
    { location: [-23.5505, -46.6333], size: 0.1 },
    { location: [19.4326, -99.1332], size: 0.1 },
    { location: [40.7128, -74.006], size: 0.1 },
    { location: [34.6937, 135.5022], size: 0.05 },
    { location: [41.0082, 28.9784], size: 0.06 },
  ],
}) => {
  const canvasRef = useRef(null);
  const phiRef = useRef(0);

  useEffect(() => {
    let width = 0;
    
    const onResize = () => {
      if (canvasRef.current) {
        width = canvasRef.current.offsetWidth;
      }
    };
    
    window.addEventListener("resize", onResize);
    onResize();

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: width * 2,
      height: width * 2,
      phi: 0,
      theta: 0,
      dark: dark,
      diffuse: diffuse,
      mapSamples: mapSamples,
      mapBrightness: mapBrightness,
      baseColor: typeof baseColor === "string" ? hexToRgb(baseColor) : baseColor,
      markerColor: typeof markerColor === "string" ? hexToRgb(markerColor) : markerColor,
      glowColor: typeof glowColor === "string" ? hexToRgb(glowColor) : glowColor,
      markers: markers,
      onRender: (state) => {
        // Rotación suave y constante
        phiRef.current += theta;
        state.phi = phiRef.current;
      },
    });

    setTimeout(() => {
      if (canvasRef.current) {
        canvasRef.current.style.opacity = "1";
      }
    });

    return () => {
      globe.destroy();
      window.removeEventListener("resize", onResize);
    };
  }, [dark, diffuse, mapSamples, mapBrightness, baseColor, markerColor, glowColor, markers, theta]);

  return (
    <div
      className={className}
      style={{
        width: "100%",
        maxWidth: 600,
        aspectRatio: 1,
        margin: "auto",
        position: "relative",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "100%",
          contain: "layout paint size",
          opacity: 0,
          transition: "opacity 1s ease",
          cursor: "default",
          pointerEvents: "none",
          userSelect: "none",
          WebkitUserSelect: "none",
          touchAction: "none",
        }}
      />
    </div>
  );
};

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16) / 255,
        parseInt(result[2], 16) / 255,
        parseInt(result[3], 16) / 255,
      ]
    : [1, 1, 1];
}

export default Globe;