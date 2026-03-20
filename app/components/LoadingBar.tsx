"use client";

import { useEffect, useState } from "react";

export default function LoadingBar() {
  const [progress, setProgress] = useState(0);
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    // Plynulé načítání od 0 → ~70 % za ~2.5 s
    const target = 68 + Math.random() * 6; // 68–74 %
    const duration = 2500;
    const interval = 30;
    const steps = duration / interval;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      // easeOutCubic — rychle na začátku, zpomalí ke konci
      const t = step / steps;
      const eased = 1 - Math.pow(1 - t, 3);
      const current = eased * target;

      setProgress(current);

      if (step >= steps) {
        clearInterval(timer);
        setProgress(target);
        setStuck(true);
      }
    }, interval);

    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className="loading-bar-wrapper"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
      }}
    >
      {/* Track */}
      <div
        style={{
          width: "min(320px, 85vw)",
          height: 8,
          borderRadius: 99,
          background: "rgba(255,255,255,0.15)",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Fill */}
        <div
          className={stuck ? "loading-bar-fill" : undefined}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            height: "100%",
            width: `${progress}%`,
            borderRadius: 99,
            background: "linear-gradient(90deg, #fb923c, #f97316)",
            transition: stuck ? undefined : "width 30ms linear",
            overflow: "hidden",
          }}
        >
          {/* Shimmer */}
          <div
            className="loading-bar-shimmer"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "40%",
              height: "100%",
              background:
                "linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)",
            }}
          />
        </div>
      </div>

      {/* Label */}
      <p
        style={{
          margin: 0,
          fontSize: 13,
          fontFamily: "var(--font-montserrat)",
          fontWeight: 600,
          color: "rgba(255,255,255,0.45)",
          letterSpacing: "0.18em",
          textTransform: "uppercase",
        }}
      >
        makkám na tom...
      </p>
    </div>
  );
}
