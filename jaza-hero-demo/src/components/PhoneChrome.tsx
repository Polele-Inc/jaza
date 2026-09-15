import React from "react";
import { AbsoluteFill } from "remotion";
import { colors } from "../theme";

const PHONE_W = 920;
const PHONE_H = 1780;
const RADIUS = 72;

type PhoneChromeProps = {
  children: React.ReactNode;
};

/** Soft iPhone-like bezel; composition outside stays transparent. */
export const PhoneChrome: React.FC<PhoneChromeProps> = ({ children }) => {
  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "transparent",
      }}
    >
      <div
        style={{
          width: PHONE_W,
          height: PHONE_H,
          borderRadius: RADIUS,
          backgroundColor: colors.phoneBezel,
          border: `6px solid ${colors.phoneRim}`,
          boxShadow: "0 40px 120px rgba(0,0,0,0.55)",
          overflow: "hidden",
          position: "relative",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Dynamic island */}
        <div
          style={{
            position: "absolute",
            top: 18,
            left: "50%",
            transform: "translateX(-50%)",
            width: 180,
            height: 42,
            borderRadius: 24,
            backgroundColor: "#000",
            zIndex: 20,
          }}
        />
        {/* Status bar */}
        <div
          style={{
            height: 78,
            paddingTop: 28,
            paddingLeft: 48,
            paddingRight: 48,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            color: colors.onSurface,
            fontSize: 26,
            fontWeight: 600,
            fontFamily:
              'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
            zIndex: 10,
          }}
        >
          <span>9:41</span>
          <span style={{ fontSize: 22, color: colors.onSurfaceVariant }}>
            ●●●● ▮
          </span>
        </div>
        <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
          {children}
        </div>
        {/* Home indicator */}
        <div
          style={{
            position: "absolute",
            bottom: 14,
            left: "50%",
            transform: "translateX(-50%)",
            width: 200,
            height: 8,
            borderRadius: 4,
            backgroundColor: "rgba(255,255,255,0.35)",
            zIndex: 20,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
