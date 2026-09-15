import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { NuruHome, tweenBalance } from "./components/NuruHome";
import { PhoneChrome } from "./components/PhoneChrome";
import { type SheetPhase, TopUpSheet } from "./components/TopUpSheet";
import { easeOutSoft, easeSpring, phases } from "./theme";

const PHONE_FULL = "712000000";

function phoneAtFrame(frame: number): string {
  if (frame < phases.typing) return "";
  const elapsed = frame - phases.typing;
  const count = Math.min(PHONE_FULL.length, Math.floor(elapsed / 6) + 1);
  return PHONE_FULL.slice(0, count);
}

function sheetPhase(frame: number): SheetPhase {
  if (frame < phases.sheetOffer) return "hidden";
  if (frame < phases.payment) return "offer";
  if (frame < phases.processing) return "payment";
  if (frame < phases.success) return "processing";
  if (frame < phases.homeUpdated + 20) return "success";
  return "hidden";
}

function pressPulse(frame: number, start: number, duration = 10): boolean {
  return frame >= start && frame < start + duration;
}

export const TopUpDemo: React.FC = () => {
  const frame = useCurrentFrame();

  const sheetOpen = frame >= phases.sheetOffer && frame < phases.homeUpdated;
  const sheetY = sheetOpen
    ? interpolate(frame, [phases.sheetOffer, phases.sheetOffer + 26], [1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: easeSpring,
      })
    : frame >= phases.homeUpdated
      ? interpolate(
          frame,
          [phases.homeUpdated, phases.homeUpdated + 20],
          [0, 1],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: easeOutSoft,
          },
        )
      : 1;

  const mediumSelected = frame >= phases.selectMedium;
  const phoneDigits = phoneAtFrame(frame);
  const phase = sheetPhase(frame);

  const balance =
    frame >= phases.homeUpdated
      ? tweenBalance(frame, phases.homeUpdated, 28, 1250, 1800)
      : 1250;

  const topUpPressed = pressPulse(frame, phases.tap, 12);
  const ledgerTopUp = frame >= phases.homeUpdated + 6;

  const press = {
    medium: pressPulse(frame, phases.selectMedium, 12),
    continue: pressPulse(frame, phases.continueTap, 12),
    buy: pressPulse(frame, phases.buyTap, 12),
    done: pressPulse(frame, phases.doneTap, 12),
  };

  return (
    <AbsoluteFill style={{ backgroundColor: "transparent" }}>
      <PhoneChrome>
        <NuruHome
          balance={balance}
          topUpPressed={topUpPressed}
          ledgerTopUp={ledgerTopUp}
        />
        <TopUpSheet
          phase={phase}
          sheetY={sheetY}
          mediumSelected={mediumSelected}
          phoneDigits={phoneDigits}
          frame={frame}
          press={press}
        />
      </PhoneChrome>
    </AbsoluteFill>
  );
};
