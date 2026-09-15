import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import {
  colors,
  easeOutSoft,
  font,
  iconSize,
  phases,
  radius,
  spacing,
  type,
} from "../theme";
import { IconBolt } from "./Icons";

type NuruHomeProps = {
  balance: number;
  topUpPressed?: boolean;
  ledgerTopUp?: boolean;
};

export const NuruHome: React.FC<NuruHomeProps> = ({
  balance,
  topUpPressed,
  ledgerTopUp,
}) => {
  const frame = useCurrentFrame();
  const formatted = Math.round(balance).toLocaleString("en-US");

  // Idle breathing pulse on CTA (subtle) — remotion timing skill
  const breath = interpolate(
    Math.sin((frame / 30) * Math.PI * 2 * 0.35),
    [-1, 1],
    [1, 1.018],
  );
  const pressScale = topUpPressed ? 0.96 : breath;

  const topUpRow = ledgerTopUp
    ? (() => {
        const delay = phases.homeUpdated + 4;
        const opacity = interpolate(frame, [delay, delay + 16], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: easeOutSoft,
        });
        const translateY = interpolate(frame, [delay, delay + 16], [18, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: easeOutSoft,
        });
        return { opacity, translate: `0 ${translateY}px` };
      })()
    : { opacity: 0, translate: "0 12px" };

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: colors.background,
        paddingTop: spacing.md,
        paddingLeft: spacing.gutter,
        paddingRight: spacing.gutter,
        paddingBottom: spacing.xl,
        fontFamily: font,
        color: colors.onSurface,
        display: "flex",
        flexDirection: "column",
        gap: spacing.md,
      }}
    >
      <div>
        <p
          style={{
            margin: 0,
            fontSize: type.appName,
            color: colors.onSurfaceVariant,
            fontWeight: 500,
          }}
        >
          Nuru
        </p>
        <h1
          style={{
            margin: `${spacing.xs}px 0 0`,
            fontSize: type.greeting,
            fontWeight: 700,
            letterSpacing: -0.5,
          }}
        >
          Hi Amina
        </h1>
      </div>

      <div
        style={{
          borderRadius: radius.xl,
          backgroundColor: colors.surfaceContainer,
          padding: spacing.md,
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: type.label,
            color: colors.onSurfaceVariant,
            fontWeight: 500,
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
              fontSize: type.balance,
              fontWeight: 700,
              fontVariantNumeric: "tabular-nums",
              letterSpacing: -1,
              lineHeight: 1.05,
            }}
          >
            {formatted}
          </span>
        </div>

        <div
          style={{
            marginTop: spacing.md,
            paddingTop: spacing.md,
            paddingBottom: spacing.md,
            borderRadius: radius.full,
            backgroundColor: colors.primaryContainer,
            color: colors.onPrimaryContainer,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: spacing.sm,
            fontSize: type.body,
            fontWeight: 700,
            scale: pressScale,
            boxShadow: topUpPressed
              ? `0 0 0 ${Math.round(4 * 2.35)}px ${colors.primary}40`
              : "none",
          }}
        >
          Top up credits
          <span style={{ fontSize: type.label, fontWeight: 700 }}>→</span>
        </div>
      </div>

      <div style={{ flex: 1 }}>
        <p
          style={{
            margin: `0 0 ${spacing.sm}px`,
            fontSize: type.label,
            fontWeight: 600,
            color: colors.onSurfaceVariant,
          }}
        >
          Recent activity
        </p>

        {ledgerTopUp ? (
          <div style={{ opacity: topUpRow.opacity, translate: topUpRow.translate }}>
            <LedgerRow
              title="Medium pack"
              subtitle="M-Pesa · just now"
              amount="+500"
              credit
            />
          </div>
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
        paddingTop: spacing.md,
        paddingBottom: spacing.md,
        borderBottom: `1px solid ${colors.outlineVariant}`,
      }}
    >
      <div>
        <p
          style={{
            margin: 0,
            fontSize: type.body,
            fontWeight: 600,
          }}
        >
          {title}
        </p>
        <p
          style={{
            margin: `${spacing.xs}px 0 0`,
            fontSize: type.label,
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
            fontSize: type.body,
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
            marginTop: spacing.xs,
            fontSize: Math.round(12 * 2.35),
            fontWeight: 600,
            color: colors.primary,
            backgroundColor: "rgba(45,212,191,0.15)",
            padding: `${Math.round(4 * 2.35)}px ${Math.round(10 * 2.35)}px`,
            borderRadius: radius.full,
          }}
        >
          Completed
        </span>
      </div>
    </div>
  );
}

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
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  return from + (to - from) * t;
}
