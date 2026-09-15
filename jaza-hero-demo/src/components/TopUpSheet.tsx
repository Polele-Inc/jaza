import React from "react";
import { colors } from "../theme";

export type SheetPhase =
  | "hidden"
  | "offer"
  | "payment"
  | "processing"
  | "success";

type TopUpSheetProps = {
  phase: SheetPhase;
  sheetY: number; // 0 = fully open, 1 = off-screen
  mediumSelected: boolean;
  phoneDigits: string;
  frame: number;
  opacity?: number;
};

const font =
  'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

const packs = [
  { id: "starter", label: "Starter", credits: "100", price: "$1.00" },
  { id: "medium", label: "Medium", credits: "550", price: "$5.00", hot: true },
  { id: "pro", label: "Pro", credits: "1,200", price: "$10.00" },
] as const;

export const TopUpSheet: React.FC<TopUpSheetProps> = ({
  phase,
  sheetY,
  mediumSelected,
  phoneDigits,
  frame,
  opacity = 1,
}) => {
  if (phase === "hidden") return null;

  const translateY = sheetY * 900;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        fontFamily: font,
        pointerEvents: "none",
        opacity,
      }}
    >
      {/* Scrim */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: `rgba(12,15,15,${0.72 * (1 - sheetY)})`,
        }}
      />

      {/* Sheet */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          transform: `translateY(${translateY}px)`,
          backgroundColor: colors.surfaceContainer,
          borderTopLeftRadius: 36,
          borderTopRightRadius: 36,
          border: `1px solid ${colors.outlineVariant}`,
          borderBottom: "none",
          padding: "20px 36px 100px",
          minHeight: phase === "offer" ? "72%" : "58%",
          maxHeight: "88%",
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        <div
          style={{
            width: 64,
            height: 8,
            borderRadius: 4,
            backgroundColor: colors.outlineVariant,
            alignSelf: "center",
            marginBottom: 8,
          }}
        />

        {phase === "offer" ? (
          <OfferStep mediumSelected={mediumSelected} />
        ) : null}
        {phase === "payment" ? <PaymentStep phoneDigits={phoneDigits} /> : null}
        {phase === "processing" ? <ProcessingStep frame={frame} /> : null}
        {phase === "success" ? <SuccessStep /> : null}
      </div>
    </div>
  );
};

function OfferStep({ mediumSelected }: { mediumSelected: boolean }) {
  return (
    <>
      <BalanceMini credits="1,250" />
      <h2
        style={{
          margin: "8px 0 0",
          fontSize: 36,
          fontWeight: 700,
          color: colors.onSurface,
        }}
      >
        Top-up Credits
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {packs.map((p) => {
          const selected = mediumSelected && p.id === "medium";
          return (
            <div
              key={p.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "22px 26px",
                borderRadius: 20,
                backgroundColor: colors.surfaceContainerLow,
                border: `2px solid ${
                  selected ? colors.bundleBorderSelected : colors.bundleBorder
                }`,
                boxShadow: selected ? `0 0 0 2px ${colors.primary}33` : "none",
              }}
            >
              <div>
                <p
                  style={{
                    margin: 0,
                    fontSize: 28,
                    fontWeight: 700,
                    color: selected ? colors.primaryContainer : colors.onSurface,
                  }}
                >
                  {p.label}
                </p>
                <p
                  style={{
                    margin: "4px 0 0",
                    fontSize: 22,
                    color: colors.onSurfaceVariant,
                  }}
                >
                  {p.credits} credits
                </p>
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: 28,
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
          marginTop: 12,
          height: 72,
          borderRadius: 999,
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
          fontSize: 28,
          fontWeight: 700,
        }}
      >
        Continue with Medium
      </div>
    </>
  );
}

function PaymentStep({ phoneDigits }: { phoneDigits: string }) {
  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 32, color: colors.onSurfaceVariant }}>←</span>
          <span
            style={{ fontSize: 32, fontWeight: 700, color: colors.onSurface }}
          >
            Medium
          </span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 18px",
            borderRadius: 999,
            backgroundColor: colors.surfaceContainerHigh,
            fontSize: 22,
            fontWeight: 600,
            color: colors.primary,
          }}
        >
          ✦ 1,250
        </div>
      </div>

      <Field label="Country" value="+254" chevron />
      <Field
        label="Phone Number"
        value={phoneDigits || "Enter number"}
        placeholder={!phoneDigits}
        focused
      />

      {phoneDigits.length >= 6 ? (
        <p
          style={{
            margin: 0,
            fontSize: 24,
            color: colors.primaryContainer,
            fontWeight: 600,
          }}
        >
          M-Pesa
        </p>
      ) : null}

      <div
        style={{
          marginTop: 8,
          borderRadius: 20,
          border: `1px solid ${colors.outlineVariant}`,
          backgroundColor: colors.surfaceContainerLow,
          padding: "22px 26px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          style={{ fontSize: 28, fontWeight: 700, color: colors.primaryContainer }}
        >
          KES
        </span>
        <span style={{ fontSize: 28, fontWeight: 600, color: colors.onSurface }}>
          $5.00
        </span>
      </div>

      <div
        style={{
          height: 72,
          borderRadius: 999,
          backgroundColor:
            phoneDigits.length >= 9
              ? colors.primaryContainer
              : colors.surfaceContainerHigh,
          color:
            phoneDigits.length >= 9
              ? colors.onPrimaryContainer
              : colors.onSurfaceVariant,
          opacity: phoneDigits.length >= 9 ? 1 : 0.55,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 28,
          fontWeight: 700,
          gap: 10,
        }}
      >
        🔒 Buy $5.00
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
        gap: 28,
        padding: "80px 20px",
        minHeight: 520,
      }}
    >
      <div
        style={{
          width: 96,
          height: 96,
          borderRadius: "50%",
          border: `6px solid ${colors.outlineVariant}`,
          borderTopColor: colors.primaryContainer,
          transform: `rotate(${(frame * 12) % 360}deg)`,
        }}
      />
      <p
        style={{
          margin: 0,
          fontSize: 36,
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
          fontSize: 26,
          color: colors.onSurfaceVariant,
          textAlign: "center",
        }}
      >
        Please authorize on your device
      </p>
    </div>
  );
}

function SuccessStep() {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 24,
        padding: "60px 20px 20px",
        minHeight: 520,
      }}
    >
      <div
        style={{
          width: 110,
          height: 110,
          borderRadius: "50%",
          backgroundColor: "rgba(69,223,164,0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 56,
          color: colors.success,
        }}
      >
        ✓
      </div>
      <p
        style={{
          margin: 0,
          fontSize: 36,
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
          fontSize: 26,
          color: colors.onSurfaceVariant,
          textAlign: "center",
          maxWidth: 520,
        }}
      >
        550 credits have been added to your balance.
      </p>
      <div
        style={{
          marginTop: 24,
          height: 64,
          width: "70%",
          borderRadius: 999,
          backgroundColor: colors.surfaceContainerHigh,
          color: colors.onSurface,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 28,
          fontWeight: 700,
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
        borderRadius: 20,
        backgroundColor: colors.surfaceContainerLow,
        border: `1px solid ${colors.outlineVariant}`,
        padding: "20px 24px",
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: 20,
          color: colors.onSurfaceVariant,
          textTransform: "uppercase" as const,
          letterSpacing: 0.5,
        }}
      >
        Current Balance
      </p>
      <p
        style={{
          margin: "8px 0 0",
          fontSize: 40,
          fontWeight: 700,
          color: colors.onSurface,
        }}
      >
        <span style={{ color: colors.primary, marginRight: 8, fontWeight: 700 }}>
          ✦
        </span>
        {credits}
      </p>
    </div>
  );
}

function Field({
  label,
  value,
  chevron,
  placeholder,
  focused,
}: {
  label: string;
  value: string;
  chevron?: boolean;
  placeholder?: boolean;
  focused?: boolean;
}) {
  return (
    <div>
      <p
        style={{
          margin: "0 0 10px",
          fontSize: 22,
          fontWeight: 600,
          color: colors.onSurfaceVariant,
        }}
      >
        {label}
      </p>
      <div
        style={{
          height: 72,
          borderRadius: 16,
          border: `2px solid ${
            focused ? colors.primaryContainer : colors.outlineVariant
          }`,
          backgroundColor: colors.surfaceContainerLow,
          padding: "0 22px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: 28,
          fontWeight: 600,
          color: placeholder ? colors.mutedDim : colors.onSurface,
        }}
      >
        <span>{value}</span>
        {chevron ? (
          <span style={{ color: colors.onSurfaceVariant }}>▾</span>
        ) : null}
      </div>
    </div>
  );
}
