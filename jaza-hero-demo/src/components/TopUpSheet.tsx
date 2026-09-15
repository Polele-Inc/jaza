import React from "react";
import { interpolate } from "remotion";
import {
  S,
  colors,
  easeOutSoft,
  easeSpring,
  font,
  iconSize,
  phases,
  radius,
  spacing,
  type,
} from "../theme";
import {
  IconArrowBack,
  IconBolt,
  IconCheck,
  IconCheckCircle,
  IconExpandMore,
  IconLock,
} from "./Icons";

export type SheetPhase =
  | "hidden"
  | "offer"
  | "payment"
  | "processing"
  | "success";

type PressTargets = {
  continue?: boolean;
  buy?: boolean;
  done?: boolean;
  medium?: boolean;
};

type TopUpSheetProps = {
  phase: SheetPhase;
  sheetY: number;
  mediumSelected: boolean;
  phoneDigits: string;
  frame: number;
  press?: PressTargets;
};

const packs = [
  { id: "starter", label: "Starter", credits: "100", price: "$1.00" },
  { id: "medium", label: "Medium", credits: "550", price: "$5.00" },
  { id: "pro", label: "Pro", credits: "1,200", price: "$10.00" },
] as const;

function stepMotion(
  frame: number,
  active: boolean,
  appearAt: number,
  exitAt?: number,
) {
  const enterEnd = appearAt + 16;
  let opacity = 0;
  let y = 24;

  if (active || (exitAt != null && frame >= appearAt && frame < exitAt + 14)) {
    opacity = interpolate(frame, [appearAt, enterEnd], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: easeOutSoft,
    });
    y = interpolate(frame, [appearAt, enterEnd], [28, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: easeOutSoft,
    });
  }

  if (exitAt != null && frame >= exitAt) {
    opacity = interpolate(frame, [exitAt, exitAt + 12], [1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: easeOutSoft,
    });
    y = interpolate(frame, [exitAt, exitAt + 12], [0, -16], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: easeOutSoft,
    });
  }

  return { opacity, translate: `0 ${y}px` };
}

export const TopUpSheet: React.FC<TopUpSheetProps> = ({
  phase,
  sheetY,
  mediumSelected,
  phoneDigits,
  frame,
  press,
}) => {
  if (phase === "hidden" && sheetY >= 0.99) return null;

  const showShell = phase !== "hidden" || sheetY < 0.99;
  if (!showShell) return null;

  const offerM = stepMotion(
    frame,
    phase === "offer",
    phases.sheetOffer,
    phases.payment,
  );
  const paymentM = stepMotion(
    frame,
    phase === "payment",
    phases.payment,
    phases.processing,
  );
  const processingM = stepMotion(
    frame,
    phase === "processing",
    phases.processing,
    phases.success,
  );
  const successM = stepMotion(
    frame,
    phase === "success",
    phases.success,
    phases.homeUpdated,
  );

  // Offer needs room for pack list; payment hugs content (no empty bottom void)
  const tall =
    phase === "offer" ||
    (phase === "payment" && frame < phases.payment + 8) ||
    (frame >= phases.sheetOffer && frame < phases.payment);

  const sheetHeight = tall
    ? "85%"
    : phase === "payment"
      ? "auto"
      : "58%";

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        fontFamily: font,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: `rgba(12,15,15,${0.72 * (1 - sheetY)})`,
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          translate: `0 ${sheetY * 980}px`,
          backgroundColor: colors.surfaceContainer,
          borderTopLeftRadius: radius.xl + 8,
          borderTopRightRadius: radius.xl + 8,
          border: `1px solid ${colors.outlineVariant}`,
          borderBottom: "none",
          paddingTop: spacing.sm,
          paddingLeft: spacing.gutter,
          paddingRight: spacing.gutter,
          // Home-indicator clearance only
          paddingBottom: spacing.sm,
          height: sheetHeight,
          maxHeight: "85%",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: Math.round(36 * S),
            height: Math.round(4 * S),
            borderRadius: radius.full,
            backgroundColor: colors.outlineVariant,
            alignSelf: "center",
            marginBottom: spacing.sm,
            flexShrink: 0,
          }}
        />

        <div
          style={{
            position: "relative",
            flex: phase === "payment" ? undefined : 1,
            minHeight: phase === "payment" ? undefined : 0,
          }}
        >
          <StepLayer motion={offerM} fill={phase !== "payment"}>
            <OfferStep
              mediumSelected={mediumSelected}
              continuePressed={press?.continue}
              mediumPressed={press?.medium}
            />
          </StepLayer>
          <StepLayer motion={paymentM} fill={false}>
            <PaymentStep phoneDigits={phoneDigits} buyPressed={press?.buy} />
          </StepLayer>
          <StepLayer motion={processingM} fill={phase !== "payment"}>
            <ProcessingStep frame={frame} />
          </StepLayer>
          <StepLayer motion={successM} fill={phase !== "payment"}>
            <SuccessStep frame={frame} donePressed={press?.done} />
          </StepLayer>
        </div>
      </div>
    </div>
  );
};

function StepLayer({
  motion,
  children,
  fill = true,
}: {
  motion: { opacity: number; translate: string };
  children: React.ReactNode;
  /** When false, participate in normal flow so the sheet can hug content */
  fill?: boolean;
}) {
  if (motion.opacity <= 0.01) return null;
  return (
    <div
      style={{
        position: fill ? "absolute" : "relative",
        inset: fill ? 0 : undefined,
        width: "100%",
        opacity: motion.opacity,
        translate: motion.translate,
        display: "flex",
        flexDirection: "column",
        gap: spacing.sm,
        overflow: "hidden",
      }}
    >
      {children}
    </div>
  );
}

function OfferStep({
  mediumSelected,
  continuePressed,
  mediumPressed,
}: {
  mediumSelected: boolean;
  continuePressed?: boolean;
  mediumPressed?: boolean;
}) {
  return (
    <>
      <BalanceMini credits="1,250" />
      <h2
        style={{
          margin: `${spacing.sm}px 0 0`,
          fontSize: type.title,
          fontWeight: 600,
          color: colors.onSurface,
        }}
      >
        Top-up Credits
      </h2>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: spacing.sm,
          flex: 1,
          overflow: "hidden",
        }}
      >
        {packs.map((p) => {
          const selected = mediumSelected && p.id === "medium";
          const pressed = mediumPressed && p.id === "medium";
          return (
            <div
              key={p.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: spacing.md,
                borderRadius: radius.xl,
                backgroundColor: colors.surfaceContainerLow,
                border: `${selected ? 3 : 2}px solid ${
                  selected ? colors.bundleBorderSelected : colors.bundleBorder
                }`,
                scale: pressed ? 0.98 : 1,
              }}
            >
              <div>
                <p
                  style={{
                    margin: 0,
                    fontSize: type.body,
                    fontWeight: 700,
                    color: selected
                      ? colors.primaryContainer
                      : colors.onSurface,
                  }}
                >
                  {p.label}
                </p>
                <p
                  style={{
                    margin: `${spacing.xs}px 0 0`,
                    fontSize: type.label,
                    color: colors.onSurfaceVariant,
                  }}
                >
                  {p.credits} credits
                </p>
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: type.body,
                  fontWeight: 600,
                  color: colors.onSurface,
                }}
              >
                {p.price}
              </p>
            </div>
          );
        })}
      </div>
      <div
        style={{
          marginTop: spacing.sm,
          paddingTop: spacing.md,
          paddingBottom: spacing.md,
          borderRadius: radius.full,
          backgroundColor: mediumSelected
            ? colors.primaryContainer
            : colors.surfaceContainerHigh,
          color: mediumSelected
            ? colors.onPrimaryContainer
            : colors.onSurfaceVariant,
          opacity: mediumSelected ? 1 : 0.55,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: type.body,
          fontWeight: 700,
          scale: continuePressed ? 0.96 : 1,
          flexShrink: 0,
        }}
      >
        Continue with Medium
      </div>
    </>
  );
}

function PaymentStep({
  phoneDigits,
  buyPressed,
}: {
  phoneDigits: string;
  buyPressed?: boolean;
}) {
  const predicted = phoneDigits.length >= 6;
  const canSubmit = predicted;
  const fieldMinH = Math.round(64 * S);
  const labelSize = Math.round(12 * S);
  const dialSize = Math.round(18 * S);

  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: spacing.lg,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: spacing.sm,
            flex: 1,
            minWidth: 0,
          }}
        >
          <div
            style={{
              width: Math.round(40 * S),
              height: Math.round(40 * S),
              borderRadius: radius.full,
              backgroundColor: colors.surfaceContainer,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <IconArrowBack
              size={iconSize.back}
              color={colors.onSurfaceVariant}
            />
          </div>
          <span
            style={{
              fontSize: type.title,
              fontWeight: 600,
              color: colors.onSurface,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            Medium
          </span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: spacing.xs,
            paddingLeft: spacing.sm,
            paddingRight: spacing.sm,
            paddingTop: spacing.xs,
            paddingBottom: spacing.xs,
            borderRadius: radius.full,
            backgroundColor: colors.surfaceContainer,
            fontSize: labelSize,
            fontWeight: 500,
            color: colors.primary,
            flexShrink: 0,
          }}
        >
          <IconBolt size={iconSize.boltSm} color={colors.primary} />
          1,250
        </div>
      </div>

      {/* PhoneDigitInput: Country + Phone on one row */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "stretch",
          gap: spacing.sm,
          width: "100%",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            flexShrink: 0,
            minWidth: Math.round(100 * S),
            backgroundColor: colors.surfaceContainerHigh,
            borderRadius: radius.lg,
            paddingLeft: spacing.md,
            paddingRight: spacing.md,
            paddingTop: spacing.sm,
            paddingBottom: spacing.sm,
            minHeight: fieldMinH,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              color: colors.onSurfaceVariant,
              fontSize: labelSize,
              fontWeight: 500,
              marginBottom: spacing.xs,
            }}
          >
            Country
          </span>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: spacing.xs,
            }}
          >
            <span
              style={{
                color: colors.onSurface,
                fontSize: dialSize,
                fontWeight: 700,
              }}
            >
              +254
            </span>
            <IconExpandMore
              size={iconSize.chevron}
              color={colors.onSurfaceVariant}
            />
          </div>
        </div>

        <div
          style={{
            flex: 1,
            minWidth: 0,
            backgroundColor: colors.surfaceContainerHigh,
            borderRadius: radius.lg,
            paddingLeft: spacing.md,
            paddingRight: spacing.md,
            paddingTop: spacing.sm,
            paddingBottom: spacing.sm,
            minHeight: fieldMinH,
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.sm,
            border: `1px solid ${colors.primaryContainer}`,
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <span
              style={{
                display: "block",
                color: colors.onSurfaceVariant,
                fontSize: labelSize,
                fontWeight: 500,
                marginBottom: spacing.xs,
              }}
            >
              Phone Number
            </span>
            <span
              style={{
                display: "block",
                color: phoneDigits ? colors.onSurface : colors.onSurfaceVariant,
                fontSize: Math.round(18 * 1.15 * S),
                fontWeight: 600,
                fontVariantNumeric: "tabular-nums",
                lineHeight: 1.2,
              }}
            >
              {phoneDigits || "Enter number"}
            </span>
          </div>
          {predicted ? (
            <IconCheckCircle size={iconSize.chevron} color={colors.primary} />
          ) : null}
        </div>
      </div>

      {predicted ? (
        <p
          style={{
            margin: `${spacing.sm}px 0 0`,
            color: colors.primaryContainer,
            fontSize: Math.round(14 * S),
            fontWeight: 500,
            flexShrink: 0,
          }}
        >
          M-Pesa
        </p>
      ) : null}

      <div
        style={{
          marginTop: spacing.lg,
          backgroundColor: colors.surfaceContainerLow,
          borderRadius: radius.xl,
          border: `1px solid ${colors.outlineVariant}`,
          padding: spacing.md,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: spacing.md,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: spacing.xs,
            }}
          >
            <span
              style={{
                color: colors.primaryContainer,
                fontSize: dialSize,
                fontWeight: 600,
              }}
            >
              KES
            </span>
            <IconExpandMore
              size={Math.round(20 * S)}
              color={colors.primaryContainer}
            />
          </div>
          <span
            style={{
              color: colors.onSurface,
              fontSize: dialSize,
              fontWeight: 600,
            }}
          >
            $5.00
          </span>
        </div>
        <div
          style={{
            backgroundColor: colors.primaryContainer,
            borderRadius: radius.full,
            paddingTop: spacing.md,
            paddingBottom: spacing.md,
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: spacing.sm,
            opacity: canSubmit ? 1 : 0.5,
            scale: buyPressed ? 0.96 : 1,
          }}
        >
          <IconLock size={iconSize.lock} color={colors.onPrimaryContainer} />
          <span
            style={{
              color: colors.onPrimaryContainer,
              fontSize: type.body,
              fontWeight: 600,
            }}
          >
            Buy $5.00
          </span>
        </div>
      </div>
    </>
  );
}

function ProcessingStep({ frame }: { frame: number }) {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: spacing.md,
        padding: spacing.lg,
      }}
    >
      <div
        style={{
          width: Math.round(48 * 2.35),
          height: Math.round(48 * 2.35),
          borderRadius: "50%",
          border: `${Math.round(3 * 2.35)}px solid ${colors.outlineVariant}`,
          borderTopColor: colors.primaryContainer,
          rotate: `${(frame * 12) % 360}deg`,
        }}
      />
      <p
        style={{
          margin: 0,
          fontSize: type.title,
          fontWeight: 700,
          color: colors.onSurface,
          textAlign: "center",
        }}
      >
        Processing payment...
      </p>
      <p
        style={{
          margin: 0,
          fontSize: type.body,
          color: colors.onSurfaceVariant,
          textAlign: "center",
        }}
      >
        Please authorize on your device
      </p>
    </div>
  );
}

function SuccessStep({
  frame,
  donePressed,
}: {
  frame: number;
  donePressed?: boolean;
}) {
  const pop = interpolate(
    frame,
    [phases.success, phases.success + 18],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: easeSpring,
      output: "perceptual-scale",
    },
  );

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: spacing.md,
        padding: spacing.lg,
      }}
    >
      <div
        style={{
          width: Math.round(56 * 2.35),
          height: Math.round(56 * 2.35),
          borderRadius: "50%",
          backgroundColor: "rgba(69,223,164,0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          scale: pop,
        }}
      >
        <IconCheck size={iconSize.check} color={colors.success} />
      </div>
      <p
        style={{
          margin: 0,
          fontSize: type.title,
          fontWeight: 700,
          color: colors.onSurface,
          textAlign: "center",
        }}
      >
        Top-up Successful
      </p>
      <p
        style={{
          margin: 0,
          fontSize: type.body,
          color: colors.onSurfaceVariant,
          textAlign: "center",
          maxWidth: 520,
        }}
      >
        550 credits have been added to your balance.
      </p>
      <div
        style={{
          marginTop: spacing.md,
          width: "70%",
          paddingTop: spacing.md,
          paddingBottom: spacing.md,
          borderRadius: radius.full,
          backgroundColor: colors.surfaceContainerHigh,
          color: colors.onSurface,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: type.body,
          fontWeight: 700,
          scale: donePressed ? 0.96 : 1,
        }}
      >
        Done
      </div>
    </div>
  );
}

function BalanceMini({ credits }: { credits: string }) {
  return (
    <div
      style={{
        borderRadius: radius.xl,
        backgroundColor: colors.surfaceContainerLow,
        padding: spacing.md,
        flexShrink: 0,
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: type.label,
          color: colors.onSurfaceVariant,
          marginBottom: spacing.xs,
        }}
      >
        Current Balance
      </p>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: spacing.sm,
        }}
      >
        <IconBolt size={iconSize.bolt} color={colors.primary} />
        <span
          style={{
            fontSize: Math.round(36 * 2.35),
            fontWeight: 700,
            color: colors.onSurface,
            letterSpacing: -1,
          }}
        >
          {credits}
        </span>
      </div>
    </div>
  );
}
