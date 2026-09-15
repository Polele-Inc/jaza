import React from "react";
import { interpolate } from "remotion";
import { colors } from "../theme";

type NuruHomeProps = {
  balance: number;
  showTopUpHighlight?: boolean;
  ledgerTopUp?: boolean;
};

const font =
  'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

export const NuruHome: React.FC<NuruHomeProps> = ({
  balance,
  showTopUpHighlight,
  ledgerTopUp,
}) => {
  const formatted = Math.round(balance).toLocaleString("en-US");

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: colors.background,
        padding: "24px 40px 80px",
        fontFamily: font,
        color: colors.onSurface,
        display: "flex",
        flexDirection: "column",
        gap: 28,
      }}
    >
      <div>
        <p
          style={{
            margin: 0,
            fontSize: 28,
            color: colors.onSurfaceVariant,
            fontWeight: 500,
          }}
        >
          Nuru
        </p>
        <h1
          style={{
            margin: "8px 0 0",
            fontSize: 44,
            fontWeight: 700,
            letterSpacing: -0.5,
          }}
        >
          Hi Amina
        </h1>
      </div>

      {/* Balance card — mirrors JazaBalance */}
      <div
        style={{
          borderRadius: 28,
          backgroundColor: colors.surfaceContainer,
          border: `1px solid ${colors.outlineVariant}`,
          padding: "32px 36px",
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 24,
            color: colors.onSurfaceVariant,
            fontWeight: 500,
            letterSpacing: 0.4,
            textTransform: "uppercase" as const,
          }}
        >
          Current Balance
        </p>
        <div
          style={{
            marginTop: 12,
            display: "flex",
            alignItems: "baseline",
            gap: 14,
          }}
        >
          <span style={{ fontSize: 36, color: colors.primary, fontWeight: 700 }}>
            ✦
          </span>
          <span
            style={{
              fontSize: 64,
              fontWeight: 700,
              fontVariantNumeric: "tabular-nums",
              letterSpacing: -1,
            }}
          >
            {formatted}
          </span>
          <span
            style={{
              fontSize: 28,
              color: colors.onSurfaceVariant,
              fontWeight: 500,
            }}
          >
            credits
          </span>
        </div>

        <div
          style={{
            marginTop: 28,
            height: 72,
            borderRadius: 999,
            backgroundColor: colors.primaryContainer,
            color: colors.onPrimaryContainer,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 28,
            fontWeight: 700,
            transform: showTopUpHighlight ? "scale(0.97)" : "scale(1)",
            boxShadow: showTopUpHighlight
              ? `0 0 0 6px ${colors.primary}55`
              : "none",
          }}
        >
          Top up credits →
        </div>
      </div>

      {/* Recent activity */}
      <div style={{ flex: 1 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <span
            style={{
              fontSize: 22,
              fontWeight: 600,
              color: colors.onSurfaceVariant,
              letterSpacing: 1,
              textTransform: "uppercase" as const,
            }}
          >
            Recent activity
          </span>
        </div>

        {ledgerTopUp ? (
          <LedgerRow
            title="Medium pack"
            subtitle="M-Pesa · just now"
            amount="+500"
            credit
          />
        ) : null}
        <LedgerRow
          title="Send Message"
          subtitle="Purchase · today"
          amount="−5"
        />
        <LedgerRow
          title="AI Chat"
          subtitle="Purchase · yesterday"
          amount="−10"
        />
      </div>
    </div>
  );
};

function LedgerRow({
  title,
  subtitle,
  amount,
  credit,
}: {
  title: string;
  subtitle: string;
  amount: string;
  credit?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "20px 0",
        borderBottom: `1px solid ${colors.outlineVariant}`,
      }}
    >
      <div>
        <p style={{ margin: 0, fontSize: 28, fontWeight: 600 }}>{title}</p>
        <p
          style={{
            margin: "6px 0 0",
            fontSize: 22,
            color: colors.onSurfaceVariant,
          }}
        >
          {subtitle}
        </p>
      </div>
      <div style={{ textAlign: "right" as const }}>
        <p
          style={{
            margin: 0,
            fontSize: 28,
            fontWeight: 700,
            color: credit ? colors.success : colors.onSurface,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {amount}
        </p>
        <span
          style={{
            display: "inline-block",
            marginTop: 6,
            fontSize: 18,
            fontWeight: 600,
            color: colors.primary,
            backgroundColor: "rgba(45,212,191,0.15)",
            padding: "4px 12px",
            borderRadius: 999,
          }}
        >
          Completed
        </span>
      </div>
    </div>
  );
}

/** Interpolate balance for success tween */
export function tweenBalance(
  frame: number,
  fromFrame: number,
  duration: number,
  from: number,
  to: number,
): number {
  const t = interpolate(frame, [fromFrame, fromFrame + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return from + (to - from) * t;
}
