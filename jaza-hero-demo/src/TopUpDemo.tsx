import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
} from "remotion";
import { FakeCursor } from "./components/FakeCursor";
import { NuruHome, tweenBalance } from "./components/NuruHome";
import { PhoneChrome } from "./components/PhoneChrome";
import { type SheetPhase, TopUpSheet } from "./components/TopUpSheet";
import { phases } from "./theme";

const PHONE_FULL = "712000000";

function phoneAtFrame(frame: number): string {
  if (frame < phases.typing) return "";
  const elapsed = frame - phases.typing;
  // ~3.5 digits per second at 30fps
  const count = Math.min(
    PHONE_FULL.length,
    Math.floor(elapsed / 6) + 1,
  );
  return PHONE_FULL.slice(0, count);
}

function sheetPhase(frame: number): SheetPhase {
  if (frame < phases.sheetOffer) return "hidden";
  if (frame < phases.payment) return "offer";
  if (frame < phases.processing) return "payment";
  if (frame < phases.success) return "processing";
  // Keep success visible while sheet slides away
  if (frame < phases.homeUpdated + 16) return "success";
  return "hidden";
}

export const TopUpDemo: React.FC = () => {
  const frame = useCurrentFrame();

  const sheetOpen = frame >= phases.sheetOffer && frame < phases.homeUpdated;
  const sheetY = sheetOpen
    ? interpolate(
        frame,
        [phases.sheetOffer, phases.sheetOffer + 18],
        [1, 0],
        {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.out(Easing.cubic),
        },
      )
    : frame >= phases.homeUpdated
      ? interpolate(
          frame,
          [phases.homeUpdated, phases.homeUpdated + 14],
          [0, 1],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.in(Easing.cubic),
          },
        )
      : 1;

  const mediumSelected = frame >= phases.selectMedium;
  const phoneDigits = phoneAtFrame(frame);
  const phase = sheetPhase(frame);

  const balance =
    frame >= phases.homeUpdated
      ? tweenBalance(frame, phases.homeUpdated, 24, 1250, 1800)
      : 1250;

  const showTopUpHighlight =
    frame >= phases.tap && frame < phases.sheetOffer + 8;
  const ledgerTopUp = frame >= phases.homeUpdated + 8;

  // Cursor positions (approx within phone content area)
  const cursor = cursorForFrame(frame);

  return (
    <AbsoluteFill style={{ backgroundColor: "transparent" }}>
      <PhoneChrome>
        <NuruHome
          balance={balance}
          showTopUpHighlight={showTopUpHighlight}
          ledgerTopUp={ledgerTopUp}
        />
        <TopUpSheet
          phase={phase}
          sheetY={sheetY}
          mediumSelected={mediumSelected}
          phoneDigits={phoneDigits}
          frame={frame}
        />
        <FakeCursor
          x={cursor.x}
          y={cursor.y}
          visible={cursor.visible}
          pressed={cursor.pressed}
        />
      </PhoneChrome>
    </AbsoluteFill>
  );
};

function cursorForFrame(frame: number): {
  x: number;
  y: number;
  visible: boolean;
  pressed: boolean;
} {
  // Content is inside phone; coordinates relative to phone screen (~920x~1700 content)
  if (frame >= phases.tap && frame < phases.sheetOffer) {
    return { x: 460, y: 520, visible: true, pressed: true };
  }
  if (frame >= phases.selectMedium && frame < phases.continueTap) {
    return { x: 460, y: 780, visible: true, pressed: frame < phases.selectMedium + 10 };
  }
  if (frame >= phases.continueTap && frame < phases.payment) {
    return { x: 460, y: 1180, visible: true, pressed: true };
  }
  if (frame >= phases.buyTap && frame < phases.processing) {
    return { x: 460, y: 1120, visible: true, pressed: true };
  }
  if (frame >= phases.doneTap && frame < phases.homeUpdated) {
    return { x: 460, y: 1100, visible: true, pressed: true };
  }
  return { x: 0, y: 0, visible: false, pressed: false };
}
