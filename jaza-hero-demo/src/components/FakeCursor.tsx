import React from "react";
import { colors } from "../theme";

type FakeCursorProps = {
  x: number;
  y: number;
  visible: boolean;
  pressed?: boolean;
};

/** Subtle tap indicator for CTA presses */
export const FakeCursor: React.FC<FakeCursorProps> = ({
  x,
  y,
  visible,
  pressed,
}) => {
  if (!visible) return null;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: pressed ? 64 : 48,
        height: pressed ? 64 : 48,
        marginLeft: pressed ? -32 : -24,
        marginTop: pressed ? -32 : -24,
        borderRadius: "50%",
        backgroundColor: pressed
          ? "rgba(45, 212, 191, 0.35)"
          : "rgba(255,255,255,0.2)",
        border: `2px solid ${colors.primary}`,
        pointerEvents: "none",
        zIndex: 50,
      }}
    />
  );
};
