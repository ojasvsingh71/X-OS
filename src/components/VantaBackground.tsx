"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

type VantaEffect = {
  destroy: () => void;
};

export default function VantaBackground({
  children,
}: {
  children: React.ReactNode;
}) {
  const vantaRef = useRef<HTMLDivElement>(null);
  const [vantaEffect, setVantaEffect] = useState<VantaEffect | null>(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.net.min.js";
    script.async = true;

    script.onload = () => {
      const win = window as any;
      if (!vantaEffect && win.VANTA && win.VANTA.NET && vantaRef.current) {
        const effect = win.VANTA.NET({
          el: vantaRef.current,
          THREE: THREE,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.0,
          minWidth: 200.0,
          scale: 1.0,
          scaleMobile: 1.0,
          color: 0xfff5,
          backgroundColor: 0x000000,
          points: 20.0,
          maxDistance: 10.0,
          spacing: 20.0,
        });
        setVantaEffect(effect);
      }
    };

    document.body.appendChild(script);

    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, [vantaEffect]);

  return (
    <>
      <div
        ref={vantaRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100vh",
          zIndex: -1, 
          pointerEvents: "none", 
        }}
      />

      <div className="relative z-10 w-full min-h-screen">{children}</div>
    </>
  );
}
