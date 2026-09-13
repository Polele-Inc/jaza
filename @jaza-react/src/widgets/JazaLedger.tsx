'use client';

import {
  useCallback,
  useMemo,
  useRef,
  type ComponentType,
  type CSSProperties,
} from 'react';
import type { ClientLedgerPage } from '../api/types.js';
import { useInfiniteResource } from '../cache/useInfiniteResource.js';
import { Icon } from '../components/Icon.js';
import { LedgerListSkeleton } from '../components/LedgerListSkeleton.js';
import { t } from '../i18n/t.js';
import { useJaza } from '../provider/JazaContext.js';
import { formatCredits } from '../utils/helpers.js';
import {
  groupLedgerIntoSections,
  toLedgerItemProps,
  type JazaLedgerItemProps,
  type LedgerSection,
} from '../utils/ledgerItems.js';

export type { JazaLedgerItemProps, JazaLedgerItemStatus } from '../utils/ledgerItems.js';
export { toLedgerItemProps } from '../utils/ledgerItems.js';

export type JazaLedgerProps = {
  /** `scroll` = overflow list with infinite load; `preview` = static list for embedding */
  mode?: 'scroll' | 'preview';
  /** Max items for preview (default 5). Also used as page size for scroll. */
  limit?: number;
  style?: CSSProperties;
  ItemComponent?: ComponentType<JazaLedgerItemProps>;
};

function DefaultLedgerItem({
  title,
  subtitle,
  credits,
  direction,
  status,
  statusLabel,
}: JazaLedgerItemProps) {
  const { theme } = useJaza();
  const { colors, spacing, radius } = theme;
  const sign = direction === 'credit' ? '' : '−';

  const badgeTone =
    status === 'failure'
      ? { fg: colors.error, bg: colors.errorContainer }
      : status === 'pending'
        ? { fg: colors.warning, bg: colors.warningContainer }
        : { fg: colors.primary, bg: colors.primaryMuted };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: `${spacing.md}px ${spacing.md}px`,
        gap: spacing.md,
      }}
    >
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div
          style={{
            color: colors.onSurface,
            fontSize: 16,
            fontWeight: 600,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {title}
        </div>
        <div
          style={{
            color: colors.onSurfaceVariant,
            fontSize: 13,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {subtitle}
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: 4,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            color: colors.onSurface,
            fontSize: 16,
            fontWeight: 700,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {sign}
          {formatCredits(credits)}
        </div>
        <div
          style={{
            backgroundColor: badgeTone.bg,
            padding: `2px ${spacing.sm}px`,
            borderRadius: radius.md,
          }}
        >
          <span
            style={{
              color: badgeTone.fg,
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            {statusLabel}
          </span>
        </div>
      </div>
    </div>
  );
}

function LedgerSectionCard({
  section,
  ItemComponent,
  showDateLabel,
}: {
  section: LedgerSection;
  ItemComponent: ComponentType<JazaLedgerItemProps>;
  showDateLabel: boolean;
}) {
  const { theme } = useJaza();
  const { colors, spacing, radius } = theme;

  return (
    <div style={{ marginBottom: spacing.md }}>
      {showDateLabel ? (
        <div
          style={{
            color: colors.onSurfaceVariant,
            fontSize: 14,
            fontWeight: 500,
            marginBottom: spacing.sm,
          }}
        >
          {section.label}
        </div>
      ) : null}
      <div
        style={{
          backgroundColor: colors.surfaceContainer,
          borderRadius: radius.xl,
          overflow: 'hidden',
        }}
      >
        {section.items.map((item, index) => (
          <div key={item.id}>
            <ItemComponent {...item} />
            {index < section.items.length - 1 ? (
              <div
                style={{
                  height: 1,
                  backgroundColor: colors.outlineVariant,
                  margin: `0 ${spacing.md}px`,
                }}
              />
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function LedgerPlaceholder({
  title,
  message,
  onRetry,
}: {
  title: string;
  message: string;
  onRetry?: () => void;
}) {
  const { theme, locale } = useJaza();
  const { colors, spacing, radius } = theme;

  return (
    <div
      style={{
        backgroundColor: colors.surfaceContainer,
        borderRadius: radius.xl,
        padding: `${spacing.xl}px ${spacing.lg}px`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: spacing.sm,
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: radius.full,
          backgroundColor: `${colors.primary}18`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: spacing.xs,
        }}
      >
        <Icon name="bolt" size={28} color={colors.primary} />
      </div>
      <div style={{ color: colors.onSurface, fontSize: 16, fontWeight: 600 }}>
        {title}
      </div>
      <div
        style={{
          color: colors.onSurfaceVariant,
          fontSize: 14,
          lineHeight: '20px',
        }}
      >
        {message}
      </div>
      {onRetry ? (
        <button
          type="button"
          className="jaza-btn"
          style={{
            marginTop: spacing.sm,
            padding: `${spacing.sm}px ${spacing.lg}px`,
            borderRadius: radius.full,
            backgroundColor: colors.surfaceContainerHigh,
            color: colors.primary,
            fontWeight: 600,
            fontSize: 14,
          }}
          onClick={onRetry}
        >
          {t(locale, 'common.retry')}
        </button>
      ) : null}
    </div>
  );
}

export function JazaLedger({
  mode = 'preview',
  limit = 5,
  style,
  ItemComponent = DefaultLedgerItem,
}: JazaLedgerProps) {
  const { theme, client, status, ledgerRevision, locale, customerId } =
    useJaza();
  const { colors, spacing } = theme;

  const pageSize = mode === 'preview' ? limit : Math.max(limit, 20);
  const scrollRef = useRef<HTMLDivElement>(null);
  const cachePrefix = customerId ? `ledger:${customerId}:` : undefined;

  const getKey = useCallback(
    (index: number, previousPage: ClientLedgerPage | null) => {
      if (!customerId) return null;
      if (index === 0) return `ledger:${customerId}:`;
      const cursor = previousPage?.nextCursor;
      if (!cursor) return null;
      return `ledger:${customerId}:${cursor}`;
    },
    [customerId],
  );

  const fetchPage = useCallback(
    async (pageKey: string) => {
      const cursor = pageKey.split(':').slice(2).join(':') || undefined;
      return client.listLedger({
        limit: pageSize,
        cursor: cursor || undefined,
      });
    },
    [client, pageSize],
  );

  const {
    pages,
    setSize,
    error,
    isLoading,
    isLoadingMore,
    mutate,
  } = useInfiniteResource(getKey, fetchPage, {
    enabled: status === 'AUTHENTICATED' && Boolean(customerId),
    revision: ledgerRevision,
    cachePrefix,
    dedupingInterval: 2000,
  });

  const items = useMemo(
    () =>
      pages.flatMap((page) =>
        page.items.map((entry) =>
          toLedgerItemProps(entry, {
            subtitleStyle: mode === 'preview' ? 'date-time' : 'time',
            locale,
          }),
        ),
      ),
    [locale, mode, pages],
  );

  const nextCursor =
    pages.length > 0 ? pages[pages.length - 1]?.nextCursor ?? null : null;

  const onEndReached = useCallback(() => {
    if (mode !== 'scroll' || !nextCursor || isLoadingMore || isLoading) return;
    setSize((n) => n + 1);
  }, [isLoading, isLoadingMore, mode, nextCursor, setSize]);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el || mode !== 'scroll') return;
    const remaining = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (remaining < 120) {
      onEndReached();
    }
  }, [mode, onEndReached]);

  const displayItems = useMemo(
    () => (mode === 'preview' ? items.slice(0, limit) : items),
    [items, limit, mode],
  );

  const sections = useMemo(
    () => groupLedgerIntoSections(displayItems, locale),
    [displayItems, locale],
  );

  const showDateLabels = mode === 'scroll';

  const previewSections = useMemo((): LedgerSection[] => {
    if (mode !== 'preview' || displayItems.length === 0) return sections;
    return [
      {
        key: 'preview',
        label: '',
        items: displayItems,
      },
    ];
  }, [displayItems, mode, sections]);

  const listSections = mode === 'preview' ? previewSections : sections;

  const rootStyle: CSSProperties = {
    ...(mode === 'scroll' ? { flex: 1, minHeight: 0, height: '100%' } : {}),
    ...style,
  };

  if (isLoading && items.length === 0) {
    return (
      <div style={rootStyle}>
        <LedgerListSkeleton
          theme={theme}
          mode={mode}
          rows={mode === 'preview' ? Math.min(limit, 3) : 5}
          accessibilityLabel={t(locale, 'ledger.loading')}
        />
      </div>
    );
  }

  if (error && items.length === 0) {
    return (
      <div style={rootStyle}>
        <LedgerPlaceholder
          title={t(locale, 'ledger.errorTitle')}
          message={error.message || t(locale, 'ledger.loadError')}
          onRetry={() => void mutate()}
        />
      </div>
    );
  }

  if (displayItems.length === 0) {
    return (
      <div style={rootStyle}>
        <LedgerPlaceholder
          title={t(locale, 'ledger.emptyTitle')}
          message={t(locale, 'ledger.emptyMessage')}
        />
      </div>
    );
  }

  if (mode === 'preview') {
    return (
      <div style={rootStyle}>
        {listSections.map((section) => (
          <LedgerSectionCard
            key={section.key}
            section={section}
            ItemComponent={ItemComponent}
            showDateLabel={false}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      className="jaza-ledger-scroll"
      style={rootStyle}
      onScroll={handleScroll}
    >
      {listSections.map((section) => (
        <LedgerSectionCard
          key={section.key}
          section={section}
          ItemComponent={ItemComponent}
          showDateLabel={showDateLabels}
        />
      ))}
      {isLoadingMore ? (
        <div
          style={{
            padding: `${spacing.md}px 0`,
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <span
            className="jaza-spin"
            style={{
              width: 20,
              height: 20,
              borderRadius: '50%',
              border: `2px solid ${colors.surfaceContainerHighest}`,
              borderTopColor: colors.primary,
              display: 'inline-block',
              boxSizing: 'border-box',
            }}
            aria-label={t(locale, 'common.loading')}
          />
        </div>
      ) : null}
    </div>
  );
}
